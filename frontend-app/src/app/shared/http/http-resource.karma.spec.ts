import { httpResource, invalidateHttpResource } from './http-resource';

describe('httpResource (Karma/Jasmine)', () => {
  const originalFetch = (window as any).fetch;

  beforeEach(() => {
    (window as any).fetch = jasmine.createSpy('fetch');
  });

  afterEach(() => {
    (window as any).fetch = originalFetch;
    invalidateHttpResource('test:key');
  });

  it('loads data and caches it', async (done) => {
    (window as any).fetch.and.returnValue(Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: '1', name: 'R1' }]) }));

    const r = httpResource('test:key', async () => {
      const res = await fetch('/rules');
      if (!res.ok) throw new Error('fail');
      return res.json();
    }, { ttlMs: 1000 });

    // wait a tick for initial fetch
    setTimeout(() => {
      try {
        expect(r.data()).toBeDefined();
        expect(Array.isArray(r.data())).toBeTrue();
        const before = r.data();
        r.refresh().then(() => {
          expect(r.data()).toEqual(before);
          done();
        });
      } catch (err) {
        done.fail(err as any);
      }
    }, 20);
  });
});
