import type { Scheduler } from "~/types/scheduler";
import type { Function } from "~/types/function";
import type { Port } from "~/types/port";
import type { Relay } from "~/types/relay";
import type { Sensor } from "~/types/sensor";
import type { Watcher } from "~/types/watcher";
import type { Device, Menu, Order, Reading, State, Theme, View } from "~~/types/general";

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
  const order = useState<Order>("order", () => ({
    port: [],
    device: {},
  }));
  const pin = useState<string[]>("pin", () => []);
  const lock = useState<string>("lock", () => "");
  const locked = useState<boolean>("locked", () => false);

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
    const index = device.value.port.findIndex((p) => p.id === port.id);
    if (index !== -1) {
      device.value.port[index] = port;
    }
  }
  const updateDeviceSensor = (sensor: Sensor): void => {
    if (!device.value) return;
    const index = device.value.sensor.findIndex((s) => s.id === sensor.id);
    if (index !== -1) {
      device.value.sensor[index] = sensor;
    }
  }
  const updateDeviceRelay = (relay: Relay): void => {
    if (!device.value) return;
    const index = device.value.relay.findIndex((r) => r.id === relay.id);
    if (index !== -1) {
      device.value.relay[index] = relay;
    }
  }
  const updateDeviceFunction = (fn: Function): void => {
    if (!device.value) return;
    const index = device.value.function.findIndex((f) => f.id === fn.id);
    if (index !== -1) {
      device.value.function[index] = fn;
    }
  }
  const updateDeviceWatcher = (watcher: Watcher): void => {
    if (!device.value) return;
    const index = device.value.watcher.findIndex((w) => w.id === watcher.id);
    if (index !== -1) {
      device.value.watcher[index] = watcher;
    }
  }
  const updateDeviceScheduler = (scheduler: Scheduler): void => {
    if (!device.value) return;
    const index = device.value.scheduler.findIndex((s) => s.id === scheduler.id);
    if (index !== -1) {
      device.value.scheduler[index] = scheduler;
    }
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

      const result: Device = await response.json();
      device.value = result;

      return result;
    } catch {
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
    } catch {
      return null;
    }
  };

  const load = (): void => {
    lock.value = localStorage.getItem("lock") || "";
    if (lock.value) {
      locked.value = true;
    }

    const orderRaw = localStorage.getItem("order");
    if (orderRaw) {
      order.value = JSON.parse(orderRaw);
    } else {
      order.value = {
        port: [],
        device: {},
      };
    }

    const pinRaw = localStorage.getItem("pin");
    if (pinRaw) {
      pin.value = JSON.parse(pinRaw);
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
    order,
    pin,
    lock,
    locked,
    getTheme,
    setTheme,
    openMenu,
    closeMenu,
    getReading,
    getDevice,
    updateDevicePort,
    updateDeviceSensor,
    updateDeviceRelay,
    updateDeviceFunction,
    updateDeviceWatcher,
    updateDeviceScheduler,
    updateReadingRelay,
    load
  };
}
