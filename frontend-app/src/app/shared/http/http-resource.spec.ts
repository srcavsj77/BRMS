/**
 * Unit test template for `httpResource`.
 * Uses Jest-style assertions; adapt to your test runner (Jest/Karma) as needed.
 */
import { httpResource, invalidateHttpResource } from './http-resource';

describe('httpResource', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // @ts-ignore
    globalThis.fetch = jest.fn();
  });

  afterEach(() => {
    // @ts-ignore
    globalThis.fetch = originalFetch;
    invalidateHttpResource('test:key');
  });

  it('loads data and caches it', async () => {
    // @ts-ignore
    globalThis.fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: '1', name: 'R1' }] });

    const r = httpResource('test:key', async () => {
      const res = await fetch('/rules');
      if (!res.ok) throw new Error('fail');
      return res.json();
    }, { ttlMs: 1000 });

    // wait a tick for initial fetch
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(r.data()).toBeDefined();
    expect(Array.isArray(r.data())).toBe(true);
    // refresh should reuse cache if within TTL
    const before = r.data();
    await r.refresh();
    expect(r.data()).toBeDefined();
    expect(r.data()).toEqual(before);
  });
});
