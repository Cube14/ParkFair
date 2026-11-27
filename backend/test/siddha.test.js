const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { once } = require("node:events");
const { test } = require("node:test");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

Object.assign(process.env, { NODE_ENV: "test", JWT_SECRET: randomUUID(), WHATSAPP_ENABLED: "false", WHATSAPP_SEND_APPROVED: "false" });
const app = require("../src/app");
const Flat = require("../src/models/Flat");
const Slot = require("../src/models/ParkingSlot");
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");
const Assignment = require("../src/models/ParkingAssignment");
const { NotificationOutbox } = require("../src/models/AllocationWorkflow");
const { setSiddhaInventory } = require("../src/services/siddhaInventory");
const { societyDay } = require("../src/services/cycleSelection");
const port = process.env.PARKFAIR_TEST_MONGO_PORT;

test("Siddha-A inventory and allocation workflow on an isolated replica set", { skip: !port }, async t => {
  await mongoose.connect(`mongodb://127.0.0.1:${port}/parkfair_test_${randomUUID().replaceAll("-", "")}?directConnection=true`);
  t.after(() => mongoose.disconnect());
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  await Slot.create({ slotNumber: "HISTORIC", side: "A", displayOrder: 1 });
  await setSiddhaInventory(true);
  await setSiddhaInventory(false);
  const original = await Slot.findOne({ slotNumber: "SLOT 1" });
  assert.equal(original.isActive, false);
  await setSiddhaInventory(true);
  assert.equal(String((await Slot.findOne({ slotNumber: "SLOT 1A" })).physicalSlotId), String(original._id));
  assert.equal(await Slot.countDocuments({}), 22);

  const flats = await Flat.create(["601", "602", "603"].map(flatNumber => ({ flatNumber })));
  const cars = await Vehicle.create(flats.map((flat, i) => ({ flatId: flat._id, vehicleNumber: `SYNTH-${i}`, size: i === 2 ? "BIG" : "SMALL" })));
  const password = randomUUID();
  const hash = await bcrypt.hash(password, 4);
  await User.create([{ username: "qa-admin", password: hash, role: "ADMIN" },
    ...flats.map((flat, i) => ({ username: `qa-${i}`, password: hash, role: "RESIDENT", flatId: flat._id }))]);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function request(path, { token, body, raw, method = body || raw ? "POST" : "GET", headers = {} } = {}) {
    const response = await fetch(base + path, { method, headers: { ...(token && { Authorization: `Bearer ${token}` }),
      ...(body && { "Content-Type": "application/json" }), ...headers }, body: body ? JSON.stringify(body) : raw });
    return { status: response.status, body: await response.json() };
  }
  async function login(identifier) {
    const result = await request("/auth/login", { body: { identifier, password } });
    assert.equal(result.status, 200);
    return result.body.token;
  }
  const admin = await login("qa-admin"), resident = await login("qa-0");
  const adminRequest = (path, options) => request(path, { token: admin, ...options });
  const today = societyDay();
  const date = days => new Date(+today + 86400000 * days).toISOString().slice(0, 10);
  async function cycle(name, offset) {
    const result = await adminRequest("/cycles", { body: { cycleName: name, startDate: date(offset), endDate: date(offset), durationDays: 1 } });
    assert.equal(result.status, 201);
    return result.body.data._id;
  }
  const slots = await adminRequest("/slots");
  assert.equal(slots.body.data.length, 20);
  assert.equal((await adminRequest("/slots?context=testing")).body.data[0].slotNumber, "OUT-5");
  assert.equal((await request("/slots?context=testing", { token: resident })).status, 403);
  assert.equal((await adminRequest("/vehicles", { body: { flatId: flats[0]._id, vehicleNumber: "UNCLASSIFIED" } })).status, 400);

  await t.test("legacy writers serialize full versus tandem and reject duplicates and wrong sizes", async () => {
    const cycleId = await cycle("Concurrency", 2);
    const slot = async number => (await Slot.findOne({ slotNumber: number }))._id;
    const put = async (i, number) => adminRequest("/assignments", { body: { cycleId, slotId: await slot(number), flatId: flats[i]._id, vehicleId: cars[i]._id } });
    assert.equal((await put(2, "SLOT 1B")).status, 409);
    assert.equal((await put(0, "SLOT 1")).status, 409);
    assert.equal((await put(0, "OUT-5")).status, 409);
    assert.equal((await put(0, "SLOT 1A")).status, 201);
    const raced = await Promise.all([put(2, "SLOT 1"), put(1, "SLOT 1B"), put(1, "SLOT 1A")]);
    assert.deepEqual(raced.map(entry => entry.status), [409, 201, 409]);
    const second = await cycle("Full and split race", 3);
    const compete = async (i, number) => adminRequest("/assignments", { body: { cycleId: second,
      slotId: await slot(number), flatId: flats[i]._id, vehicleId: cars[i]._id } });
    assert.deepEqual((await Promise.all([compete(0, "SLOT 2A"), compete(2, "SLOT 2")])).map(result => result.status).sort(), [201,409]);
  });

  await t.test("draft conflicts, publication, effective capacity and resident labels", async () => {
    const cycleId = await cycle("Siddha current", 0);
    const draft = await adminRequest("/allocation-drafts", { body: { cycleId } });
    const draftPath = "/allocation-drafts/" + draft.body.draft._id;
    const csv = names => "flat_number,slot_number,vehicle_number\n" + names.map((name, i) => `${601 + i},${name},SYNTH-${i}`).join("\n");
    const upload = (revision, names) => adminRequest(draftPath + "/import", { raw: csv(names), headers: {
      "Content-Type": "text/csv", "X-ParkFair-Filename": "positions.csv", "If-Match": `"${revision}"`,
    } });
    assert.equal((await upload(1, ["SLOT 1A", "OUT-5", "SLOT 1"])).status, 201);
    const invalid = await adminRequest(draftPath + "/validate", { body: { revision: 2 } });
    assert.ok(invalid.body.issues.some(issue => issue.code === "TEST_POSITION"));
    assert.ok(invalid.body.issues.some(issue => issue.code === "TANDEM_CONFLICT"));
    assert.equal((await upload(2, ["SLOT 1A", "SLOT 1B", "SLOT 2"])).status, 201);
    const valid = await adminRequest(draftPath + "/validate", { body: { revision: 3 } });
    assert.deepEqual(valid.body.issues, []);
    assert.deepEqual(valid.body.coverage.capacity, { INSIDE: { total: 11, occupied: 3, available: 8 }, OUTSIDE: { total: 4, occupied: 0, available: 4 } });
    assert.equal((await adminRequest(draftPath + "/approve", { body: { revision: 3 } })).status, 200);
    const published = await adminRequest(draftPath + "/publish", { body: { revision: 3 }, headers: { "Idempotency-Key": "siddha-test-publication" } });
    assert.equal(published.status, 201);
    const publicationId = published.body.publication._id;
    assert.equal((await adminRequest(`/cycles/${cycleId}/status`, { method: "PUT", body: { status: "ACTIVE", publicationId } })).status, 200);
    assert.equal((await request("/resident/dashboard", { token: resident })).body.parking.slot, "SLOT 1A");
    assert.equal((await request("/resident/schedule", { token: resident })).body.current.parking.slot, "SLOT 1A");
    const capacity = (await adminRequest("/dashboard")).body.data;
    assert.equal(capacity.totalCapacity, 15);
    assert.equal(capacity.maximumCapacity, 16);
    assert.equal(await NotificationOutbox.countDocuments({ publicationId }), 3);
    await assert.rejects(setSiddhaInventory(false), /addresses are referenced/);

    // Exercise read-side isolation even for an invalid historical record inserted outside the API.
    const corruptCycle = await cycle("Corrupt historical fixture", -1);
    await mongoose.model("ParkingCycle").updateOne({ _id: corruptCycle }, { status: "COMPLETED" });
    const testSlot = await Slot.findOne({ slotNumber: "OUT-5" });
    await Assignment.create({ cycleId: corruptCycle, flatId: flats[0]._id, vehicleId: cars[0]._id,
      slotId: testSlot._id, parkingType: "OUTSIDE", assignmentStatus: "COMPLETED" });
    assert.equal((await request("/resident/history", { token: resident })).body.history.length, 0);
  });
});
