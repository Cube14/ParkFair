const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { once } = require("node:events");
const { after, before, test } = require("node:test");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "synthetic-parkfair-integration-key";
process.env.WEB_ORIGINS = "https://test.parkfair.invalid";
process.env.WHATSAPP_ENABLED = "false";
process.env.WHATSAPP_SEND_APPROVED = "false";
process.env.ENABLE_DEV_RESETS = "false";

const app = require("../src/app");
const validateEnv = require("../src/config/env");
const Flat = require("../src/models/Flat");
const User = require("../src/models/User");
const Vehicle = require("../src/models/Vehicle");
const ParkingCycle = require("../src/models/ParkingCycle");
const ParkingSlot = require("../src/models/ParkingSlot");
const ParkingAssignment = require("../src/models/ParkingAssignment");
const Rotation = require("../src/models/Rotation");
const Allocation = require("../src/models/Allocation");
const CreditLedger = require("../src/models/CreditLedger");
const { currentCycle } = require("../src/services/cycleSelection");
const { sendMessage } = require("../src/services/whatsappService");

let server;
let base;
async function request(path, { method = "GET", token, body, headers } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json(), headers: response.headers };
}

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

test("liveness passes and readiness fails without a database", async () => {
  assert.deepEqual((await request("/health")).body, { success: true, status: "ok" });
  assert.equal((await request("/health/ready")).status, 503);
});

test("environment validation names missing settings without emitting values", () => {
  assert.throws(() => validateEnv({ MONGODB_URI: "synthetic-invalid-value", JWT_SECRET: "short" }), {
    message: "Invalid or missing environment settings: MONGODB_URI, JWT_SECRET.",
  });
  assert.equal(validateEnv({ MONGODB_URI: "mongodb://localhost/example", JWT_SECRET: process.env.JWT_SECRET }), 5000);
  const devEnv = {
    NODE_ENV: "development",
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_URI: "mongodb://127.0.0.1:27017/parkfair_dev?directConnection=true",
  };
  assert.equal(validateEnv(devEnv, { localDevelopment: true }), 5000);
  assert.throws(() => validateEnv({ ...devEnv, MONGODB_URI: "mongodb+srv://example.invalid/parkfair" },
    { localDevelopment: true }), { message: "Invalid or missing environment settings: MONGODB_URI." });
});

test("every private namespace is protected before data access", async () => {
  const paths = [
    ["GET", "/auth/me"], ["POST", "/auth/resident"], ["PUT", "/auth/resident/fake/password"],
    ["GET", "/resident/dashboard"], ["GET", "/flats"], ["GET", "/vehicles"], ["GET", "/layouts/test"],
    ["GET", "/cycles"], ["GET", "/slots"], ["GET", "/dashboard"], ["GET", "/notifications/preview"],
    ["DELETE", "/allocations/reset"], ["DELETE", "/assignments/reset"],
  ];
  for (const [method, path] of paths) {
    assert.equal((await request(path, { method })).status, 401, `${method} ${path}`);
  }
});

test("JSON errors and login validation are sanitized and CORS is explicit", async () => {
  const marker = "synthetic-invalid-identifier";
  const response = await request("/auth/login", {
    method: "POST", body: { identifier: { $ne: marker }, password: "password" },
  });
  assert.equal(response.status, 400);
  assert.ok(!JSON.stringify(response.body).includes(marker));
  const malformed = await fetch(base + "/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
  });
  assert.equal(malformed.status, 400);
  const approved = await request("/health", { headers: { Origin: process.env.WEB_ORIGINS } });
  assert.equal(approved.headers.get("Access-Control-Allow-Origin"), process.env.WEB_ORIGINS);
  const unapproved = await request("/health", { headers: { Origin: "https://other.invalid" } });
  assert.equal(unapproved.headers.get("Access-Control-Allow-Origin"), null);
});

test("WhatsApp stays unloaded and disabled in test and development even with both flags", async () => {
  assert.equal(Object.keys(require.cache).some((file) => file.includes("whatsapp-web.js")), false);
  process.env.WHATSAPP_ENABLED = process.env.WHATSAPP_SEND_APPROVED = "true";
  try {
    for (const mode of ["test", "development"]) {
      process.env.NODE_ENV = mode;
      await assert.rejects(sendMessage("0000000000", "synthetic"), { status: 503 });
      assert.equal(Object.keys(require.cache).some((file) => file.includes("whatsapp-web.js")), false);
    }
  } finally {
    process.env.WHATSAPP_ENABLED = process.env.WHATSAPP_SEND_APPROVED = "false";
  }
});

const port = process.env.PARKFAIR_TEST_MONGO_PORT;
test("HTTP and MongoDB replica set integration", { skip: !port && "Set PARKFAIR_TEST_MONGO_PORT to a disposable local replica set port." }, async (t) => {
  assert.match(port, /^\d{1,5}$/);
  const dbName = `parkfair_test_${randomUUID().replaceAll("-", "")}`;
  await mongoose.connect(`mongodb://127.0.0.1:${port}/${dbName}?directConnection=true`, {
    serverSelectionTimeoutMS: 5000,
  });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  assert.ok(hello.setName, "Use a disposable MongoDB replica set");
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));

  const password = "synthetic-password";
  const hash = await bcrypt.hash(password, 4);
  const [flat, otherFlat, accountFlat] = await Flat.create([
    { flatNumber: "TEST-A", ownerName: "Fixture A" },
    { flatNumber: "TEST-B", ownerName: "Fixture B" },
    { flatNumber: "TEST-C", ownerName: "Fixture C" },
  ]);
  const admin = await User.create({ username: "fixture-admin", role: "ADMIN", password: hash });
  const resident = await User.create({
    username: "fixture-resident", role: "RESIDENT", flatId: flat._id, password: hash,
  });
  const { body: { token: adminToken } } = await request("/auth/login", {
    method: "POST", body: { identifier: admin.username, password },
  });
  const { body: { token: residentToken } } = await request("/auth/login", {
    method: "POST", body: { identifier: flat.flatNumber, password },
  });
  assert.ok(adminToken && residentToken);

  const adminRequest = (path, options) => request(path, { token: adminToken, ...options });
  const residentRequest = (path, options) => request(path, { token: residentToken, ...options });

  await t.test("readiness, role checks use current DB role, and resets are disabled", async () => {
    assert.equal((await request("/health/ready")).status, 200);
    assert.equal((await residentRequest("/dashboard")).status, 403);
    assert.equal((await residentRequest("/auth/resident", {
      method: "POST", body: { flatId: String(accountFlat._id), password },
    })).status, 403);
    assert.equal((await adminRequest("/resident/dashboard")).status, 403);
    const elevatedClaim = jwt.sign({ id: resident._id, role: "ADMIN" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    assert.equal((await request("/dashboard", { token: elevatedClaim })).status, 403);
    for (const resource of ["assignments", "allocations"]) {
      assert.equal((await adminRequest(`/${resource}/reset`, { method: "DELETE" })).status, 403);
    }
  });

  await t.test("resident creation, login and /me exclude private fields", async () => {
    const created = await adminRequest("/auth/resident", {
      method: "POST", body: { flatId: String(accountFlat._id), password },
    });
    assert.equal(created.status, 201);
    const loggedIn = await request("/auth/login", {
      method: "POST", body: { identifier: accountFlat.flatNumber, password },
    });
    assert.equal(loggedIn.status, 200);
    const me = await request("/auth/me", { token: loggedIn.body.token });
    assert.equal(me.status, 200);
    for (const result of [created, loggedIn, me]) {
      assert.equal(result.body.user.role, "RESIDENT");
      assert.ok(!Object.hasOwn(result.body.user, "password"));
      assert.ok(!Object.hasOwn(result.body.user, "sessionVersion"));
      assert.ok(!JSON.stringify(result.body).includes(hash));
    }
    assert.equal((await User.findById(created.body.user.id)).password, undefined);
    assert.equal((await adminRequest(`/auth/resident/${admin._id}/toggle`, { method: "PUT" })).status, 404);
  });

  await t.test("disabled account, reactivation and password reset invalidate prior tokens", async () => {
    const toggle = () => adminRequest(`/auth/resident/${resident._id}/toggle`, { method: "PUT" });
    assert.equal((await toggle()).body.isActive, false);
    assert.equal((await residentRequest("/auth/me")).status, 403);
    assert.equal((await request("/auth/login", {
      method: "POST", body: { identifier: flat.flatNumber, password },
    })).status, 403);
    assert.equal((await toggle()).body.isActive, true);
    assert.equal((await residentRequest("/auth/me")).status, 401);
    const beforeReset = await request("/auth/login", {
      method: "POST", body: { identifier: flat.flatNumber, password },
    });
    assert.equal((await adminRequest(`/auth/resident/${resident._id}/password`, {
      method: "PUT", body: { password: "synthetic-new-password" },
    })).status, 200);
    assert.equal((await request("/auth/me", { token: beforeReset.body.token })).status, 401);
  });

  const day = 86400000;
  const now = Date.now();
  const date = (offset) => new Date(now + offset * day).toISOString().slice(0, 10);
  const [old, cycle, future] = await ParkingCycle.create([
    { cycleName: "Fixture past", startDate: date(-10), endDate: date(-7), durationDays: 4, status: "ACTIVE" },
    { cycleName: "Fixture current", startDate: date(-2), endDate: date(2), durationDays: 5, status: "ACTIVE" },
    { cycleName: "Fixture future", startDate: date(3), endDate: date(5), durationDays: 3, status: "PLANNED" },
  ]);
  const [vehicle, otherVehicle] = await Vehicle.create([
    { vehicleNumber: "TEST-VEH-A", flatId: flat._id },
    { vehicleNumber: "TEST-VEH-B", flatId: otherFlat._id },
  ]);
  const [slot, outside] = await ParkingSlot.create([
    { slotNumber: "TEST-IN", side: "A", maxCapacity: 1, displayOrder: 1 },
    { slotNumber: "TEST-OUT", side: "OUTSIDE", maxCapacity: 3, displayOrder: 2 },
  ]);
  const create = (parent, target, residentFlat, residentVehicle) => adminRequest("/assignments", {
    method: "POST", body: {
      cycleId: String(parent._id), slotId: String(target._id), flatId: String(residentFlat._id),
      vehicleId: String(residentVehicle._id),
    },
  });

  const staging = await ParkingCycle.create({
    cycleName: "Fixture staging", startDate: date(15), endDate: date(20), durationDays: 6,
  });
  const historicalAssignment = (parent, target, residentFlat, residentVehicle) => ({
    cycleId: parent._id, slotId: target._id, flatId: residentFlat._id, vehicleId: residentVehicle._id,
    parkingType: target.side === "OUTSIDE" ? "OUTSIDE" : "INSIDE",
  });
  await ParkingAssignment.create([
    historicalAssignment(cycle, slot, flat, vehicle),
    historicalAssignment(cycle, outside, otherFlat, otherVehicle),
    historicalAssignment(old, outside, flat, vehicle),
  ]);

  await t.test("invalid writes, capacity and duplicate flat checks protect competing requests", async () => {
    const invalid = await adminRequest("/vehicles", { method: "POST", body: { vehicleNumber: { $ne: "" } } });
    assert.equal(invalid.status, 400);
    const injected = await adminRequest(`/flats/${flat._id}`, {
      method: "PUT", body: { $set: { isActive: false } },
    });
    assert.equal(injected.status, 400);
    assert.equal((await create(staging, slot, flat, otherVehicle)).status, 400);

    const results = await Promise.all([create(staging, slot, flat, vehicle), create(staging, slot, otherFlat, otherVehicle)]);
    assert.deepEqual(results.map(({ status }) => status).sort(), [201, 409]);
    const winnerA = results[0].status === 201;
    const winner = winnerA ? flat : otherFlat;
    const winnerVehicle = winnerA ? vehicle : otherVehicle;
    const loser = winnerA ? otherFlat : flat;
    const loserVehicle = winnerA ? otherVehicle : vehicle;
    assert.equal((await create(staging, outside, winner, winnerVehicle)).status, 409);
    assert.equal((await create(staging, outside, loser, loserVehicle)).status, 201);
    const loserAssignment = await ParkingAssignment.findOne({ cycleId: staging._id, flatId: loser._id });
    assert.equal((await adminRequest(`/assignments/${loserAssignment._id}`, {
      method: "PUT", body: { slotId: String(slot._id) },
    })).status, 409);
  });

  await t.test("batch rollback and clone transfer only the chosen cycle assignments", async () => {
    const bulk = await adminRequest("/assignments/bulk", {
      method: "POST", body: {
        cycleId: String(future._id), assignments: [
          { flatNumber: flat.flatNumber, slotNumber: slot.slotNumber },
          { flatNumber: otherFlat.flatNumber, slotNumber: slot.slotNumber },
        ],
      },
    });
    assert.equal(bulk.status, 409);
    assert.equal(await ParkingAssignment.countDocuments({ cycleId: future._id }), 0);
    const clone = await adminRequest(`/cycles/${cycle._id}/clone`, {
      method: "POST", body: { cycleName: "Fixture clone", startDate: date(6), endDate: date(8), durationDays: 3 },
    });
    assert.equal(clone.status, 201);
    assert.equal(clone.body.assignmentsCopied, 2);
    assert.equal(clone.body.newCycle.status, "PLANNED");
    assert.equal(await ParkingAssignment.countDocuments({ cycleId: clone.body.newCycle._id }), 2);
  });

  await t.test("resident, occupancy and preview use the same current cycle and exclude past records", async () => {
    assert.equal((await create(old, outside, flat, vehicle)).status, 409);
    assert.equal((await create(future, outside, flat, vehicle)).status, 201);
    assert.equal((await currentCycle()).id, cycle.id);
    const { body: { token } } = await request("/auth/login", {
      method: "POST", body: { identifier: flat.flatNumber, password: "synthetic-new-password" },
    });
    const dashboard = await request("/resident/dashboard", { token });
    assert.equal(dashboard.body.cycle.id, cycle.id);
    assert.equal(dashboard.body.vehicle.id, vehicle.id);
    assert.equal(dashboard.body.resident.flatNumber, flat.flatNumber);
    const occupancy = await adminRequest("/dashboard");
    assert.equal(occupancy.body.data.activeCycleAssignments, 2);
    assert.equal(occupancy.body.data.insideAssignments, 1);
    assert.equal(occupancy.body.data.outsideAssignments, 1);
    assert.equal(occupancy.body.data.occupancyPercentage, 50);
    const summary = await adminRequest(`/cycles/${cycle.id}/summary`);
    assert.equal(summary.body.data.occupancyPercentage, "100.00");
    const matrix = await adminRequest(`/cycles/${cycle.id}/matrix`);
    assert.deepEqual(matrix.body.capacity, { "TEST-IN": 1, OUTSIDE: 3 });
    assert.equal(matrix.body.data["TEST-IN"].length, 1);
    assert.equal(matrix.body.data.OUTSIDE.length, 1);
    const preview = await adminRequest("/notifications/preview");
    assert.equal(preview.body.cycleId, cycle.id);
    assert.equal(preview.body.total, 2);
    assert.doesNotMatch(preview.body.data[0].message, /tomorrow|16 Jul 2026/);
    const upcoming = await adminRequest(`/notifications/preview?cycleId=${future.id}`);
    assert.equal(upcoming.body.cycleId, future.id);
    assert.equal(upcoming.body.total, 1);
    for (const endpoint of ["test", "single", "send-active"]) {
      assert.equal((await adminRequest(`/notifications/${endpoint}`, { method: "POST" })).status, 503);
    }
  });

  await t.test("repeat activation is safe and parking history protects linked records", async () => {
    for (let i = 0; i < 2; i++) {
      const activate = await adminRequest(`/cycles/${cycle.id}/status`, {
        method: "PUT", body: { status: "ACTIVE" },
      });
      assert.equal(activate.status, 200);
      assert.equal(activate.body.data.status, "ACTIVE");
    }
    assert.equal((await ParkingCycle.findById(old.id)).status, "COMPLETED");
    for (const [resource, recordId] of [["cycles", cycle.id], ["flats", flat.id], ["vehicles", vehicle.id]]) {
      assert.equal((await adminRequest(`/${resource}/${recordId}`, { method: "DELETE" })).status, 409, resource);
    }
  });

  await t.test("concurrent fairness generation creates one rotation and one complete set of allocations", async () => {
    const extra = await Flat.create(Array.from({ length: 7 }, (_, index) => ({ flatNumber: `EXTRA-${index}` })));
    await Vehicle.create(extra.map((entry, index) => ({ flatId: entry._id, vehicleNumber: `EXTRA-CAR-${index}` })));
    const generate = () => adminRequest("/allocations/generate", { method: "POST" });
    const results = await Promise.all([generate(), generate()]);
    assert.deepEqual(results.map(({ status }) => status).sort(), [201, 409]);
    assert.equal(await Rotation.countDocuments(), 1);
    assert.equal(await Allocation.countDocuments(), 9);
    assert.equal(await CreditLedger.countDocuments(), 9);
  });
});

test("login enforces rate limiting", async () => {
  let response;
  for (let index = 0; index < 21; index++) {
    response = await request("/auth/login", { method: "POST", body: {} });
    if (response.status === 429) break;
  }
  assert.equal(response.status, 429);
  assert.ok(response.headers.get("Retry-After"));
});
