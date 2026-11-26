const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { once } = require("node:events");
const { test } = require("node:test");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "parkfair-phase2-synthetic-tests-key";
process.env.WEB_ORIGINS = "https://parkfair.test";
process.env.WHATSAPP_ENABLED = "true";
process.env.WHATSAPP_SEND_APPROVED = "true";

const app = require("../src/app");
const Flat = require("../src/models/Flat");
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");
const Cycle = require("../src/models/ParkingCycle");
const Assignment = require("../src/models/ParkingAssignment");
const Slot = require("../src/models/ParkingSlot");
const { AllocationDraft, AllocationPublication, NotificationOutbox, AdminAudit } =
  require("../src/models/AllocationWorkflow");
const { AuthSession, RefreshToken } = require("../src/models/AuthSession");
const Rotation = require("../src/models/Rotation");
const LegacyAllocation = require("../src/models/Allocation");
const CreditLedger = require("../src/models/CreditLedger");
const { reconcileLegacyFairness } = require("../src/services/fairnessReconciliation");
const { dispatchMock } = require("../src/services/notificationOutbox");
const { parseAllocationFile } = require("../src/services/allocationImport");

const csv = "text/csv";
const xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const fixture = (name) => readFileSync(join(__dirname, "fixtures", name));

test("import format safeguards reject invalid encoding and malformed archives", async () => {
  await assert.rejects(parseAllocationFile(Buffer.from([0xff, 0xfe]), csv, "wrong.csv"), { status: 400 });
  await assert.rejects(parseAllocationFile(Buffer.from("PK\u0003\u0004invalid-archive"), xlsx, "wrong.xlsx"), { status: 400 });
  await assert.rejects(parseAllocationFile(Buffer.from("a,b\n1,2"), xlsx, "wrong.csv"), { status: 415 });
});

const port = process.env.PARKFAIR_TEST_MONGO_PORT;
test("allocation and session HTTP workflows on an isolated replica set", {
  skip: !port && "Set PARKFAIR_TEST_MONGO_PORT for isolated replica-set tests.",
}, async (t) => {
  assert.match(port, /^\d{1,5}$/);
  const dbName = `parkfair_test_${randomUUID().replaceAll("-", "")}`;
  await mongoose.connect(`mongodb://127.0.0.1:${port}/${dbName}?directConnection=true`, { serverSelectionTimeoutMS: 5000 });
  const server = app.listen(0, "127.0.0.1");
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  });
  await once(server, "listening");
  assert.ok((await mongoose.connection.db.admin().command({ hello: 1 })).setName);
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));

  const api = `http://127.0.0.1:${server.address().port}/api`;
  async function req(path, method = "GET", { token, data, raw, headers = {} } = {}) {
    const response = await fetch(api + path, {
      method, headers: {
        ...token && { Authorization: `Bearer ${token}` },
        ...data !== undefined && { "Content-Type": "application/json" }, ...headers,
      },
      body: raw ?? (data === undefined ? undefined : JSON.stringify(data)),
    });
    const type = response.headers.get("content-type");
    return { status: response.status, headers: response.headers,
      body: type?.includes("json") ? await response.json() : await response.text() };
  }

  const password = "synthetic-testing-password";
  const hash = await bcrypt.hash(password, 4);
  const [one, two, three] = await Flat.create([{ flatNumber: "001" }, { flatNumber: "002" }, { flatNumber: "003" }]);
  const [admin, userA, userB] = await User.create([
    { username: "fixture-admin", role: "ADMIN", password: hash },
    { username: "fixture-resident-a", flatId: one._id, password: hash },
    { username: "fixture-resident-b", flatId: two._id, password: hash },
  ]);
  const [carA, carB] = await Vehicle.create([
    { vehicleNumber: "SYNTH-CAR-A", flatId: one._id },
    { vehicleNumber: "SYNTH-CAR-B", flatId: two._id },
  ]);
  const [inside, outside] = await Slot.create([
    { slotNumber: "S1", side: "A", displayOrder: 1 },
    { slotNumber: "S2", side: "OUTSIDE", displayOrder: 2 },
  ]);
  const date = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
  const cycleData = (cycleName, start, end) => ({
    cycleName, startDate: date(start), endDate: date(end), durationDays: end - start + 1,
  });
  const [past, effective, future, alternate, rollback] = await Cycle.create([
    { ...cycleData("Past", -19, -15), status: "COMPLETED" },
    { ...cycleData("Currently effective", -2, 2), status: "ACTIVE" },
    cycleData("Next", 3, 6), cycleData("Alternate", 7, 10), cycleData("Rollback", 11, 14),
  ]);
  await Assignment.create([
    { flatId: one._id, cycleId: effective._id, slotId: inside._id, vehicleId: carA._id, parkingType: "INSIDE" },
    { flatId: two._id, cycleId: past._id, slotId: outside._id, vehicleId: carB._id, parkingType: "OUTSIDE" },
  ]);

  const web = { Origin: process.env.WEB_ORIGINS, "X-ParkFair-Session": "web" };
  const native = { "X-ParkFair-Session": "native" };
  const login = (user, headers) => req("/auth/login", "POST", { data: { identifier: user.username, password }, headers });
  const adminLogin = await login(admin);
  const residentLogin = await login(userA);
  const residentB = await login(userB);
  assert.equal(adminLogin.status, 200);
  const adminCall = (path, method, options = {}) => req(path, method, { ...options, token: adminLogin.body.token });
  const residentCall = (path, token = residentLogin.body.token) => req(path, "GET", { token });
  const newDraft = (cycle, rows) => adminCall("/allocation-drafts", "POST", { data: { cycleId: cycle.id, rows } });
  const action = (id, name, revision, headers) =>
    adminCall(`/allocation-drafts/${id}/${name}`, "POST", { data: { revision }, headers });
  const importParams = (name, revision) => ({
    headers: { "Content-Type": name.endsWith(".csv") ? csv : xlsx, "If-Match": String(revision), "X-ParkFair-Filename": name },
  });
  const imported = (id, filename, revision) =>
    adminCall(`/allocation-drafts/${id}/import`, "POST", { raw: fixture(filename), ...importParams(filename, revision) });
  const edit = (id, revision, rows) => adminCall(`/allocation-drafts/${id}`, "PUT", { data: { revision, rows } });
  const rows = [{ flatNumber: "001", slotNumber: "S1", vehicleNumber: "SYNTH-CAR-A" },
    { flatNumber: "002", slotNumber: "S2", vehicleNumber: "SYNTH-CAR-B" }];
  const keyFor = (key) => ({ "Idempotency-Key": `parkfair-test-${key}` });

  await t.test("admin-only CSV/XLSX imports preserve leading zeros and report malformed input", async () => {
    const draftId = (await newDraft(future)).body.draft._id;
    const path = `/allocation-drafts/${draftId}/import`;
    const file = { raw: fixture("allocation-template.csv"), ...importParams("allocation-template.csv", 1) };
    assert.equal((await req(path, "POST", file)).status, 401);
    assert.equal((await req(path, "POST", { ...file, token: residentLogin.body.token })).status, 403);
    const csvResponse = await imported(draftId, "allocation-template.csv", 1);
    assert.equal(csvResponse.status, 201);
    assert.equal(csvResponse.body.version.rows[0].flatNumber, "001");
    const xlsxResponse = await imported(draftId, "allocation-template.xlsx", 2);
    assert.equal(xlsxResponse.status, 201);
    assert.equal(xlsxResponse.body.version.rows[0].flatNumber, "001");
    assert.equal((await action(draftId, "validate", 3)).body.draft.status, "VALIDATED");
    const bad = await adminCall(path, "POST", { raw: Buffer.from("PK\u0003\u0004broken"), ...importParams("invalid.xlsx", 3) });
    assert.equal(bad.status, 400);
    assert.equal((await imported(draftId, "invalid-allocation.xlsx", 3)).status, 201);
    const validation = await action(draftId, "validate", 4);
    const codes = validation.body.issues.map((entry) => entry.code);
    for (const code of ["FORMULA_CELL", "DUPLICATE_FLAT", "SLOT_CAPACITY", "VEHICLE_OWNERSHIP"]) assert.ok(codes.includes(code), code);
    assert.ok(validation.body.issues.filter(({ row }) => row !== null).every(({ row, field, message }) => row === 3 && field && message));

    const missing = await adminCall(path, "POST", {
      raw: Buffer.from("flat_number,notes\n001,example"), ...importParams("missing.csv", 4),
    });
    assert.equal(missing.status, 201);
    assert.ok(missing.body.version.importIssues.some((entry) => entry.code === "MISSING_COLUMN" && entry.field === "slotNumber"));
    const changes = await adminCall(`/allocation-drafts/${draftId}/compare?from=2&to=4`);
    assert.equal(changes.body.changes[0].row, 3);
    assert.equal(await Assignment.countDocuments({ cycleId: future.id }), 0);
    assert.equal((await residentCall("/resident/dashboard")).body.cycle.id, effective.id);
    assert.equal((await residentCall("/resident/schedule")).body.next, null);
  });

  await t.test("concurrent draft edits, approval invalidation and safe CSV export", async () => {
    const id = (await newDraft(future, rows)).body.draft._id;
    assert.equal((await action(id, "publish", 1, keyFor("unapproved"))).status, 409);
    assert.equal((await action(id, "approve", 1)).status, 409);
    await action(id, "validate", 1);
    assert.equal((await action(id, "approve", 1)).body.draft.status, "APPROVED");
    const formulaText = [{ ...rows[0], notes: "=1+1" }, rows[1]];
    const competing = await Promise.all([edit(id, 1, formulaText), edit(id, 1, formulaText)]);
    assert.deepEqual(competing.map(({ status }) => status).sort(), [200, 409]);
    const head = await adminCall(`/allocation-drafts/${id}`);
    assert.equal(head.body.draft.revision, 2);
    assert.equal(head.body.draft.status, "DRAFT");
    assert.equal(head.body.draft.approvedAt, undefined);
    assert.equal((await action(id, "publish", 1, keyFor("invalidated"))).status, 409);
    assert.equal((await action(id, "publish", 2, keyFor("still-unapproved"))).status, 409);
    assert.match((await adminCall(`/allocation-drafts/${id}/export.csv`)).body, /"'=1\+1"/);
  });

  const prepare = async (cycle) => {
    const result = await newDraft(cycle, rows);
    assert.equal(result.status, 201);
    const id = result.body.draft._id;
    const review = await action(id, "validate", 1);
    assert.equal(review.body.draft.status, "VALIDATED", JSON.stringify(review.body));
    const approval = await action(id, "approve", 1);
    assert.equal(approval.body.draft.status, "APPROVED");
    return id;
  };

  await t.test("publish is idempotent, leaves future and corrections inactive, and isolates resident reads", async () => {
    const id = await prepare(future);
    const competingDraft = await prepare(future);
    const key = keyFor("concurrent");
    const responses = await Promise.all([action(id, "publish", 1, key), action(id, "publish", 1, key)]);
    assert.deepEqual(responses.map(({ status }) => status).sort(), [200, 201]);
    const published = responses[0].body.publication;
    assert.equal(published._id, responses[1].body.publication._id);
    assert.equal((await action(competingDraft, "publish", 1, keyFor("stale-head"))).body.code, "STALE_REVIEW");
    assert.equal((await action(competingDraft, "publish", 1, key)).status, 409);
    assert.equal(await AllocationPublication.countDocuments({ cycleId: future.id }), 1);
    assert.equal(await Assignment.countDocuments({ publicationId: published._id }), 2);
    assert.equal(await NotificationOutbox.countDocuments({ publicationId: published._id, state: "PENDING" }), 2);
    assert.equal(await AdminAudit.countDocuments({ entityId: published._id }), 1);
    assert.equal((await action(id, "publish", 1, key)).status, 200);
    assert.equal((await adminCall(`/cycles/${future.id}/status`, "PUT", { data: { status: "ACTIVE" } })).status, 409);
    assert.equal((await Cycle.findById(future.id)).status, "PLANNED");

    const [scheduleA, scheduleB, historyA, historyB] = await Promise.all([
      residentCall("/resident/schedule"), residentCall("/resident/schedule?flatId=" + one.id, residentB.body.token),
      residentCall("/resident/history"), residentCall("/resident/history?flatId=" + one.id, residentB.body.token),
    ]);
    assert.equal(scheduleA.body.current.cycle.id, effective.id);
    assert.equal(scheduleA.body.next.vehicle.number, "SYNTH-CAR-A");
    assert.equal(scheduleB.body.next.vehicle.number, "SYNTH-CAR-B");
    assert.equal(scheduleB.body.current, null);
    assert.equal(historyA.body.history.length, 0);
    assert.equal(historyB.body.history[0].cycle.id, past.id);
    assert.equal((await residentCall(`/allocation-drafts/${id}`)).status, 403);

    const correction = await prepare(effective);
    const correctionResponse = await action(correction, "publish", 1, keyFor("active-correction"));
    assert.equal(correctionResponse.status, 201);
    assert.equal((await residentCall("/resident/schedule", residentB.body.token)).body.current, null);
    const activate = () => adminCall(`/cycles/${effective.id}/status`, "PUT", { data: { status: "ACTIVE" } });
    await adminCall(`/vehicles/${carA.id}`, "PUT", { data: { isActive: false } });
    assert.equal((await activate()).status, 409);
    await adminCall(`/vehicles/${carA.id}`, "PUT", { data: { isActive: true } });
    const activated = await Promise.all([activate(), activate()]);
    assert.ok(activated.every(({ status }) => status === 200));
    assert.equal(await AdminAudit.countDocuments({ entityId: effective.id, action: "CYCLE_ACTIVATED" }), 1);
    assert.equal((await residentCall("/resident/schedule", residentB.body.token)).body.current.vehicle.number, "SYNTH-CAR-B");

    assert.equal((await residentCall("/resident/history")).body.history[0].cycle.id, effective.id);
    const snapshot = await adminCall(`/allocation-drafts/publications/${future.id}/${published._id}`);
    assert.equal(snapshot.body.assignments.length, 2);
    assert.ok(!Object.hasOwn(snapshot.body.publication, "key"));
    const event = await NotificationOutbox.findOne({ publicationId: published._id });
    const mock = await Promise.all([dispatchMock(event.eventId, "UNKNOWN"), dispatchMock(event.eventId, "UNKNOWN")]);
    assert.equal(mock.filter(Boolean).length, 1);
    assert.equal(mock.find(Boolean).state, "AMBIGUOUS");
    assert.equal(await dispatchMock(event.eventId, "ACCEPTED"), null);
    assert.equal((await adminCall("/notifications/test", "POST", { data: { phone: "0000000000" } })).status, 503);
  });

  await t.test("concurrent overlapping cycles cannot both publish", async () => {
    const [a, b] = await Cycle.create([cycleData("Collision A", 32, 36), cycleData("Collision B", 34, 39)]);
    const idA = await prepare(a);
    const idB = await prepare(b);
    const results = await Promise.all([
      action(idA, "publish", 1, keyFor("overlap-a")), action(idB, "publish", 1, keyFor("overlap-b")),
    ]);
    assert.deepEqual(results.map(({ status }) => status).sort(), [201, 409]);
    const rejected = results.find(({ status }) => status === 409);
    assert.ok(rejected.body.issues.some(({ code }) => code === "OVERLAPPING_CYCLE"));
    assert.equal(await AllocationPublication.countDocuments({ cycleId: { $in: [a._id, b._id] } }), 1);
  });

  await t.test("outbox failure rolls back publication, and legacy endpoints cannot bypass approval", async () => {
    const id = await prepare(rollback);
    const database = mongoose.connection.db;
    const collection = NotificationOutbox.collection.collectionName;
    await database.command({ collMod: collection, validator: { attempts: { $lt: -1 } } });
    try {
      assert.equal((await action(id, "publish", 1, keyFor("rollback"))).status, 500);
    } finally {
      await database.command({ collMod: collection, validator: {} });
    }
    assert.equal(await AllocationPublication.countDocuments({ draftId: id }), 0);
    assert.equal(await Assignment.countDocuments({ cycleId: rollback.id }), 0);
    assert.equal((await AllocationDraft.findById(id)).status, "APPROVED");
    assert.equal((await action(id, "publish", 1, keyFor("rollback"))).status, 201);

    for (const target of [effective, future, rollback]) {
      assert.equal((await adminCall("/assignments", "POST", { data: {
        cycleId: target.id, slotId: inside.id, vehicleId: carA.id, flatId: one.id,
      } })).status, 409);
    }
    assert.equal((await adminCall("/cycles", "POST", { data: { ...cycleData("Bypass", 7, 10), status: "ACTIVE" } })).status, 409);
    const [deleted, linked] = await Promise.all([
      adminCall(`/flats/${three.id}`, "DELETE"),
      adminCall("/vehicles", "POST", { data: { flatId: three.id, vehicleNumber: "SYNTH-CAR-C" } }),
    ]);
    assert.ok([[200, 404], [409, 201]].some(([a, b]) => a === deleted.status && b === linked.status));
    if (linked.status === 201) {
      const cleanup = await Vehicle.updateOne({ flatId: three.id }, { isActive: false });
      assert.equal(cleanup.modifiedCount, 1);
    }
  });

  await t.test("inventory edits and overlap invalidate approval and validation", async () => {
    const id = await prepare(alternate);
    assert.equal((await adminCall(`/vehicles/${carA.id}`, "PUT", { data: { isActive: false } })).status, 200);
    const stale = await action(id, "publish", 1, keyFor("inventory-stale"));
    assert.equal(stale.status, 409);
    assert.ok(stale.body.issues.some(({ code }) => code === "INACTIVE_VEHICLE"));
    await adminCall(`/vehicles/${carA.id}`, "PUT", { data: { isActive: true } });
    const overlap = await Cycle.create(cycleData("Overlapping", 4, 8));
    const overlapId = (await newDraft(overlap, rows)).body.draft._id;
    assert.ok((await action(overlapId, "validate", 1)).body.issues.some(({ code }) => code === "OVERLAPPING_CYCLE"));
    const invalid = await Cycle.create({ ...cycleData("Invalid", 20, 23), durationDays: 10 });
    const invalidId = (await newDraft(invalid, rows)).body.draft._id;
    assert.ok((await action(invalidId, "validate", 1)).body.issues.some(({ code }) => code === "INVALID_CYCLE_DATES"));
  });

  await t.test("fairness reconciliation reads legacy and physical rows without writes", async () => {
    const rotation = await Rotation.create({
      rotationNumber: 1, startDate: past.startDate, endDate: past.endDate,
    });
    await LegacyAllocation.create([
      { rotationId: rotation._id, flatId: two._id, vehicleId: carB._id,
        parkingType: "INSIDE", startDate: past.startDate, endDate: past.endDate },
      { rotationId: rotation._id, flatId: one._id, vehicleId: carA._id,
        parkingType: "OUTSIDE", startDate: past.startDate, endDate: past.endDate },
    ]);
    await CreditLedger.create({ flatId: two._id, insideRotations: 1, outsideRotations: 0, balanceScore: -1 });
    assert.deepEqual(await reconcileLegacyFairness(), {
      physicalRows: 1, fairnessRows: 2, equivalent: 0, typeDifferences: 1,
      unlinkedFairnessRows: 1, ambiguousFairnessRows: 0, unmatchedPhysicalRows: 0,
      ledgers: 1, inconsistentLegacyScores: 0,
    });
    assert.equal(await LegacyAllocation.countDocuments(), 2);
    assert.equal(await CreditLedger.countDocuments(), 1);
  });

  await t.test("web cookies enforce origin, rotate securely and support server-side logout", async () => {
    assert.equal((await login(userA, { ...web, Origin: "https://unapproved.invalid" })).status, 403);
    const result = await login(userA, web);
    assert.equal(result.status, 200);
    assert.equal(result.body.refreshToken, undefined);
    const header = result.headers.get("set-cookie");
    for (const marker of ["__Host-parkfair-refresh=", "HttpOnly", "Secure", "SameSite=Strict", "Path=/"]) assert.ok(header.includes(marker));
    const cookie = header.split(";")[0];
    assert.equal((await req("/auth/refresh", "POST", { headers: { Cookie: cookie } })).status, 403);
    assert.equal((await req("/auth/refresh", "POST", { headers: { ...web, Origin: "https://unapproved.invalid", Cookie: cookie } })).status, 403);
    const refreshed = await req("/auth/refresh", "POST", { headers: { ...web, Cookie: cookie } });
    assert.equal(refreshed.status, 200);
    assert.notEqual(refreshed.headers.get("set-cookie").split(";")[0], cookie);
    assert.ok((await req("/auth/sessions", "GET", { token: refreshed.body.token })).body.sessions.length);
    const logout = await req("/auth/logout", "POST", { headers: { ...web, Cookie: refreshed.headers.get("set-cookie").split(";")[0] } });
    assert.equal(logout.status, 200);
    assert.equal((await req("/auth/me", "GET", { token: refreshed.body.token })).status, 401);
    assert.equal(await AdminAudit.countDocuments({ reason: "LOGOUT", entityId: result.body.sessionId }), 1);
  });

  await t.test("native refresh hash, rotation, concurrency replay, expiration and account revocation", async () => {
    const started = await login(userA, native);
    assert.equal(started.status, 200);
    assert.match(started.body.refreshToken, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(await RefreshToken.exists({ _id: started.body.refreshToken }), null);
    const tokenInfo = jwt.decode(started.body.token);
    assert.equal(tokenInfo.exp - tokenInfo.iat, 900);
    const rotate = (value) => req("/auth/refresh", "POST", { headers: native, data: { refreshToken: value } });
    const rotations = await Promise.all([rotate(started.body.refreshToken), rotate(started.body.refreshToken)]);
    assert.deepEqual(rotations.map(({ status }) => status).sort(), [200, 401]);
    const winner = rotations.find(({ status }) => status === 200).body;
    assert.notEqual(winner.refreshToken, started.body.refreshToken);
    assert.equal((await rotate(winner.refreshToken)).status, 401);
    assert.equal((await req("/auth/me", "GET", { token: winner.token })).status, 401);
    assert.equal(await AdminAudit.countDocuments({ reason: "REPLAY", entityId: started.body.sessionId }), 1);

    const expired = (await login(userA, native)).body;
    await AuthSession.updateOne({ _id: expired.sessionId }, { $set: { expiresAt: new Date(0) } });
    assert.equal((await rotate(expired.refreshToken)).status, 401);
    const disabled = (await login(userA, native)).body;
    await adminCall(`/auth/resident/${userA.id}/toggle`, "PUT");
    assert.equal((await rotate(disabled.refreshToken)).status, 401);
    assert.equal((await req("/auth/me", "GET", { token: disabled.token })).status, 403);
    await adminCall(`/auth/resident/${userA.id}/toggle`, "PUT");
    const reset = (await login(userA, native)).body;
    await adminCall(`/auth/resident/${userA.id}/password`, "PUT", { data: { password: "synthetic-new-testing-password" } });
    assert.equal((await rotate(reset.refreshToken)).status, 401);
    const own = (await login(userB, native)).body;
    assert.equal((await req(`/auth/sessions/${own.sessionId}`, "DELETE", { token: adminLogin.body.token })).status, 404);
    assert.equal((await req(`/auth/sessions/${own.sessionId}`, "DELETE", { token: own.token })).status, 200);
    assert.equal((await rotate(own.refreshToken)).status, 401);
  });
});
