import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createParkingClient, parkingKeys } from '../src/parkingClient.ts';
import { createOfflineParking } from '../src/offlineParking.ts';

test('typed parking client encodes IDs, keeps raw uploads and forwards explicit revision and idempotency', async () => {
  const calls = [];
  const request = async (path, options) => { calls.push({ path, options }); return {}; };
  const client = createParkingClient(request);
  const bytes = new Blob(['Apartment,Bay\n001,A-12']);
  await client.upload('draft/id', 4, { filename: 'sample.csv', mime: 'text/csv', bytes }, { flatNumber: 1, slotNumber: 2 });
  assert.deepEqual(calls[0], {
    path: '/allocation-drafts/draft%2Fid/import',
    options: { method: 'POST', raw: bytes, headers: {
      'Content-Type': 'text/csv', 'X-ParkFair-Filename': 'sample.csv',
      'X-ParkFair-Columns': '{"flatNumber":1,"slotNumber":2}', 'If-Match': '"4"',
    } },
  });
  await client.editDraft('draft', 4, [], [{ flatNumber: '001', reason: 'Approved fixture exclusion' }]);
  await client.publish('draft', 5, 'synthetic-idempotency-key');
  await client.scheduleActivation('cycle', 'publication', true);
  await client.schedule();
  await client.history();
  await client.revokeSession('own-session');
  assert.equal(calls[1].options.method, 'PUT');
  assert.equal(calls[2].options.headers['Idempotency-Key'], 'synthetic-idempotency-key');
  assert.equal(calls[3].options.body.approved, true);
  assert.deepEqual(calls.slice(4).map((call) => call.path), ['/resident/schedule', '/resident/history', '/auth/sessions/own-session']);
  assert.notDeepEqual(parkingKeys.resident('one'), parkingKeys.resident('two'));
  assert.notDeepEqual(parkingKeys.administration('one'), parkingKeys.resident('one'));
});

test('offline parking stores only a short-lived account projection and logout purges queued writes', async () => {
  let value = null;
  let now = Date.parse('2026-11-26T04:00:00Z');
  const cache = createOfflineParking({
    read: async () => value,
    write: async (next) => { value = next; },
    clear: async () => { value = null; },
  }, () => now);
  const snapshot = {
    parking: { status: 'INSIDE', slot: 'A-12' },
    cycle: { name: 'Test week', startDate: '2026-11-26', endDate: '2026-11-30' },
    vehicle: { number: 'PRIVATE-FIXTURE' }, resident: { flatNumber: 'PRIVATE-FLAT' },
  };
  await cache.activate('one');
  await cache.save('one', snapshot);
  assert.doesNotMatch(value, /PRIVATE/);
  assert.equal((await cache.read('one')).freshness, 'cached');
  assert.equal(await cache.read('two'), null);
  await cache.activate('two');
  assert.equal(await cache.read('two'), null);
  await cache.save('two', snapshot);
  now += 86400000;
  assert.equal(await cache.read('two'), null);
  await Promise.all([cache.save('two', snapshot), cache.activate(null)]);
  assert.equal(value, null);
  assert.equal(await cache.read('two'), null);
});
