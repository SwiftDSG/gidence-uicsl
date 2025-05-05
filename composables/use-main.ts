
import type { Scheduler } from "~/types/scheduler";
import type { Function } from "~/types/function";
import type { Port } from "~/types/port";
import type { Relay } from "~/types/relay";
import type { Sensor } from "~/types/sensor";
import type { Watcher } from "~/types/watcher";
import type { Device, Menu, Reading, State, Theme, View } from "~~/types/general";

type Order = { [k: string]: string[] };

export default function() {
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
  const order = useState<Order>("order", () => ({}));
  const pin = useState<string[]>("pin", () => []);

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

  const getDevice = async (): Promise<{
    port: Port[];
    device: {
      [k: string]: {
        sensor?: Sensor;
        relay?: Relay;
      }[]
    };
  } | null> => {
    try {
      const response: Response = await $fetch(
        `${config.public.controllerBase}/device`,
        "get"
      );
      if (response.status !== 200) throw new Error("");

      const result: Device = await response.json();

      if (device.value) {
        if (JSON.stringify(device.value) !== JSON.stringify(result)) {
          device.value = result;
        } else {
          throw new Error("");
        }
      } else {
        device.value = result;
      }

      const orderRaw = localStorage.getItem("order");
      if (orderRaw) {
        order.value = JSON.parse(orderRaw);
      } else {
        order.value = {};
      }

      const o: Order = JSON.parse(JSON.stringify(order.value));
      const k = Object.keys(o);
      const p = result.port;
      let u = k.length;
      for (let i = 0; i < p.length; i++) {
        const j = k.findIndex((a) => p[i].id === a);
        if (j > -1) {
          const t = p[j];
          p[j] = p[i];
          p[i] = t;
        } else {
          const t = p[u];
          p[u] = p[i];
          p[i] = t;
          u += 1;
          o[p[i].id] = [];
        }
      }

      const d: {
        [k: string]: {
          sensor?: Sensor;
          relay?: Relay;
        }[]
      } = {};
      for (const sensor of result.sensor) {
        if (!d[sensor.port_id]) {
          if (!o[sensor.port_id]) {
            o[sensor.port_id] = [];
            d[sensor.port_id] = [];
          } else {
            d[sensor.port_id] = Array(o[sensor.port_id].length).fill({});
          }
        }

        const j = o[sensor.port_id] ? o[sensor.port_id].findIndex(
          (a) => a === sensor.id
        ) : -1;

        if (j > -1) {
          d[sensor.port_id][j] = { sensor };
        } else {
          d[sensor.port_id].push({ sensor });
          o[sensor.port_id].push(sensor.id);
        }
      }

      for (const relay of result.relay) {
        if (!d[relay.port_id]) {
          if (!o[relay.port_id]) {
            o[relay.port_id] = [];
            d[relay.port_id] = [];
          } else {
            d[relay.port_id] = Array(o[relay.port_id].length).fill({});
          }
        }

        const j = o[relay.port_id] ? o[relay.port_id].findIndex(
          (a) => a === relay.id
        ) : -1;

        if (j > -1) {
          d[relay.port_id][j] = { relay };
        } else {
          d[relay.port_id].push({ relay });
          o[relay.port_id].push(relay.id);
        }
      }

      order.value = o;

      return {
        port: p,
        device: d,
      };
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
    order,
    pin,
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
  };
}
