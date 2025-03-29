import type { Port } from "~~/types/port";

export default () => {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const createPort = async (port: Port): Promise<Port | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/port`,
        "post",
        JSON.stringify(port)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };
  const updatePort = async (port: Port): Promise<Port | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/port`,
        "put",
        JSON.stringify(port)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };
  const deletePort = async (port: Port): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/port/${port.id}`,
        "delete"
      );
      if (response.status !== 204) throw new Error("");

      return true;
    } catch {
      return false
    }
  };

  return {
    createPort,
    updatePort,
    deletePort
  };
};
