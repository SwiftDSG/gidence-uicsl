export type Function = {
  id: string;
  name: string;
  task: FunctionTask[]
}

export type FunctionTask = {
  condition?: [FunctionTaskCondition, FunctionTask[], FunctionTask[]];
  timeout?: number;
  command?: FunctionTaskCommand;
}

export type FunctionTaskCondition = {
  and?: FunctionTaskCondition[];
  or?: FunctionTaskCondition[];
  sensor?: FunctionTaskConditionSensor;
  relay?: FunctionTaskConditionRelay;
}

export type FunctionTaskConditionSensor = {
  sensor_id: string,
  comparison: FunctionTaskConditionSensorComparison
}

export type FunctionTaskConditionSensorComparison = {
  lessthan?: number;
  lessthanequal?: number;
  greaterthan?: number;
  greaterthanequal?: number;
  equal?: number;
  notequal?: number;
}

export type FunctionTaskConditionRelay = {
  relay_id: string;
  comparison: FunctionTaskConditionRelayComparison;
}

export type FunctionTaskConditionRelayComparison = {
  equal?: boolean;
  notequal?: boolean;
}

export type FunctionTaskCommand = {
  relay?: [string, boolean];
  function?: string;
}
