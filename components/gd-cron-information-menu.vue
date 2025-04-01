<template>
  <gd-menu
    :label="controllerWatcher ? 'Edit watcher' : 'Create watcher'"
    @exit="emits('exit')"
    class="gd-menu"
  >
    <div class="gd-menu-informations">
      <div class="gd-menu-informations-header">
        <span class="gd-menu-informations-title gd-headline-5">
          Watcher information
        </span>
      </div>
      <div class="gd-menu-informations-body">
        <div class="gd-menu-input-wrapper">
          <gd-input-text class="gd-menu-input" :input="nameInput" />
        </div>
        <div class="gd-menu-input-wrapper">
          <gd-input-select class="gd-menu-input" :input="functionInput" />
        </div>
      </div>
    </div>
    <div class="gd-menu-informations">
      <div class="gd-menu-informations-header">
        <span class="gd-menu-informations-title gd-headline-5">
          Execution conditions
        </span>
      </div>
      <div class="gd-menu-informations-body">
        <div class="gd-menu-input-wrapper">
          <gd-input-select class="gd-menu-input" :input="kindInput" />
        </div>
        <gd-controller-function-task-condition
          v-if="kind === 'condition'"
          :master="true"
          :condition="condition"
          :controller-port-device="controllerPortDevice"
          :controller-processor-camera="controllerProcessorCamera"
        />
        <div v-else-if="kind === 'cron'" class="gd-menu-input-wrapper">
          <gd-input-text class="gd-menu-input-cron" :input="cronInput[0]" />
          <gd-input-text class="gd-menu-input-cron" :input="cronInput[1]" />
          <gd-input-text class="gd-menu-input-cron" :input="cronInput[2]" />
          <gd-input-text class="gd-menu-input-cron" :input="cronInput[3]" />
          <gd-input-text class="gd-menu-input-cron" :input="cronInput[4]" />
        </div>
      </div>
    </div>
    <div class="gd-menu-padding"></div>
    <div class="gd-menu-footer">
      <gd-input-button
        style="width: 100%"
        :label="controllerWatcher ? 'Update watcher' : 'Save watcher'"
        :disabled="!name || !controller_function_id || !trigger"
        :loading="submitLoading"
        @clicked="submit"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import type { InputOption, InputSelectOption } from "~/types/general";
  import type { Sensor } from "~/types/sensor";
  import type { Relay } from "~/types/relay";
  import type { Watcher } from "~/types/watcher";
  import type { Function, FunctionTaskCondition } from "~/types/function";

  const emits = defineEmits(["exit", "shake"]);
  const props = defineProps<{
    active: boolean;
    sensors: Sensor[];
    relays: Relay[];
    watchers: Watcher[];
    functions: Function[];
    watcher?: Watcher;
  }>();
  const { createWatcher, updateWatcher } = useWatcher();

  const submitLoading = ref<boolean>(false);

  const condition = ref<FunctionTaskCondition>({});

  const nameInput = ref<InputOption>({
    name: "name",
    label: "Watcher name",
    placeholder: "Emergency Conditions",
    model: {
      name: "",
      value: "",
    },
  });
  const functionInput = ref<InputSelectOption>({
    name: "function",
    label: "Function to execute",
    placeholder: "Select one",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [],
  });
  const cronInput = ref<
    [InputOption, InputOption, InputOption, InputOption, InputOption]
  >([
    {
      name: "cron-0",
      placeholder: "*",
      alignment: "center",
      model: {
        name: "*",
        value: "*",
      },
    },
    {
      name: "cron-1",
      placeholder: "*",
      alignment: "center",
      model: {
        name: "*",
        value: "*",
      },
    },
    {
      name: "cron-2",
      placeholder: "*",
      alignment: "center",
      model: {
        name: "*",
        value: "*",
      },
    },
    {
      name: "cron-3",
      placeholder: "*",
      alignment: "center",
      model: {
        name: "*",
        value: "*",
      },
    },
    {
      name: "cron-4",
      placeholder: "*",
      alignment: "center",
      model: {
        name: "*",
        value: "*",
      },
    },
  ]);
  const kindInput = ref<InputSelectOption<"cron" | "condition" | "">>({
    name: "kind",
    label: "Method",
    placeholder: "Select one",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "Condition",
        value: "condition",
      },
      {
        name: "Scheduled",
        value: "cron",
      },
    ],
  });

  const name = computed<string>(() => nameInput.value.model.value);
  const controller_function_id = computed<string>(
    () => functionInput.value.model.value
  );
  const kind = computed<"cron" | "condition" | "">(
    () => kindInput.value.model.value
  );
  const cron = computed<ControllerWatcherCron>(() => {
    // ControllerWatcherCron = [ControllerWatcherCronField?, ControllerWatcherCronField?, ControllerWatcherCronField?, ControllerWatcherCronField?, ControllerWatcherCronField?]
    const inputs = cronInput.value.map<string>((a) => a.model.value);

    const fields: ControllerWatcherCron = [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ];

    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i] !== "*" && inputs[i] !== "") {
        if (inputs[i].includes("/")) {
          const [start, end] = inputs[i].split("/");
          fields[i] = {
            step: [parseInt(start), parseInt(end)],
          };
        } else if (inputs[i].includes("-")) {
          const [start, end] = inputs[i].split("-");
          fields[i] = {
            range: [parseInt(start), parseInt(end)],
          };
        } else {
          fields[i] = {
            value: parseInt(inputs[i]),
          };
        }
      }
    }

    return fields;
  });
  const trigger = computed<ControllerWatcherRequest["trigger"] | null>(() => {
    if (kind.value === "condition") {
      return {
        condition: condition.value,
      };
    } else if (kind.value === "cron") {
      return {
        cron: cron.value,
      };
    } else {
      return null;
    }
  });

  function fillOptions(datas: ControllerFunction[]) {
    for (const fn of datas) {
      functionInput.value.options.push({
        name: fn.name,
        value: fn._id,
      });
    }
  }
  async function submit() {
    if (!trigger.value) return;

    const payload: ControllerWatcherRequest = {
      name: name.value,
      controller_id: props.controller._id,
      controller_function_id: controller_function_id.value,
      trigger: trigger.value,
    };

    submitLoading.value = true;

    let result;
    if (props.controllerWatcher) {
      result = await updateWatcher(props.controllerWatcher._id, payload);
    } else {
      result = await createWatcher(payload);
    }

    setTimeout(() => {
      submitLoading.value = false;
      if (result) {
        emits("exit", { controller_watcher: result });
      } else {
        emits("shake");
      }
    }, 1000);
  }

  onMounted(() => {
    fillOptions(props.controllerFunction);

    if (props.controllerWatcher) {
      nameInput.value.model = {
        name: props.controllerWatcher.name,
        value: props.controllerWatcher.name,
      };
      functionInput.value.model = {
        name:
          props.controllerFunction.find(
            (fn) => fn._id === props.controllerWatcher?.controller_function_id
          )?.name || props.controllerWatcher.controller_function_id,
        value: props.controllerWatcher.controller_function_id,
      };
      if (props.controllerWatcher.trigger.condition) {
        condition.value = props.controllerWatcher.trigger.condition;
        kindInput.value.model = {
          name: "Condition",
          value: "condition",
        };
      } else if (props.controllerWatcher.trigger.cron) {
        kindInput.value.model = {
          name: "Scheduled",
          value: "cron",
        };
        const cron = props.controllerWatcher.trigger.cron;
        for (let i = 0; i < cron.length; i++) {
          const v = cron[i];
          if (v?.step) {
            cronInput.value[i].model = {
              name: `${v.step[0]}/${v.step[1]}`,
              value: `${v.step[0]}/${v.step[1]}`,
            };
          } else if (v?.range) {
            cronInput.value[i].model = {
              name: `${v.range[0]}-${v.range[1]}`,
              value: `${v.range[0]}-${v.range[1]}`,
            };
          } else if (v?.value) {
            cronInput.value[i].model = {
              name: v.value.toString(),
              value: v.value.toString(),
            };
          }
        }
      }
    }
  });
</script>

<style lang="scss" scoped>
  .gd-menu {
    position: relative;
    display: flex;
    flex-direction: column;

    .gd-menu-informations {
      position: relative;
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: var(--border);
      box-sizing: border-box;
      background: var(--background-depth-one-color);
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .gd-menu-informations-body {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .gd-menu-information {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .gd-menu-input-container {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .gd-menu-input-test-container {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;

          .gd-menu-input-test-label {
            position: relative;
            width: 100%;
            height: 1rem;
            display: flex;
            align-items: center;
          }

          .gd-menu-input-test {
            position: relative;
            width: 100%;
            background: var(--background-depth-two-color);
            padding: 0.5rem;
            border: var(--border);
            border-radius: 0.5rem;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }

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

      .gd-menu-input-cron {
        position: relative;
        width: calc((100% - 2rem) / 5);
      }

      .gd-menu-input-error {
        position: relative;
        width: 100%;
        height: 1rem;
        flex-shrink: 0;
      }
    }

    .gd-menu-padding {
      position: relative;
      width: 100%;
      height: 4rem;
    }

    .gd-menu-footer {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4rem;
      padding: 1rem;
      border-top: var(--border);
      box-sizing: border-box;
      background: var(--background-depth-two-color);
    }
  }
</style>
