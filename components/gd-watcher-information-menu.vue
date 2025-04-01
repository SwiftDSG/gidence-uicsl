<template>
  <gd-menu
    :active="active"
    :label="watcher ? 'Edit Watcher' : 'Create Watcher'"
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
        <client-only>
          <gd-function-task-condition
            :master="true"
            :sensor="sensors"
            :relay="relays"
            :condition="condition"
          />
        </client-only>
      </div>
    </div>
    <div class="gd-menu-padding"></div>
    <div class="gd-menu-footer">
      <gd-input-button
        style="width: 100%"
        :label="watcher ? 'Update watcher' : 'Save watcher'"
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
  const { closeMenu } = useMain();

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

  const name = computed<string>(() => nameInput.value.model.value);
  const function_id = computed<string>(() => functionInput.value.model.value);

  function fillOptions(datas: Function[]) {
    for (const fn of datas) {
      functionInput.value.options.push({
        name: fn.name,
        value: fn.id,
      });
    }
  }
  async function submit() {
    const payload: Watcher = {
      id: props.watcher?.id || "",
      name: name.value,
      function_id: function_id.value,
      condition: condition.value,
      active: props.watcher?.active || false,
    };

    submitLoading.value = true;

    let result;
    if (props.watcher) {
      result = await updateWatcher(payload);
    } else {
      result = await createWatcher(payload);
    }

    setTimeout(() => {
      submitLoading.value = false;
      if (result) {
        closeMenu();
      } else {
        emits("shake");
      }
    }, 1000);
  }

  onMounted(() => {
    fillOptions(props.functions);

    console.log(props.watcher);
    console.log(props.functions);

    if (props.watcher) {
      condition.value = props.watcher.condition;
      nameInput.value.model = {
        name: props.watcher.name,
        value: props.watcher.name,
      };

      functionInput.value.model = {
        name:
          props.functions.find((fn) => fn.id === props.watcher?.function_id)
            ?.name || props.watcher.function_id,
        value: props.watcher.function_id,
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
      border-radius: 0.75rem;
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
            padding: 0.75rem;
            border: var(--border);
            border-radius: 0.75rem;
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
