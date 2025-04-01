<template>
  <gd-menu
    :active="active"
    :label="props.function ? 'Edit function' : 'Create function'"
    @exit="emits('exit')"
    class="gd-menu"
  >
    <div class="gd-menu-input-wrapper">
      <gd-input-text class="gd-menu-input" :input="nameInput" />
    </div>
    <div class="gd-menu-function-tasks-wrapper">
      <gd-input-button
        v-if="tasks.length === 0"
        label="Add task"
        type="background"
        @clicked="taskAdd('', 0)"
      />
      <gd-function-task
        v-for="({ task, key }, i) in tasks"
        :key="key"
        :task="task"
        :function="functions"
        :sensor="sensors"
        :relay="relays"
        :style="`z-index: ${tasks.length - i};`"
        @remove="taskRemove(i)"
        @add-prev="taskAdd('', i)"
        @add-next="taskAdd('', i + 1)"
        @update="(task) => taskUpdate(task, i)"
      />
    </div>
    <div class="gd-menu-footer">
      <gd-input-button-small
        icon="code"
        tooltip="Command"
        type="secondary"
        @clicked="taskAdd('command')"
      />
      <gd-input-button-small
        icon="timer"
        tooltip="Timeout"
        type="secondary"
        @clicked="taskAdd('timeout')"
      />
      <gd-input-button-small
        icon="branch"
        tooltip="If-else statement"
        type="secondary"
        @clicked="taskAdd('condition')"
      />
      <gd-input-button
        style="width: calc(100% - 7.5rem)"
        :label="props.function ? 'Update function' : 'Save function'"
        @clicked="submit"
        :disabled="!name || !task.length"
        :loading="submitLoading"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import type { Function, FunctionTask } from "~/types/function";
  import type { InputOption } from "~/types/general";
  import { Relay } from "~/types/relay";
  import { Sensor } from "~/types/sensor";

  type FunctionTaskKind = "condition" | "timeout" | "command";

  const emits = defineEmits(["exit", "shake"]);
  const props = defineProps<{
    active: boolean;
    function?: Function;
    functions: Function[];
    relays: Relay[];
    sensors: Sensor[];
  }>();
  const { createFunction, updateFunction } = useFunction();

  const submitLoading = ref<boolean>(false);

  const tasks = ref<{ task: FunctionTask; key: string }[]>([]);

  const nameInput = ref<InputOption>({
    name: "name",
    label: "Function name",
    placeholder: "Emergency Shutdown",
    model: {
      name: "",
      value: "",
    },
  });

  const name = computed<string>(() => nameInput.value.model.value);
  const task = computed<FunctionTask[]>(() => tasks.value.map((a) => a.task));

  function genRandomKey(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  function taskAdd(task: FunctionTaskKind | "", pos?: number) {
    if (pos === undefined) pos = tasks.value.length;
    if (task === "timeout") {
      tasks.value.splice(pos, 0, {
        task: {
          timeout: 0,
        },
        key: genRandomKey(),
      });
    } else if (task === "condition") {
      tasks.value.splice(pos, 0, {
        task: {
          condition: [{}, [], []],
        },
        key: genRandomKey(),
      });
    } else if (task === "command") {
      tasks.value.splice(pos, 0, {
        task: {
          command: {},
        },
        key: genRandomKey(),
      });
    } else {
      tasks.value.splice(pos, 0, {
        task: {},
        key: genRandomKey(),
      });
    }
  }
  function taskRemove(i: number) {
    tasks.value.splice(i, 1);
  }
  function taskUpdate(task: FunctionTask, i: number) {
    tasks.value[i].task = task;
  }

  async function submit() {
    submitLoading.value = true;
    if (name.value) {
      const payload: Function = {
        id: props.function?.id || "",
        name: name.value,
        task: task.value,
      };

      let result;
      if (props.function) {
        result = await updateFunction(payload);
      } else {
        result = await createFunction(payload);
      }

      setTimeout(() => {
        submitLoading.value = false;
        if (result) {
          emits("exit", { controller_funtion: result });
        } else {
          emits("shake");
        }
      }, 1000);
    }
  }

  onMounted(() => {
    if (props.function) {
      nameInput.value.model = {
        name: props.function.name,
        value: props.function.name,
      };
      tasks.value = props.function.task.map((task) => ({
        task,
        key: genRandomKey(),
      }));
    }
  });
</script>

<style lang="scss" scoped>
  .gd-menu {
    position: relative;
    display: flex;
    flex-direction: column;

    .gd-menu-input-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      gap: 0 0.5rem;
      flex-wrap: wrap;
      align-items: flex-end;

      .gd-menu-input {
        position: relative;
        width: 100%;
      }

      .gd-menu-input-error {
        position: relative;
        width: 100%;
        height: 1rem;
        flex-shrink: 0;
      }
    }

    .gd-menu-function-tasks-wrapper {
      position: relative;
      width: 100%;
      margin-top: 1rem;
      margin-bottom: 5rem;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .gd-menu-footer {
      z-index: 999999;
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4rem;
      padding: 1rem;
      border-top: var(--border);
      box-sizing: border-box;
      background: var(--background-depth-two-color);
      display: flex;
      gap: 0.5rem;
    }
  }
</style>
