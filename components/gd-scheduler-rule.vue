<template>
  <div class="gd-scheduler-rule">
    <div class="gd-scheduler-rule-header">
      <div class="gd-scheduler-rule-information">
        <div class="gd-scheduler-rule-information-indicator">
          <gd-svg v-if="kind === 'value'" name="target" />
          <gd-svg v-else-if="kind === 'interval'" name="interval" />
          <gd-svg v-else name="dots" />
        </div>
        <gd-input-select :input="ruleKindInput" style="width: 8rem" />
      </div>
      <gd-input-button-small icon="close" @clicked="emits('remove')" />
    </div>
    <div v-if="kind === 'value'" class="gd-scheduler-rule-body">
      <div class="gd-scheduler-rule-input-wrapper">
        <gd-input-text
          class="gd-scheduler-rule-input"
          :input="ruleValueHourInput"
        />
        <span class="gd-scheduler-rule-input-divider gd-headline-6">:</span>
        <gd-input-text
          class="gd-scheduler-rule-input"
          :input="ruleValueMinuteInput"
        />
      </div>
    </div>
    <div v-else-if="kind === 'interval'" class="gd-scheduler-rule-body">
      <div class="gd-scheduler-rule-input-wrapper">
        <gd-input-text
          class="gd-scheduler-rule-input"
          :input="ruleIntervalStartHourInput"
        />
        <span class="gd-scheduler-rule-input-divider gd-headline-6">:</span>
        <gd-input-text
          class="gd-scheduler-rule-input"
          :input="ruleIntervalStartMinuteInput"
        />
        <span class="gd-scheduler-rule-input-divider gd-headline-6">until</span>
        <gd-input-text
          class="gd-scheduler-rule-input"
          :input="ruleIntervalEndHourInput"
        />
        <span class="gd-scheduler-rule-input-divider gd-headline-6">:</span>
        <gd-input-text
          class="gd-scheduler-rule-input"
          :input="ruleIntervalEndMinuteInput"
        />
      </div>
      <div class="gd-scheduler-rule-input-wrapper">
        <gd-input-text
          class="gd-scheduler-rule-input"
          :input="ruleIntervalInput"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { InputOption, InputSelectOption } from "~/types/general";
  import type { SchedulerRule } from "~/types/scheduler";

  type RuleKind = "value" | "interval";

  const props = defineProps<{
    rule: SchedulerRule;
  }>();
  const emits = defineEmits(["remove", "update"]);

  const ruleKindOptions: InputSelectOption<RuleKind>["options"] = [
    {
      name: "Exact time",
      value: "value",
    },
    {
      name: "Time interval",
      value: "interval",
    },
  ];
  const ruleKindInput = ref<InputSelectOption<RuleKind | "">>({
    name: "rule-kind",
    placeholder: "Select one",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: ruleKindOptions,
  });
  const ruleValueHourInput = ref<InputOption>({
    name: "rule-value-hour",
    placeholder: "HH",
    model: {
      name: "",
      value: "",
    },
    alignment: "center",
  });
  const ruleValueMinuteInput = ref<InputOption>({
    name: "rule-value-minute",
    placeholder: "MM",
    model: {
      name: "",
      value: "",
    },
    alignment: "center",
  });
  const ruleIntervalStartHourInput = ref<InputOption>({
    name: "rule-interval-start-hour",
    placeholder: "HH",
    model: {
      name: "",
      value: "",
    },
    alignment: "center",
  });
  const ruleIntervalStartMinuteInput = ref<InputOption>({
    name: "rule-interval-start-minute",
    placeholder: "MM",
    model: {
      name: "",
      value: "",
    },
    alignment: "center",
  });
  const ruleIntervalEndHourInput = ref<InputOption>({
    name: "rule-interval-end-hour",
    placeholder: "HH",
    model: {
      name: "",
      value: "",
    },
    alignment: "center",
  });
  const ruleIntervalEndMinuteInput = ref<InputOption>({
    name: "rule-interval-end-minute",
    placeholder: "MM",
    model: {
      name: "",
      value: "",
    },
    alignment: "center",
  });
  const ruleIntervalInput = ref<InputOption>({
    name: "rule-interval",
    placeholder: "Interval in minutes",
    type: "number",
    model: {
      name: "",
      value: "",
    },
    alignment: "center",
  });

  const kind = computed<RuleKind | "">(() => ruleKindInput.value.model.value);
  const rule = computed<SchedulerRule>(() => {
    let rule: SchedulerRule = {};

    if (kind.value === "value") {
      const hour = parseInt(ruleValueHourInput.value.model.value);
      const minute = parseInt(ruleValueMinuteInput.value.model.value);
      rule.value = [hour, minute];
    } else if (kind.value === "interval") {
      const startHour = parseInt(ruleIntervalStartHourInput.value.model.value);
      const startMinute = parseInt(
        ruleIntervalStartMinuteInput.value.model.value
      );
      const endHour = parseInt(ruleIntervalEndHourInput.value.model.value);
      const endMinute = parseInt(ruleIntervalEndMinuteInput.value.model.value);
      const interval = parseInt(ruleIntervalInput.value.model.value);

      rule.interval = [
        [startHour, startMinute],
        [endHour, endMinute],
        interval,
      ];
    }

    return rule;
  });

  watch(
    () => rule.value,
    (val) => {
      if (val) {
        emits("update", val);
      }
    },
    { deep: true }
  );

  onMounted(() => {
    if (props.rule.value) {
      ruleValueHourInput.value.model = {
        name: props.rule.value[0].toString().padStart(2, "0"),
        value: props.rule.value[0],
      };
      ruleValueMinuteInput.value.model = {
        name: props.rule.value[1].toString().padStart(2, "0"),
        value: props.rule.value[1],
      };
      ruleKindInput.value.model = {
        name: "Exact time",
        value: "value",
      };
    } else if (props.rule.interval) {
      ruleIntervalStartHourInput.value.model = {
        name: props.rule.interval[0][0].toString().padStart(2, "0"),
        value: props.rule.interval[0][0],
      };
      ruleIntervalStartMinuteInput.value.model = {
        name: props.rule.interval[0][1].toString().padStart(2, "0"),
        value: props.rule.interval[0][1],
      };
      ruleIntervalEndHourInput.value.model = {
        name: props.rule.interval[1][0].toString().padStart(2, "0"),
        value: props.rule.interval[1][0],
      };
      ruleIntervalEndMinuteInput.value.model = {
        name: props.rule.interval[1][1].toString().padStart(2, "0"),
        value: props.rule.interval[1][1],
      };
      ruleIntervalInput.value.model = {
        name: props.rule.interval[2].toString().padStart(2, "0"),
        value: props.rule.interval[2],
      };
      ruleKindInput.value.model = {
        name: "Time interval",
        value: "interval",
      };
    }
  });
</script>

<style lang="scss" scoped>
  .gd-scheduler-rule {
    position: relative;
    width: 100%;
    padding: 0.75rem;
    border: var(--border);
    border-radius: 0.5rem;
    background: var(--background-depth-one-color);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .gd-scheduler-rule-header {
      position: relative;
      width: 100%;
      height: 2rem;
      display: flex;
      justify-content: space-between;

      .gd-scheduler-rule-information {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .gd-scheduler-rule-information-indicator {
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

    .gd-scheduler-rule-body {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      gap: 0.75rem;

      .gd-scheduler-rule-input-wrapper {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: space-between;
        gap: 0.5rem;

        .gd-scheduler-rule-input {
          position: relative;
          width: 100%;
        }

        .gd-scheduler-rule-input-divider {
          position: relative;
          height: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
</style>
