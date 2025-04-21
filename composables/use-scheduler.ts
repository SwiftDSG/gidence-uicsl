import type { Scheduler } from "~~/types/scheduler";

export default () => {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const createScheduler = async (fn: Scheduler): Promise<Scheduler | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/scheduler`,
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
  const updateScheduler = async (fn: Scheduler): Promise<Scheduler | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/scheduler`,
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
  const deleteScheduler = async (fn: Scheduler): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/scheduler/${fn.id}`,
        "delete"
      );
      if (response.status !== 204) throw new Error("");

      return true;
    } catch {
      return false
    }
  };

  return {
    createScheduler,
    updateScheduler,
    deleteScheduler,
  };
};
