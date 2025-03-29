export type Sensor = {
  id: string;
  port_id: string;
  name: string;
  device: number;
  address: number;
  format: "f32be" | "u32" | "i16" | "mod10";
  kind: "temperature" | "discharge" | "pressure";
  adjustment: SensorAdjustment[];
}

export type SensorAdjustment = {
  add?: number;
  subtract?: number;
  multiply?: number;
  divide?: number;
}