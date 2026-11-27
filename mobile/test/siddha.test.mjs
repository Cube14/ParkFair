import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { positionConflict } from '../src/parkingCompatibility.ts';

const layout = JSON.parse(readFileSync(new URL('../src/data/parkingStudy.json', import.meta.url), 'utf8'));
const address = name => {
  const entry = layout.positions.find(item => item.name === name);
  return { slotNumber: name, physicalSlotNumber: entry.physical, position: entry.position };
};

test('the native schematic has twenty real addresses and equal internal footprints', () => {
  const indoor = layout.bays.filter(bay => bay.area === 'Covered');
  assert.equal(indoor.length, 8);
  assert.equal(new Set(indoor.map(bay => `${bay.width}x${bay.depth}`)).size, 1);
  assert.deepEqual(indoor.filter(bay => bay.flex).map(bay => bay.name), ['SLOT 1', 'SLOT 2', 'SLOT 5', 'SLOT 6']);
  assert.equal(new Set(layout.positions.map(item => item.name)).size, 20);
  assert.ok(!layout.positions.some(item => item.name === 'OUT-5'));
  const inner = layout.positions.find(item => item.name === 'SLOT 1A');
  const outer = layout.positions.find(item => item.name === 'SLOT 1B');
  assert.equal(inner.x + inner.width, outer.x);
});

test('the cutaway keeps every internal bay under Siddha-A and groups the outdoor bays outside the gate', () => {
  const { bays, building, otherBuilding, aisle, gate, entrance, walkway, drawing } = layout;
  const right = rect => rect.x + rect.width;
  const bottom = rect => rect.y + rect.depth;
  const indoor = bays.filter(bay => bay.area === 'Covered');
  const outdoor = bays.filter(bay => bay.area === 'Outdoor');
  assert.equal(layout.approvedFor3D, false);
  assert.equal(gate.x + gate.width / 2, drawing.width / 2);
  assert.equal(entrance.x, gate.x);
  assert.equal(aisle.x, gate.x);
  assert.ok(aisle.x >= right(building) && right(aisle) < otherBuilding.x);
  assert.ok(indoor.every(bay => bay.x >= building.x && bay.y >= building.y &&
    right(bay) <= right(building) && bottom(bay) <= bottom(building)));
  const roadside = indoor.slice(0, 6);
  assert.ok(roadside.every((bay, i) => !i || bay.y > roadside[i - 1].y));
  assert.ok(roadside.every(bay => bay.x === roadside[0].x && right(bay) <= aisle.x));
  const lower = indoor.find(bay => bay.name === 'SLOT 7'), upper = indoor.find(bay => bay.name === 'SLOT 8');
  assert.ok(right(lower) < roadside[0].x && right(upper) < roadside[0].x);
  assert.equal(lower.y, roadside.at(-1).y);
  assert.equal(upper.y, roadside[0].y);
  assert.deepEqual(outdoor.map(bay => bay.name), ['OUT-1', 'OUT-2', 'OUT-3', 'OUT-4']);
  assert.ok(outdoor.every((bay, i) => right(bay) < gate.x && bottom(bay) < gate.y &&
    bottom(bay) < walkway.y && bay.depth > bay.width && (!i || bay.x < outdoor[i - 1].x)));
  assert.ok(bottom(walkway) < building.y && right(walkway) <= aisle.x);
});

test('chart selectors explain size and conflicting claims without blocking compatible positions', () => {
  assert.equal(positionConflict(address('SLOT 1A'), 'SMALL', ['SLOT 1B']), undefined);
  assert.match(positionConflict(address('SLOT 1A'), 'BIG', []), /whole slot/);
  assert.match(positionConflict(address('SLOT 1'), 'SMALL', []), /Choose A or B/);
  assert.match(positionConflict(address('SLOT 1'), 'BIG', ['slot 1a']), /conflict/);
  assert.match(positionConflict(address('SLOT 1B'), 'SMALL', ['SLOT 1']), /conflict/);
  assert.match(positionConflict(address('SLOT 1B'), 'SMALL', ['SLOT 1B']), /already used/);
  assert.match(positionConflict(address('OUT-2'), null, []), /Classify/);
  assert.equal(positionConflict(address('OUT-2'), 'BIG', []), undefined);
});
