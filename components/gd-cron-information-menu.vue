<template>
  <gd-menu
    :active="active"
    :label="cron ? 'Edit Scheduler' : 'Create Scheduler'"
    class="gd-menu"
  >
    <div class="gd-menu-informations">
      <div class="gd-menu-informations-header">
        <span class="gd-menu-informations-title gd-headline-5">
          Cron information
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
          <gd-input-text class="gd-menu-input-cron" :input="fieldInput[0]" />
          <gd-input-text class="gd-menu-input-cron" :input="fieldInput[1]" />
          <gd-input-text class="gd-menu-input-cron" :input="fieldInput[2]" />
          <gd-input-text class="gd-menu-input-cron" :input="fieldInput[3]" />
          <gd-input-text class="gd-menu-input-cron" :input="fieldInput[4]" />
        </div>
      </div>
    </div>
    <div class="gd-menu-padding"></div>
    <div class="gd-menu-footer">
      <gd-input-button
        style="width: 100%"
        :label="cron ? 'Update scheduler' : 'Save scheduler'"
        :disabled="!name || !function_id"
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
  import type { Cron } from "~/types/cron";
  import type { Function } from "~/types/function";

  const emits = defineEmits(["exit", "shake"]);
  const props = defineProps<{
    active: boolean;
    sensors: Sensor[];
    relays: Relay[];
    crons: Cron[];
    functions: Function[];
    cron?: Cron;
  }>();
  const { createCron, updateCron } = useCron();
  const { closeMenu, updateDeviceCron } = useMain();

  const submitLoading = ref<boolean>(false);

  const nameInput = ref<InputOption>({
    name: "name",
    label: "Cron name",
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
  const fieldInput = ref<
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

  const name = computed<string>(() => nameInput.value.model.value);
  const function_id = computed<string>(() => functionInput.value.model.value);
  const field = computed<Cron["field"]>(() => {
    // ControllerCronCron = [ControllerCronCronField?, ControllerCronCronField?, ControllerCronCronField?, ControllerCronCronField?, ControllerCronCronField?]
    const inputs = fieldInput.value.map<string>((a) => a.model.value);

    const fields: Cron["field"] = [
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

  function fillOptions(datas: Function[]) {
    for (const fn of datas) {
      functionInput.value.options.push({
        name: fn.name,
        value: fn.id,
      });
    }
  }
  async function submit() {
    const payload: Cron = {
      id: props.cron?.id || "",
      name: name.value,
      function_id: function_id.value,
      field: field.value,
      active: props.cron?.active || false,
    };

    submitLoading.value = true;

    let result;
    if (props.cron) {
      result = await updateCron(payload);
    } else {
      result = await createCron(payload);
    }

    setTimeout(() => {
      submitLoading.value = false;
      if (result) {
        updateDeviceCron(result);
        closeMenu();
      } else {
        emits("shake");
      }
    }, 1000);
  }

  onMounted(() => {
    fillOptions(props.functions);

    if (props.cron) {
      const cron = props.cron.field;
      for (let i = 0; i < cron.length; i++) {
        const v = cron[i];
        if (v?.step) {
          fieldInput.value[i].model = {
            name: `${v.step[0]}/${v.step[1]}`,
            value: `${v.step[0]}/${v.step[1]}`,
          };
        } else if (v?.range) {
          fieldInput.value[i].model = {
            name: `${v.range[0]}-${v.range[1]}`,
            value: `${v.range[0]}-${v.range[1]}`,
          };
        } else if (v && (v.value || 0) >= 0) {
          const value = v.value || 0;
          fieldInput.value[i].model = {
            name: value.toString(),
            value: value.toString(),
          };
        }
      }

      nameInput.value.model = {
        name: props.cron.name,
        value: props.cron.name,
      };
      functionInput.value.model = {
        name:
          props.functions.find((fn) => fn.id === props.cron?.function_id)
            ?.name || props.cron.function_id,
        value: props.cron.function_id,
      };
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
