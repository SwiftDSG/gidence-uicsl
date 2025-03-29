
import { Port } from "~/types/port";
import { Relay } from "~/types/relay";
import { Sensor } from "~/types/sensor";
import type { Device, Menu, Reading, State, Theme, View } from "~~/types/general";

export default function () {
  const { $fetch } = useNuxtApp();
  const config = useRuntimeConfig();

  const view = useState<View>("view", () => null);
  const rem = useState<number>("rem", () => 24);
  const init = useState<boolean>("init", () => true);
  const theme = useState<Theme>("theme", () => "light");
  const state = useState<State>("state", () => "idle");
  const menus = useState<Menu[]>("menus", () => []);
  const device = useState<Device | null>("device", () => null);
  const reading = useState<Reading | null>("reading", () => null);

  const getTheme = (): Theme => {
    const stored = localStorage?.getItem("theme") || "";
    if (stored === "light" || stored === "dark") {
      theme.value = stored;
    } else if (window?.matchMedia("prefers-color-scheme: dark").matches) {
      theme.value = "dark";
    }
    return theme.value;
  };
  const setTheme = (data: Theme): Theme => {
    localStorage.setItem("theme", data);
    theme.value = data;
    return theme.value;
  };

  const openMenu = (menu: Menu): void => {
    menus.value.push(menu);
  };
  const closeMenu = (): void => {
    menus.value.pop();
  }

  const updateDevicePort = (port: Port): void => {
    if (!device.value) return;
    device.value.port[port.id] = port;
  }
  const updateDeviceSensor = (sensor: Sensor): void => {
    if (!device.value) return;
    device.value.sensor[sensor.id] = sensor;
  }
  const updateDeviceRelay = (relay: Relay): void => {
    if (!device.value) return;
    device.value.relay[relay.id] = relay;
  }
  const updateReadingRelay = (relay: Relay, state: boolean): void => {
    if (!reading.value) return;
    reading.value.relay[relay.id] = [!state, Date.now()];
  }

  const getDevice = async (): Promise<Device | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/device`,
        "get"
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();

      device.value = result;

      return result
    } catch (e) {
      return null;
    }
  };
  const getReading = async (): Promise<Reading | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/reading`,
        "get"
      );
      if (response.status !== 200) throw new Error("");

      const result = await response.json();

      reading.value = result;

      return result
    } catch (e) {
      return null;
    }
  };

  return {
    rem,
    view,
    init,
    theme,
    state,
    menus,
    device,
    reading,
    getTheme,
    setTheme,
    openMenu,
    closeMenu,
    getReading,
    getDevice,
    updateDevicePort,
    updateDeviceSensor,
    updateDeviceRelay,
    updateReadingRelay,
  };
}
