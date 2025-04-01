<template>
  <div class="gd-condition" :class="`gd-condition-${kind}`">
    <div v-if="master" class="gd-condition-input">
      <gd-input-select :input="conditionKindInput" />
    </div>
    <div v-else class="gd-condition-input">
      <gd-input-select
        :input="conditionKindInput"
        style="width: calc(100% - 2.5rem)"
      />
      <gd-input-button-small icon="close" @clicked="emits('remove')" />
    </div>
    <div
      v-for="(condition, i) in conditions"
      :key="i"
      class="gd-condition-content-wrapper"
    >
      <div v-if="kind === 'and' || kind === 'or'" class="gd-condition-content">
        <gd-function-task-condition
          :condition="condition"
          :sensor="sensor"
          :relay="relay"
          @remove="conditionRemove(i)"
        />
      </div>
    </div>
    <div v-if="kind === 'and' || kind === 'or'" class="gd-condition-action">
      <gd-input-button
        label="Add condition"
        type="background"
        style="width: 100%"
        @clicked="conditionAdd"
      />
    </div>
    <div v-else-if="kind === 'statement'" class="gd-condition-statement">
      <gd-function-task-condition-statement
        @update="conditionUpdate"
        :sensor="sensor"
        :relay="relay"
        :condition="condition.relay || condition.sensor ? condition : {}"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { FunctionTaskCondition } from "~/types/function";
  import type { InputSelectOption } from "~/types/general";
  import type { Relay } from "~/types/relay";
  import type { Sensor } from "~/types/sensor";

  type ConditionKind = "and" | "or" | "statement";

  const props = defineProps<{
    master?: boolean;
    sensor: Sensor[];
    relay: Relay[];
    condition: FunctionTaskCondition;
  }>();
  const emits = defineEmits(["remove"]);

  const conditionKindOptions: InputSelectOption<ConditionKind>["options"] = [
    {
      name: "And",
      value: "and",
    },
    {
      name: "Or",
      value: "or",
    },
    {
      name: "Statement",
      value: "statement",
    },
  ];
  const conditionKindInput = ref<InputSelectOption<ConditionKind | "">>({
    name: "condition-kind",
    placeholder: "Select one",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: conditionKindOptions,
  });

  const init = ref<boolean>(true);

  const conditions = ref<FunctionTaskCondition[]>([]);

  const kind = computed<ConditionKind | "">(
    () => conditionKindInput.value.model.value
  );
  const logical = computed<FunctionTaskCondition>(() => {
    if (conditionKindInput.value.model.value === "and") {
      return {
        and: conditions.value,
      };
    } else if (conditionKindInput.value.model.value === "or") {
      return {
        or: conditions.value,
      };
    }
    return {};
  });

  function conditionAdd() {
    conditions.value.push({});
  }
  function conditionRemove(i: number) {
    conditions.value.splice(i, 1);
  }
  function conditionUpdate(value: FunctionTaskCondition) {
    if (value.and) {
      props.condition.and = value.and;
    } else if (value.or) {
      props.condition.or = value.or;
    } else if (value.sensor) {
      props.condition.sensor = value.sensor;
    } else if (value.relay) {
      props.condition.relay = value.relay;
    } else {
      delete props.condition.and;
      delete props.condition.or;
      delete props.condition.sensor;
      delete props.condition.relay;
    }
  }

  watch(
    () => logical.value,
    (val) => {
      if (init.value) return;
      if (val.and) {
        delete props.condition.sensor;
        delete props.condition.relay;
        props.condition.and = val.and;
      } else if (val.or) {
        delete props.condition.sensor;
        delete props.condition.relay;
        props.condition.or = val.or;
      } else {
        delete props.condition.and;
        delete props.condition.or;
      }
    },
    { deep: true }
  );
  watch(
    () => kind.value,
    () => {
      if (init.value) return;
      conditions.value = [];
    }
  );

  onMounted(() => {
    if (props.condition.and) {
      conditionKindInput.value.model = {
        name: "And",
        value: "and",
      };
      conditions.value = props.condition.and;
    } else if (props.condition.or) {
      conditionKindInput.value.model = {
        name: "Or",
        value: "or",
      };
      conditions.value = props.condition.or;
    } else {
      conditionKindInput.value.model = {
        name: "Statement",
        value: "statement",
      };
    }
    setTimeout(() => {
      init.value = false;
    }, 250);
  });
</script>

<style lang="scss" scoped>
  .gd-condition {
    position: relative;
    border: var(--border);
    border-radius: 0.5rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    > .gd-condition-input {
      position: relative;
      padding: 0.75rem;
      box-sizing: border-box;
      display: flex;
      gap: 0.5rem;

      & + .gd-condition-content-wrapper {
        > .gd-condition-content {
          padding: 0.75rem;
          border-top: var(--border);
        }
      }
    }

    > .gd-condition-content-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;

      > .gd-condition-content {
        position: relative;
        padding: 0 0.75rem 0.75rem 0.75rem;
        box-sizing: border-box;
      }
    }

    > .gd-condition-statement {
      position: relative;
      padding: 0.75rem;
      border-top: var(--border);
      box-sizing: border-box;
    }

    > .gd-condition-action {
      position: relative;
      width: 100%;
      padding: 0 0.75rem 0.75rem 0.75rem;
      box-sizing: border-box;
      display: flex;
    }
  }
</style>
