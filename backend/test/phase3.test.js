const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { once } = require("node:events");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { test } = require("node:test");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "parkfair-phase3-synthetic-test-signing-value";

const app = require("../src/app");
const Flat = require("../src/models/Flat");
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");
const Cycle = require("../src/models/ParkingCycle");
const Slot = require("../src/models/ParkingSlot");
const { AdminAudit, NotificationOutbox } = require("../src/models/AllocationWorkflow");
const { PushInstallation } = require("../src/models/PushFoundation");
const { AuthSession } = require("../src/models/AuthSession");
const { runDueForTesting } = require("../src/services/scheduledActivation");
const { dispatchSynthetic } = require("../src/services/mockPush");
const { societyDay } = require("../src/services/cycleSelection");

const port = process.env.PARKFAIR_TEST_MONGO_PORT;
test("Phase 3 workflows use synthetic replica-set fixtures", { skip: !port && "Set PARKFAIR_TEST_MONGO_PORT." }, async (t) => {
  assert.match(port, /^\d{1,5}$/);
  const db = "parkfair_test_" + randomUUID().replaceAll("-", "");
  const uri = `mongodb://127.0.0.1:${port}/${db}?directConnection=true`;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const server = app.listen(0, "127.0.0.1");
  t.after(async () => { await new Promise((resolve) => server.close(resolve)); await mongoose.disconnect(); });
  await once(server, "listening");
  assert.ok((await mongoose.connection.db.admin().command({ hello: 1 })).setName);
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  const api = `http://127.0.0.1:${server.address().port}/api`;
  async function req(path, method = "GET", data, token, headers) {
    const raw = typeof data === "string";
    const response = await fetch(api + path, {
      method,
      headers: { ...(data !== undefined && { "Content-Type": raw ? "text/csv" : "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }), ...headers },
      body: data === undefined ? undefined : raw ? data : JSON.stringify(data),
    });
    return { status: response.status, body: await response.json() };
  }
  const password = "phase3-throwaway-password";
  const hash = await bcrypt.hash(password, 4);
  const [one, two] = await Flat.create([{ flatNumber: "001" }, { flatNumber: "002" }]);
  const [admin, resident, other] = await User.create([
    { username: "phase-three-admin", password: hash, role: "ADMIN" },
    { username: "phase-three-resident", password: hash, flatId: one.id },
    { username: "phase-three-other", password: hash, flatId: two.id },
  ]);
  const [car] = await Vehicle.create([
    { flatId: one.id, vehicleNumber: "FIX-A" }, { flatId: two.id, vehicleNumber: "FIX-B" },
  ]);
  await Slot.create([
    { slotNumber: "A-12", side: "A", maxCapacity: 1, displayOrder: 1 },
    { slotNumber: "C-03", side: "OUTSIDE", maxCapacity: 2, displayOrder: 2 },
  ]);
  const login = (user) => req("/auth/login", "POST", { identifier: user.username, password }, undefined,
    { "X-ParkFair-Session": "native" }).then(({ body }) => body);
  const adminToken = (await login(admin)).token;
  const userSession = await login(resident);
  const otherSession = await login(other);
  const call = (path, method = "GET", data, headers) => req(path, method, data, adminToken, headers);
  const start = +societyDay();
  const create = (label, offset) => Cycle.create({
    cycleName: label, startDate: new Date(start + offset * 86400000),
    endDate: new Date(start + (offset + 2) * 86400000), durationDays: 3,
  });
  const cycle = await create("Coverage fixture", 5);
  const next = await create("Worker fixture", 12);
  const final = await create("Cancellation fixture", 18);
  const rows = [{ flatNumber: "001", slotNumber: "A-12", vehicleNumber: "FIX-A" }];
  const exclusions = [{ flatNumber: "002", reason: "Synthetic policy exception" }];
  const draft = (doc, chart = rows, reviewed = exclusions) => call("/allocation-drafts", "POST", {
    cycleId: doc.id, rows: chart, exclusions: reviewed,
  }).then(({ body }) => body.draft._id);
  const review = (id, action, revision = 1, headers) =>
    call(`/allocation-drafts/${id}/${action}`, "POST", { revision }, headers);
  const publish = async (doc, key) => {
    const id = await draft(doc);
    assert.equal((await review(id, "validate")).body.draft.status, "VALIDATED");
    assert.equal((await review(id, "approve")).status, 200);
    const outcome = await review(id, "publish", 1, { "Idempotency-Key": `phase-three-publication-${key}` });
    assert.equal(outcome.status, 201, JSON.stringify(outcome.body));
    return outcome.body.publication;
  };
  const schedule = (doc, pub, approved = true) => call(`/cycles/${doc.id}/activation-schedules`, "POST",
    { publicationId: pub._id, approved });

  await t.test("omitted eligible flats are visible and block approval until an exclusion is reviewed", async () => {
    const id = await draft(cycle, rows, []);
    const pre = await call(`/allocation-drafts/${id}/coverage`);
    assert.equal(pre.body.coverage.totalEligibleFlats, 2);
    assert.equal(pre.body.coverage.totalAssignedFlats, 1);
    assert.deepEqual(pre.body.coverage.unassignedEligibleFlats, ["002"]);
    assert.deepEqual(pre.body.coverage.capacity.OUTSIDE, { total: 2, occupied: 0, available: 2 });
    assert.equal((await review(id, "validate")).body.draft.status, "DRAFT");
    assert.equal((await review(id, "approve")).status, 409);
    await call(`/allocation-drafts/${id}`, "PUT", { revision: 1, rows, exclusions });
    const checked = await review(id, "validate", 2);
    assert.equal(checked.body.draft.status, "VALIDATED");
    assert.deepEqual(checked.body.coverage.excludedFlats, exclusions);
    assert.equal((await review(id, "approve", 2)).status, 200);
  });

  await t.test("preview flags unfamiliar headers and explicit mapping preserves provenance", async () => {
    const id = await draft(cycle, [], []);
    const bytes = "Apartment,Bay,Registration\n001,A-12,FIX-A";
    const file = { "X-ParkFair-Filename": "synthetic.csv" };
    const path = `/allocation-drafts/${id}`;
    const preview = await call(path + "/import-preview", "POST", bytes, file);
    assert.ok(preview.body.columns.every((column) => !column.recognized));
    assert.ok(preview.body.importIssues.some((issue) => issue.code === "MISSING_COLUMN"));
    assert.equal((await call(path)).body.draft.revision, 1);
    const outcome = await call(path + "/import", "POST", bytes, {
      ...file, "If-Match": '"1"', "X-ParkFair-Columns": '{"flatNumber":1,"slotNumber":2,"vehicleNumber":3}',
    });
    assert.equal(outcome.status, 201);
    assert.equal(outcome.body.version.rows[0].flatNumber, "001");
    assert.equal(outcome.body.version.rows[0].row, 2);
  });

  let effectivePublication;
  let workerJob;
  await t.test("scheduled activation requires explicit administrator approval and rejects superseded publications", async () => {
    const superseded = await publish(cycle, "first");
    assert.equal((await schedule(cycle, superseded, false)).status, 400);
    assert.equal((await req(`/cycles/${cycle.id}/activation-schedules`, "POST",
      { publicationId: superseded._id, approved: true }, userSession.token)).status, 403);
    const scheduled = (await schedule(cycle, superseded)).body.schedule;
    assert.equal(Date.parse(scheduled.dueAt), +cycle.startDate - 330 * 60000);
    assert.deepEqual(await runDueForTesting(() => Date.parse(scheduled.dueAt) - 1000), []);
    assert.equal((await Cycle.findById(cycle.id)).status, "PLANNED");
    await publish(cycle, "superseding");
    const obsolete = await call(`/cycles/${cycle.id}/status`, "PUT", {
      status: "ACTIVE", publicationId: superseded._id,
    });
    assert.equal(obsolete.status, 409);
    assert.match(obsolete.body.message, /superseded/);
    const [ignored] = await runDueForTesting(() => Date.parse(scheduled.dueAt));
    assert.equal(ignored.status, "SUPERSEDED");
    assert.equal((await Cycle.findById(cycle.id)).status, "PLANNED");

    const stopped = await publish(final, "stopped");
    const job = (await schedule(final, stopped)).body.schedule;
    assert.equal((await call(`/cycles/${final.id}/activation-schedules/${job._id}`, "DELETE")).body.schedule.status, "CANCELLED");
  });

  await t.test("activation retries inventory conflicts, then runs exactly once", async () => {
    effectivePublication = await publish(next, "worker");
    workerJob = (await schedule(next, effectivePublication)).body.schedule;
    const repeats = (await schedule(next, effectivePublication)).body.schedule;
    assert.equal(repeats._id, workerJob._id);
    const activateAt = Date.parse(workerJob.dueAt);
    await call(`/vehicles/${car.id}`, "PUT", { isActive: false });
    const worker = [
      'const mongoose = require("mongoose");',
      'const { runDueForTesting } = require("./src/services/scheduledActivation");',
      'mongoose.connect(process.env.FIXTURE_URI).then(async () => {',
      '  process.stdout.write(JSON.stringify(await runDueForTesting(() => Number(process.env.FIXTURE_NOW))));',
      '}).finally(() => mongoose.disconnect()).catch(() => { process.exitCode = 1; });',
    ].join("\n");
    const result = await promisify(execFile)(process.execPath, ["-e", worker], {
      cwd: require("node:path").resolve(__dirname, ".."),
      env: { ...process.env, FIXTURE_URI: uri, FIXTURE_NOW: String(activateAt) },
    });
    const [failed] = JSON.parse(result.stdout);
    assert.equal(failed.status, "RETRY");
    assert.equal(failed.lastError, "ACTIVATION_REVALIDATION");
    assert.equal((await Cycle.findById(next.id)).status, "PLANNED");
    await call(`/vehicles/${car.id}`, "PUT", { isActive: true });
    const concurrent = await Promise.all([
      runDueForTesting(() => Date.parse(failed.nextAttemptAt)), runDueForTesting(() => Date.parse(failed.nextAttemptAt)),
    ]);
    assert.equal(concurrent.flat().filter((record) => record.status === "ACTIVATED").length, 1);
    assert.equal((await Cycle.findById(next.id)).status, "ACTIVE");
    assert.equal(await AdminAudit.countDocuments({ entityId: next.id, action: "CYCLE_ACTIVATED" }), 1);
    assert.deepEqual(await runDueForTesting(() => Date.parse(failed.nextAttemptAt)), []);
  });

  await t.test("mock push is scoped, deduplicated and unlinked on logout", async () => {
    const body = { installationId: "mock-fixture-android", platform: "android", token: "synthetic-installation-fixture" };
    assert.equal((await req("/resident/mock-push-installation", "POST", body, userSession.token)).status, 201);
    assert.equal((await req("/resident/mock-push-installation", "POST", body, otherSession.token)).status, 409);
    const event = await NotificationOutbox.findOne({ publicationId: effectivePublication._id });
    const outcomes = `/allocation-drafts/publications/${next.id}/${effectivePublication._id}/notifications`;
    assert.equal((await req(outcomes, "GET", undefined, userSession.token)).status, 403);
    assert.deepEqual((await call(outcomes)).body.counts, [{ _id: "PENDING", count: 1 }]);
    assert.equal(await dispatchSynthetic(event.eventId, admin.id), null);
    const execution = new Date(Date.parse(workerJob.dueAt) + 5 * 60000);
    // Move the fixture family expiry beyond the injected execution clock.
    await AuthSession.updateOne({ _id: userSession.sessionId }, { expiresAt: new Date(+execution + 86400000) });
    const sent = await dispatchSynthetic(event.eventId, admin.id, execution);
    assert.deepEqual(sent, { state: "DELIVERED", installations: 1 });
    const summary = (await call(outcomes)).body;
    assert.equal(summary.mode, "SIMULATED_ONLY");
    assert.deepEqual(summary.counts, [{ _id: "DELIVERED", count: 1 }]);
    assert.equal(await dispatchSynthetic(event.eventId, admin.id, execution), null);
    assert.equal((await req("/resident/inbox", "GET", undefined, userSession.token)).body.events.length, 1);
    assert.equal((await req("/resident/inbox", "GET", undefined, otherSession.token)).body.events.length, 0);
    assert.equal((await req("/auth/logout", "POST", { refreshToken: userSession.refreshToken }, undefined,
      { "X-ParkFair-Session": "native" })).status, 200);
    assert.equal(await PushInstallation.countDocuments({ sessionId: userSession.sessionId }), 0);
  });
});
