type Storage = {
  read: () => Promise<string | null>;
  write: (value: string) => Promise<void>;
  clear: () => Promise<void>;
};
type Source = {
  parking: { status: 'INSIDE' | 'OUTSIDE'; slot: string } | null;
  cycle: { name: string; startDate: string; endDate: string } | null;
};
type Saved = { owner: string; savedAt: number; expiresAt: number; data: Source };
const ttl = 24 * 60 * 60 * 1000;

export function createOfflineParking(storage: Storage, clock = Date.now) {
  let owner: string | null = null;
  let queue: Promise<void> = Promise.resolve();
  function run<T>(operation: () => Promise<T>) {
    const work = queue.then(operation);
    queue = work.then(() => undefined, () => undefined);
    return work;
  }
  function stored(value: string | null): Saved | null {
    if (!value) return null;
    try {
      const entry = JSON.parse(value) as Saved;
      return typeof entry.owner === 'string' && Number.isFinite(entry.savedAt) &&
        Number.isFinite(entry.expiresAt) && entry.data ? entry : null;
    } catch { return null; }
  }
  return {
    activate(account: string | null) {
      owner = account;
      return run(async () => {
        const entry = stored(await storage.read());
        if (!account || !entry || entry.owner !== account || entry.expiresAt <= clock()) await storage.clear();
      });
    },
    save(account: string, source: Source) {
      return run(async () => {
        if (owner !== account) return;
        const savedAt = clock();
        const { parking, cycle } = source;
        await storage.write(JSON.stringify({
          owner: account, savedAt, expiresAt: savedAt + ttl,
          data: {
            parking: parking && { status: parking.status, slot: parking.slot },
            cycle: cycle && { name: cycle.name, startDate: cycle.startDate, endDate: cycle.endDate },
          },
        } satisfies Saved));
      });
    },
    read(account: string) {
      return run(async () => {
        if (account !== owner) return null;
        const entry = stored(await storage.read());
        if (!entry || entry.owner !== account || entry.expiresAt <= clock()) {
          await storage.clear();
          return null;
        }
        return { freshness: 'cached' as const, syncedAt: new Date(entry.savedAt).toISOString(), data: entry.data };
      });
    },
  };
}
