import { FunctionTaskCondition } from "./function";

export type Watcher = {
  id: string;
  function_id: string;
  name: string;
  active: boolean;
  condition: FunctionTaskCondition;
}