import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { positionConflict } from '../src/parkingCompatibility.ts';

const layout = JSON.parse(readFileSync(new URL('../src/data/parkingStudy.json', import.meta.url), 'utf8'));
const address = name => {
  const entry = layout.positions.find(item => item.name === name);
  return { slotNumber: name, physicalSlotNumber: entry.physical, position: entry.position };
};

test('the native drawing and 3D study share twenty real labels and equal internal footprints', () => {
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
