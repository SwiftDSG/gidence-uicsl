export type Cron = {
  id: string;
  function_id: string;
  name: string;
  active: boolean;
  field: [CronField?, CronField?, CronField?, CronField?, CronField?];
}

export type CronField = {
  range?: [number, number];
  step?: [number, number];
  value?: number;
}