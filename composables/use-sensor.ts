import type { Sensor } from "~~/types/sensor";

export default () => {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const readSensor = async (sensor: Sensor): Promise<string | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/sensor/read`,
        "post",
        JSON.stringify(sensor)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.text();
      return result;
    } catch {
      return null
    }
  };
  const createSensor = async (sensor: Sensor): Promise<Sensor | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/sensor`,
        "post",
        JSON.stringify(sensor)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };
  const updateSensor = async (sensor: Sensor): Promise<Sensor | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/sensor/${sensor.id}`,
        "put",
        JSON.stringify(sensor)
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();
      return result;
    } catch {
      return null
    }
  };
  const deleteSensor = async (sensor: Sensor): Promise<boolean> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/sensor/${sensor.id}`,
        "delete"
      );
      if (response.status !== 204) throw new Error("");

      return true;
    } catch {
      return false
    }
  };

  return {
    readSensor,
    createSensor,
    updateSensor,
    deleteSensor
  };
};
