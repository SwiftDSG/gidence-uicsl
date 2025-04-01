<template>
  <div class="gd-statement">
    <gd-input-select :input="instrumentInput" />
    <div class="gd-statement-comparison">
      <gd-input-select
        v-if="instrumentTypes[instrument] === 'sensor'"
        :input="sensorComparisonInput"
        style="width: calc((100% - 0.5rem) / 2)"
      />
      <gd-input-select
        v-else-if="instrumentTypes[instrument] === 'relay'"
        :input="relayComparisonInput"
        style="width: calc((100% - 0.5rem) / 2)"
      />
      <gd-input-select
        v-else
        :input="{
          name: 'comparison',
          placeholder: 'Comparison',
          strict: true,
          model: {
            name: '',
            value: '',
          },
          options: [],
        }"
        style="width: calc((100% - 0.5rem) / 2)"
      />
      <gd-input-text
        v-if="instrumentTypes[instrument] === 'sensor'"
        :input="sensorValueInput"
        style="width: calc((100% - 0.5rem) / 2)"
      />
      <gd-input-select
        v-else-if="instrumentTypes[instrument] === 'relay'"
        :input="relayValueInput"
        style="width: calc((100% - 0.5rem) / 2)"
      />
      <gd-input-text
        v-else
        :input="{
          name: 'value',
          placeholder: 'Value',
          disabled: true,
          model: {
            name: '',
            value: '',
          },
        }"
        style="width: calc((100% - 0.5rem) / 2)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type {
    FunctionTaskCondition,
    FunctionTaskConditionRelayComparison,
    FunctionTaskConditionSensorComparison,
  } from "~/types/function";
  import type { InputOption, InputSelectOption } from "~/types/general";
  import { Relay } from "~/types/relay";
  import { Sensor } from "~/types/sensor";

  const props = defineProps<{
    condition?: FunctionTaskCondition;
    sensor: Sensor[];
    relay: Relay[];
  }>();
  const emtis = defineEmits(["update"]);

  const sensorComparisonNames = {
    lessthan: "LT (<)",
    lessthanequal: "LTE (≤)",
    greaterthan: "GT (>)",
    greaterthanequal: "GTE (≥)",
    equal: "E (=)",
    notequal: "NE (≠)",
  };
  const relayComparisonNames = {
    equal: "E (=)",
    notequal: "NE (≠)",
  };

  const instrumentTypes = ref<{
    [k: string]: "relay" | "sensor";
  }>({});
  const instrumentInputOptions = ref<InputSelectOption["options"]>([]);
  const instrumentInput = ref<InputSelectOption>({
    name: "instrument",
    placeholder: "Instrument",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [],
  });

  const sensorComparisonInput = ref<
    InputSelectOption<
      | "lessthan"
      | "lessthanequal"
      | "greaterthan"
      | "greaterthanequal"
      | "equal"
      | "notequal"
      | ""
    >
  >({
    name: "sensor-comparison",
    placeholder: "Comparison",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "LT (<)",
        value: "lessthan",
      },
      {
        name: "LTE (≤)",
        value: "lessthanequal",
      },
      {
        name: "GT (>)",
        value: "greaterthan",
      },
      {
        name: "GTE (≥)",
        value: "greaterthanequal",
      },
      {
        name: "E (=)",
        value: "equal",
      },
      {
        name: "NE (≠)",
        value: "notequal",
      },
    ],
  });
  const sensorValueInput = ref<InputOption>({
    name: "sensor-value",
    placeholder: "Value",
    model: {
      name: "",
      value: "",
    },
  });
  const relayComparisonInput = ref<
    InputSelectOption<"equal" | "notequal" | "">
  >({
    name: "relay-comparison",
    placeholder: "Comparison",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "E (=)",
        value: "equal",
      },
      {
        name: "NE (≠)",
        value: "notequal",
      },
    ],
  });
  const relayValueInput = ref<InputSelectOption<boolean | "">>({
    name: "relay-value",
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

  function fillOptions(datas: Sensor[] | Relay[]) {
    for (const instrument of datas) {
      instrumentInputOptions.value.push({
        name: instrument.name,
        value: instrument.id,
      });
      if (!isNaN((instrument as Relay).position)) {
        instrumentTypes.value[instrument.id] = "relay";
      } else {
        instrumentTypes.value[instrument.id] = "sensor";
      }
    }
  }

  const instrument = computed<string>(() => instrumentInput.value.model.value);
  const statement = computed<FunctionTaskCondition>(() => {
    const type = instrumentTypes.value[instrument.value];
    if (type) {
      if (type === "sensor") {
        const kind = sensorComparisonInput.value.model.value;
        const value = parseFloat(sensorValueInput.value.model.value);

        if (!kind || isNaN(value)) return {};

        const comparison: FunctionTaskConditionSensorComparison = {};
        comparison[kind] = value;

        return {
          sensor: {
            sensor_id: instrument.value,
            comparison,
          },
        };
      } else if (type === "relay") {
        const kind = relayComparisonInput.value.model.value;
        const value = relayValueInput.value.model.value;

        if (!kind || typeof value === "string") return {};

        const comparison: FunctionTaskConditionRelayComparison = {};
        comparison[kind] = value;

        return {
          relay: {
            relay_id: instrument.value,
            comparison,
          },
        };
      }
    }
    return {};
  });

  watch(
    () => statement.value,
    (value) => {
      emtis("update", value || {});
    },
    { deep: true }
  );

  onMounted(() => {
    fillOptions(props.sensor);
    fillOptions(props.relay);

    instrumentInput.value.options = instrumentInputOptions.value;

    if (props.condition) {
      if (props.condition.sensor) {
        const sensor = props.condition.sensor;

        instrumentInput.value.model = {
          name:
            props.sensor.find((s) => s.id === sensor.sensor_id)?.name ||
            sensor.sensor_id,
          value: sensor.sensor_id,
        };

        if (sensor.comparison.equal !== undefined) {
          sensorComparisonInput.value.model = {
            name: "E (=)",
            value: "equal",
          };
          sensorValueInput.value.model = {
            name: sensor.comparison.equal.toString(),
            value: sensor.comparison.equal.toString(),
          };
        } else if (sensor.comparison.notequal !== undefined) {
          sensorComparisonInput.value.model = {
            name: "NE (≠)",
            value: "notequal",
          };
          sensorValueInput.value.model = {
            name: sensor.comparison.notequal.toString(),
            value: sensor.comparison.notequal.toString(),
          };
        } else if (sensor.comparison.lessthan !== undefined) {
          sensorComparisonInput.value.model = {
            name: "LT (<)",
            value: "lessthan",
          };
          sensorValueInput.value.model = {
            name: sensor.comparison.lessthan.toString(),
            value: sensor.comparison.lessthan.toString(),
          };
        } else if (sensor.comparison.lessthanequal !== undefined) {
          sensorComparisonInput.value.model = {
            name: "LTE (≤)",
            value: "lessthanequal",
          };
          sensorValueInput.value.model = {
            name: sensor.comparison.lessthanequal.toString(),
            value: sensor.comparison.lessthanequal.toString(),
          };
        } else if (sensor.comparison.greaterthan !== undefined) {
          sensorComparisonInput.value.model = {
            name: "GT (>)",
            value: "greaterthan",
          };
          sensorValueInput.value.model = {
            name: sensor.comparison.greaterthan.toString(),
            value: sensor.comparison.greaterthan.toString(),
          };
        } else if (sensor.comparison.greaterthanequal !== undefined) {
          sensorComparisonInput.value.model = {
            name: "GTE (≥)",
            value: "greaterthanequal",
          };
          sensorValueInput.value.model = {
            name: sensor.comparison.greaterthanequal.toString(),
            value: sensor.comparison.greaterthanequal.toString(),
          };
        }
      } else if (props.condition.relay) {
        const relay = props.condition.relay;

        instrumentInput.value.model = {
          name:
            props.relay.find((r) => r.id === relay.relay_id)?.name ||
            relay.relay_id,
          value: relay.relay_id,
        };

        if (relay.comparison.equal !== undefined) {
          relayComparisonInput.value.model = {
            name: "E (=)",
            value: "equal",
          };
          relayValueInput.value.model = {
            name: relay.comparison.equal ? "On" : "Off",
            value: relay.comparison.equal,
          };
        } else if (relay.comparison.notequal !== undefined) {
          relayComparisonInput.value.model = {
            name: "NE (≠)",
            value: "notequal",
          };
          relayValueInput.value.model = {
            name: relay.comparison.notequal ? "On" : "Off",
            value: relay.comparison.notequal,
          };
        }
      }
    }
  });
</script>

<style lang="scss" scoped>
  .gd-statement {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .gd-statement-comparison {
      position: relative;
      width: 100%;
      display: flex;
      gap: 0.5rem;
    }
  }
</style>
