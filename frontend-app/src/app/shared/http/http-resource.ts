import { signal, Signal } from "@angular/core";

type Resource<T> = {
  data: Signal<T | undefined>;
  loading: Signal<boolean>;
  error: Signal<any | undefined>;
  refresh: () => Promise<void>;
};

const cache = new Map<string, { ts: number; value: any }>();

export function httpResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttlMs?: number }
): Resource<T> {
  const ttl = options?.ttlMs ?? 0;

  const data = signal<T | undefined>(undefined);
  const loading = signal(false);
  const error = signal<any | undefined>(undefined);

  async function load() {
    const cached = cache.get(key);
    if (cached && ttl > 0 && Date.now() - cached.ts < ttl) {
      data.set(cached.value);
      return;
    }

    loading.set(true);
    error.set(undefined);
    try {
      const v = await fetcher();
      data.set(v);
      cache.set(key, { ts: Date.now(), value: v });
    } catch (e) {
      error.set(e);
    } finally {
      loading.set(false);
    }
  }

  // kick off
  void load();

  return {
    data,
    loading,
    error,
    refresh: async () => {
      cache.delete(key);
      await load();
    },
  };
}

export function invalidateHttpResource(key: string) {
  cache.delete(key);
}
