import type { Function } from "~~/types/function";

export default () => {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const createFunction = async (fn: Function): Promise<Function | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/function`,
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
  const updateFunction = async (fn: Function): Promise<Function | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/function`,
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
  const deleteFunction = async (fn: Function): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/function/${fn.id}`,
        "delete"
      );
      if (response.status !== 204) throw new Error("");

      return true;
    } catch {
      return false
    }
  };
  const executeFunction = async (fn: Function): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/function/${fn.id}`,
        "get"
      );
      if (response.status !== 200) throw new Error("");

      return true
    } catch {
      return false
    }
  };

  return {
    createFunction,
    updateFunction,
    deleteFunction,
    executeFunction
  };
};
