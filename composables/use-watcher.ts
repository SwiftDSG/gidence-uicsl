import type { Watcher } from "~~/types/watcher";

export default () => {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const createWatcher = async (fn: Watcher): Promise<Watcher | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/watcher`,
        "post",
        JSON.stringify(fn)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };
  const updateWatcher = async (fn: Watcher): Promise<Watcher | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/watcher`,
        "put",
        JSON.stringify(fn)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };
  const deleteWatcher = async (fn: Watcher): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/watcher/${fn.id}`,
        "delete"
      );
      if (response.status !== 204) throw new Error("");

      return true;
    } catch {
      return false
    }
  };

  return {
    createWatcher,
    updateWatcher,
    deleteWatcher,
  };
};
