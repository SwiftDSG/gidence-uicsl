import type { Cron } from "~~/types/cron";

export default () => {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const createCron = async (fn: Cron): Promise<Cron | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/cron`,
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
  const updateCron = async (fn: Cron): Promise<Cron | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/cron`,
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
  const deleteCron = async (fn: Cron): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/cron/${fn.id}`,
        "delete"
      );
      if (response.status !== 204) throw new Error("");

      return true;
    } catch {
      return false
    }
  };

  return {
    createCron,
    updateCron,
    deleteCron,
  };
};
