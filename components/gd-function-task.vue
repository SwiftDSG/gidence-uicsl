<template>
  <div class="gd-function-task-container">
    <div class="gd-function-task-add">
      <gd-input-button-small icon="plus" @clicked="emits('add-prev')" />
    </div>
    <div class="gd-function-task">
      <div class="gd-function-task-header">
        <div class="gd-function-task-information">
          <div class="gd-function-task-information-indicator">
            <gd-svg v-if="kind === 'command'" name="code" />
            <gd-svg v-else-if="kind === 'timeout'" name="timer" />
            <gd-svg v-else-if="kind === 'condition'" name="branch" />
            <gd-svg v-else name="dots" />
          </div>
          <gd-input-select :input="taskKindInput" style="width: 8rem" />
        </div>
        <gd-input-button-small icon="close" @clicked="emits('remove')" />
      </div>
      <div v-if="kind === 'condition'" class="gd-function-task-body">
        <div class="gd-function-task-section">
          <span class="gd-function-task-section-name gd-headline-6"
            >Condition</span
          >
          <gd-function-task-condition
            :master="true"
            :condition="condition"
            :sensor="sensor"
            :relay="relay"
          />
        </div>
        <div class="gd-function-task-section">
          <span class="gd-function-task-section-name gd-headline-6">
            True action
          </span>
          <gd-input-button
            v-if="conditionTrueTask.length === 0"
            label="Add task"
            type="background"
            @clicked="conditionTrueTaskAdd('', 0)"
          />
          <div v-else class="gd-function-task-wrapper">
            <gd-function-task
              v-for="({ task, key }, i) in conditionTrueTask"
              :key="key"
              :task="task"
              :sensor="sensor"
              :relay="relay"
              :function="props.function"
              :style="`z-index: ${conditionTrueTask.length - i};`"
              @remove="conditionTrueTaskRemove(i)"
              @add-prev="conditionTrueTaskAdd('', i)"
              @add-next="conditionTrueTaskAdd('', i + 1)"
              @update="(task) => conditionTrueTaskUpdate(task, i)"
            />
          </div>
        </div>
        <div class="gd-function-task-section">
          <span class="gd-function-task-section-name gd-headline-6">
            False action
          </span>
          <gd-input-button
            v-if="conditionFalseTask.length === 0"
            label="Add task"
            type="background"
            @clicked="conditionFalseTaskAdd('', 0)"
          />
          <div v-else class="gd-function-task-wrapper">
            <gd-function-task
              v-for="({ task, key }, i) in conditionFalseTask"
              :key="key"
              :task="task"
              :sensor="sensor"
              :relay="relay"
              :function="props.function"
              :style="`z-index: ${conditionFalseTask.length - i};`"
              @remove="conditionFalseTaskRemove(i)"
              @add-prev="conditionFalseTaskAdd('', i)"
              @add-next="conditionFalseTaskAdd('', i + 1)"
              @update="(task) => conditionFalseTaskUpdate(task, i)"
            />
          </div>
        </div>
      </div>
      <div v-else-if="kind === 'timeout'" class="gd-function-task-body">
        <div class="gd-function-task-input-wrapper">
          <gd-input-text :input="taskTimeoutInput" style="width: 100%" />
        </div>
      </div>
      <div v-else-if="kind === 'command'" class="gd-function-task-body">
        <div class="gd-function-task-input-wrapper">
          <gd-input-select :input="taskDeviceInput" />
        </div>
        <div class="gd-function-task-input-wrapper" style="margin-top: 0.5rem">
          <gd-input-select
            :input="taskDeviceValueInput"
            style="width: calc((100% - 0.5rem) / 2)"
          />
          <gd-input-select
            :input="taskDeviceLockInput"
            style="width: calc((100% - 0.5rem) / 2)"
          />
        </div>
      </div>
    </div>
    <div class="gd-function-task-add">
      <gd-input-button-small icon="plus" @clicked="emits('add-next')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type {
    Function,
    FunctionTask,
    FunctionTaskCommand,
    FunctionTaskCondition,
  } from "~/types/function";
  import type { InputOption, InputSelectOption } from "~/types/general";
  import type { Relay } from "~/types/relay";
  import type { Sensor } from "~/types/sensor";

  type FunctionTaskKind = "condition" | "timeout" | "command";

  const props = defineProps<{
    task: FunctionTask;
    sensor: Sensor[];
    relay: Relay[];
    function: Function[];
  }>();
  const emits = defineEmits(["remove", "update", "add-prev", "add-next"]);

  const init = ref<boolean>(true);

  const condition = ref<FunctionTaskCondition>({});
  const conditionTrueTask = ref<{ key: string; task: FunctionTask }[]>([]);
  const conditionFalseTask = ref<{ key: string; task: FunctionTask }[]>([]);

  const taskKindInput = ref<InputSelectOption<FunctionTaskKind | "">>({
    name: "task-kind",
    placeholder: "Select one",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "If-else statement",
        value: "condition",
      },
      {
        name: "Timeout",
        value: "timeout",
      },
      {
        name: "Command",
        value: "command",
      },
    ],
  });
  const taskTimeoutInput = ref<InputOption>({
    name: "task-timeout",
    placeholder: "Timeout (seconds)",
    type: "number",
    model: {
      name: "",
      value: "",
    },
  });
  const taskDeviceInput = ref<InputSelectOption>({
    name: "task-command-device",
    placeholder: "Device",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [],
  });
  const taskDeviceValueInput = ref<InputSelectOption<boolean | "">>({
    name: "task-command-device-value",
    placeholder: "Value",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "On",
        value: true,
      },
      {
        name: "Off",
        value: false,
      },
    ],
  });
  const taskDeviceLockInput = ref<InputSelectOption<boolean | "">>({
    name: "task-command-device-lock",
    placeholder: "Lock",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "Locked",
        value: true,
      },
      {
        name: "Unlocked",
        value: false,
      },
    ],
  });

  const kind = computed<FunctionTaskKind | "">(() => {
    return taskKindInput.value.model.value;
  });
  const timeout = computed<number>(() =>
    parseFloat(taskTimeoutInput.value.model.value)
  );
  const command = computed<FunctionTaskCommand>(() => {
    const command: FunctionTaskCommand = {};

    const relay = props.relay.find(
      (a) => a.id === taskDeviceInput.value.model.value
    );
    if (relay) {
      const value = taskDeviceValueInput.value.model.value;
      const lock = taskDeviceLockInput.value.model.value;
      if (typeof value === "boolean") {
        command.relay = [relay.id, value, lock || false];
        return command;
      }
    }
    const fn = props.function.find(
      (a) => a.id === taskDeviceInput.value.model.value
    );
    if (fn) {
      command.function = fn.id;
      return command;
    }

    return command;
  });
  const task = computed<FunctionTask>(() => {
    let task: FunctionTask = {};
    if (kind.value === "condition") {
      if (condition.value) {
        task.condition = [
          condition.value,
          conditionTrueTask.value.map((a) => a.task),
          conditionFalseTask.value.map((a) => a.task),
        ];
      } else {
        task.condition = [{}, [], []];
      }
    }
    if (kind.value === "timeout") {
      if (timeout.value > 0) {
        task.timeout = timeout.value;
      } else {
        task.timeout = 0;
      }
    }
    if (kind.value === "command") {
      if (command.value.relay || command.value.function) {
        task.command = command.value;
      } else {
        task.command = {};
      }
    }
    return task;
  });

  function genRandomKey(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  function conditionTrueTaskAdd(task: FunctionTaskKind | "", pos?: number) {
    if (pos === undefined) pos = conditionTrueTask.value.length;
    if (task === "timeout") {
      conditionTrueTask.value.splice(pos, 0, {
        task: {
          timeout: 0,
        },
        key: genRandomKey(),
      });
    } else if (task === "condition") {
      conditionTrueTask.value.splice(pos, 0, {
        task: {
          condition: [{}, [], []],
        },
        key: genRandomKey(),
      });
    } else if (task === "command") {
      conditionTrueTask.value.splice(pos, 0, {
        task: {
          command: {},
        },
        key: genRandomKey(),
      });
    } else {
      conditionTrueTask.value.splice(pos, 0, {
        task: {},
        key: genRandomKey(),
      });
    }
  }
  function conditionTrueTaskRemove(i: number) {
    conditionTrueTask.value.splice(i, 1);
  }
  function conditionTrueTaskUpdate(task: FunctionTask, i: number) {
    conditionTrueTask.value[i].task = task;
  }

  function conditionFalseTaskAdd(task: FunctionTaskKind | "", pos?: number) {
    if (pos === undefined) pos = conditionFalseTask.value.length;
    if (task === "timeout") {
      conditionFalseTask.value.splice(pos, 0, {
        task: {
          timeout: 0,
        },
        key: genRandomKey(),
      });
    } else if (task === "condition") {
      conditionFalseTask.value.splice(pos, 0, {
        task: {
          condition: [{}, [], []],
        },
        key: genRandomKey(),
      });
    } else if (task === "command") {
      conditionFalseTask.value.splice(pos, 0, {
        task: {
          command: {},
        },
        key: genRandomKey(),
      });
    } else {
      conditionFalseTask.value.splice(pos, 0, {
        task: {},
        key: genRandomKey(),
      });
    }
  }
  function conditionFalseTaskRemove(i: number) {
    conditionFalseTask.value.splice(i, 1);
  }
  function conditionFalseTaskUpdate(task: FunctionTask, i: number) {
    conditionFalseTask.value[i].task = task;
  }

  function fillOptions(datas: Relay[]) {
    for (const device of datas) {
      taskDeviceInput.value.options.push({
        name: device.name,
        value: device.id,
      });
    }
  }

  watch(
    () => kind.value,
    () => {
      if (init.value) return;

      condition.value = {};
      conditionTrueTask.value = [];
      conditionFalseTask.value = [];

      taskTimeoutInput.value.model = { name: "", value: "" };
      taskDeviceInput.value.model = { name: "", value: "" };
      taskDeviceValueInput.value.model = { name: "", value: "" };
    }
  );
  watch(
    () => task.value,
    (val) => {
      if (val) {
        emits("update", val);
      }
    },
    { deep: true }
  );

  onMounted(() => {
    fillOptions(props.relay);

    if (props.task.command) {
      taskKindInput.value.model = {
        name: "Command",
        value: "command",
      };
      if (props.task.command.relay) {
        const comand = props.task.command.relay;
        const relay = props.relay.find((a) => a.id === comand[0]);
        if (relay) {
          taskDeviceInput.value.model = {
            name: relay.name,
            value: relay.id,
          };
          taskDeviceValueInput.value.model = {
            name: comand[1] ? "On" : "Off",
            value: comand[1],
          };
          taskDeviceLockInput.value.model = {
            name: comand[2] ? "Locked" : "Unlocked",
            value: comand[2] || false,
          };
        }
      } else if (props.task.command.function) {
        const comand = props.task.command.function;
        const fn = props.function.find((a) => a.id === comand);
        if (fn) {
          taskDeviceInput.value.model = {
            name: fn.name,
            value: fn.id,
          };
        }
      }
    } else if (props.task.timeout) {
      taskKindInput.value.model = {
        name: "Timeout",
        value: "timeout",
      };
      taskTimeoutInput.value.model = {
        name: props.task.timeout.toString(),
        value: props.task.timeout.toString(),
      };
    } else if (props.task.condition) {
      taskKindInput.value.model = {
        name: "If-else statement",
        value: "condition",
      };
      condition.value = props.task.condition[0];
      conditionTrueTask.value = props.task.condition[1].map((a) => ({
        task: a,
        key: genRandomKey(),
      }));
      conditionFalseTask.value = props.task.condition[2].map((a) => ({
        task: a,
        key: genRandomKey(),
      }));
    }

    setTimeout(() => {
      init.value = false;
    }, 250);
  });
</script>

<style lang="scss" scoped>
  .gd-function-task-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;

    .gd-function-task {
      position: relative;
      width: 100%;
      padding: 0.75rem;
      border: var(--border);
      border-radius: 0.75rem;
      background: var(--background-depth-one-color);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      * {
        flex-shrink: 0;
      }

      .gd-function-task-header {
        position: relative;
        width: 100%;
        height: 2rem;
        display: flex;
        justify-content: space-between;

        .gd-function-task-information {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .gd-function-task-information-indicator {
            position: relative;
            width: 2rem;
            height: 2rem;
            padding: 0 0.5rem;
            border-radius: 0.5rem;
            box-sizing: border-box;
            background-color: var(--background-depth-three-color);
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }

      .gd-function-task-body {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;

        .gd-function-task-input-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          gap: 0.5rem;
        }

        .gd-function-task-section {
          position: relative;
          left: -0.75rem;
          width: calc(100% + 1.5rem);
          padding: 0.75rem;
          border-top: var(--border);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          &:first-child {
            border-top: none;
            padding-top: 0;
          }

          &:last-child {
            padding-bottom: 0;
          }

          &.gd-function-task-wrapper {
            position: relative;
            width: 100%;
            display: flex;
            flex-direction: column;
          }
        }
      }
    }

    .gd-function-task-add {
      position: relative;
      width: 100%;
      height: 4rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      &::before,
      &::after {
        content: "";
        position: relative;
        width: 1px;
        height: 1rem;
        background: var(--border-color);
      }
    }

    &:first-child {
      .gd-function-task-add:first-child {
        height: 3rem;

        &::before {
          display: none;
        }
      }
    }

    &:not(:first-child) {
      .gd-function-task-add:first-child {
        display: none;
      }
    }

    &:last-child {
      .gd-function-task-add:last-child {
        height: 3rem;

        &::after {
          display: none;
        }
      }
    }
  }
</style>
