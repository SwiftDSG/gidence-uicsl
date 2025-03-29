import type { Controller } from "~~/types/controller";

export default () => {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const updateController = async (controller: Controller): Promise<Controller | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/controller`,
        "put",
        JSON.stringify(controller)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };

  return {
    updateController,
  };
};
