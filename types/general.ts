import type { Controller } from "~/types/controller";
import type { Cron } from "~/types/cron";
import type { Port } from "~/types/port";
import type { Relay } from "~/types/relay";
import type { Sensor } from "~/types/sensor";
import type { Watcher } from "~/types/watcher";
import type { Function } from "~/types/function";

export type View = "desktop" | "mobile" | "tab" | null;
export type Theme = "light" | "dark";
export type State = "idle" | "changing";
export type Device = {
  controller: Controller;
  port: { [k: string]: Port };
  sensor: { [k: string]: Sensor };
  relay: { [k: string]: Relay };
  function: { [k: string]: Function };
  watcher: { [k: string]: Watcher };
  cron: { [k: string]: Cron };
};
export type Reading = {
  sensor: { [k: string]: [number, number]; }; // [value, timestamp]
  relay: { [k: string]: [boolean, number]; }; // [value, timestamp]
}
export type Menu = {
  controller?: {};
  controllerInformation?: {};
  port?: {
    port: Port;
  };
  portDelete?: {
    port: Port;
  };
  portInformation?: {
    port?: Port;
  };
  deviceInformation?: {
    port: Port;
    device?: Sensor | Relay;
  };
  deviceDelete?: {
    port: Port;
    device: Sensor | Relay;
  };
  relay?: {
    port: Port;
    relay: Relay;
  };
  sensor?: {
    port: Port;
    sensor: Sensor;
  };
  sensorAdjustment?: {
    port: Port;
    sensor: Sensor;
  };
  function?: {
    sensors: Sensor[];
    relays: Relay[];
    functions: Function[];
  };
  functionInformation?: {
    sensors: Sensor[];
    relays: Relay[];
    functions: Function[];
    function?: Function;
  };
  functionDelete?: {
    function: Function;
  };
  watcher?: {
    sensors: Sensor[];
    relays: Relay[];
    functions: Function[];
    watchers: Watcher[];
  };
  watcherInformation?: {
    sensors: Sensor[];
    relays: Relay[];
    functions: Function[];
    watchers: Watcher[];
    watcher?: Watcher;
  };
  watcherDelete?: {
    watcher: Watcher;
  };
}

export type InputOption<T = any> = {
  name: string;
  placeholder: string;
  model: {
    name: string;
    value: T;
  };
  prefix?: string;
  icon?: string;
  label?: string;
  error?: string;
  type?: "email" | "password" | "tel" | "number";
  disabled?: boolean;
  alignment?: "left" | "center" | "right";
};

export type InputSelectOption<T = any> = {
  name: string;
  placeholder: string;
  model: {
    name: string;
    value: T;
  };
  prefix?: string;
  icon?: string;
  label?: string;
  error?: string;
  strict?: boolean;
  disabled?: boolean;
  options: {
    name: string;
    value: T;
  }[];
};

export type InputSwitchOption<T = any> = {
  options:
  | [
    {
      name: string;
      value: T;
    },
    {
      name: string;
      value: T;
    }
  ]
  | [
    {
      name: string;
      value: T;
    },
    {
      name: string;
      value: T;
    },
    {
      name: string;
      value: T;
    }
  ];
  name: string;
  model: {
    name: string;
    value: T;
  };
  disabled?: boolean;
};

export type InputToggleOption = {
  model: boolean;
  disabled?: boolean;
};

export type InputFileOption = {
  file?: File;
  type?: "any" | "image";
  disabled?: boolean;
  label?: string;
  image_url?: string;
  width?: number;
  height?: number;
};

export type InputImageOption = {
  label: string;
  limit: number;
  file: File[];
};

export type InputDateOption = {
  name: string;
  model: {
    name: string;
    value: number;
  };
  threshold?: {
    min?: Date;
    max?: Date;
    day?: number[];
  };
  icon?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
};

export type InputSearchOption = {
  name: string;
  placeholder: string;
  model: string;
};