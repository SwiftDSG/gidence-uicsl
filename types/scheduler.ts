export type Scheduler = {
  id: string;
  function_id: string;
  name: string;
  active: boolean;
  field: [SchedulerField?, SchedulerField?, SchedulerField?, SchedulerField?, SchedulerField?];
}

export type SchedulerField = {
  range?: [number, number];
  step?: [number, number];
  value?: number;
}