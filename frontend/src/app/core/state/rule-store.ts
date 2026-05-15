import { signal, computed, Signal } from "@angular/core";
import type { Rule } from "../../features/rules/models";
import { httpResource } from "../../shared/http/http-resource";

const API_BASE = "http://localhost:3334";

export const rulesStore = (() => {
  const list = signal<Rule[] | undefined>(undefined);
  const loading = signal(false);

  const resource = httpResource<Rule[]>("rules:list", async () => {
    const res = await fetch(`${API_BASE}/rules`);
    if (!res.ok) throw new Error("Failed to load rules");
    return (await res.json()) as Rule[];
  }, { ttlMs: 30_000 });

  const reload = async () => {
    loading.set(true);
    try {
      await resource.refresh();
      list.set(resource.data());
    } finally {
      loading.set(false);
    }
  };

  const count = computed(() => list()?.length ?? 0);

  // initialize
  void (async () => {
    await reload();
  })();

  return {
    list: computed(() => list()),
    loading: computed(() => loading()),
    reload,
    count,
    _internal: { resource },
  };
})();

export type RulesStore = typeof rulesStore;
