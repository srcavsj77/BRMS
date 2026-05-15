import { signal, computed, Signal } from "@angular/core";
import type { Rule } from "../../features/rules/models";
import { httpResource } from "../../shared/http/http-resource";
import { api } from '../../shared/http/api';

export const rulesStore = (() => {
  const list = signal<Rule[] | undefined>(undefined);
  const loading = signal(false);

  const resource = httpResource<Rule[]>("rules:list", async () => {
    return await api.get<Rule[]>('/rules');
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
