import type { Relay } from "~~/types/relay";

export default () => {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const readRelay = async (relay: Relay): Promise<string | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/relay/read`,
        "post",
        JSON.stringify(relay)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.text();
      return result;
    } catch {
      return null
    }
  };
  const createRelay = async (relay: Relay): Promise<Relay | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/relay`,
        "post",
        JSON.stringify(relay)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };
  const updateRelay = async (relay: Relay): Promise<Relay | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/relay`,
        "put",
        JSON.stringify(relay)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };
  const flipRelay = async (relay: Relay): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/relay/${relay.id}`,
        "put"
      );
      if (response.status !== 200) throw new Error("");

      return true;
    } catch {
      return false
    }
  };
  const deleteRelay = async (relay: Relay): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/relay/${relay.id}`,
        "delete"
      );
      if (response.status !== 204) throw new Error("");

      return true;
    } catch {
      return false
    }
  };

  return {
    readRelay,
    createRelay,
    updateRelay,
    flipRelay,
    deleteRelay
  };
};
