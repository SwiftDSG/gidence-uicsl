export type Scheduler = {
  id: string;
  function_id: string;
  name: string;
  active: boolean;
  rule: [SchedulerRule[], SchedulerRule[], SchedulerRule[], SchedulerRule[], SchedulerRule[], SchedulerRule[], SchedulerRule[]];
}

export type SchedulerRule = {
  value?: [number, number];
  interval?: [[number, number], [number, number], number];
}