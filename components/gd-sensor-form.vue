<template>
  <div class="gd-menu-input-container">
    <div class="gd-menu-input-wrapper">
      <gd-input-select class="gd-menu-input" :input="kindInput" />
    </div>
    <div class="gd-menu-input-wrapper">
      <gd-input-select class="gd-menu-input" :input="formatInput" />
    </div>
    <div class="gd-menu-input-wrapper">
      <gd-input-text class="gd-menu-input" :input="addressInput" />
    </div>
    <div class="gd-menu-input-wrapper">
      <gd-input-text class="gd-menu-input" :input="deviceInput" />
    </div>
    <div class="gd-menu-input-test-container">
      <span class="gd-menu-input-test-label gd-caption-text"
        >Sensor reading test</span
      >
      <div class="gd-menu-input-test">
        <span
          class="gd-menu-input-test-value gd-headline-3"
          :class="testError ? 'gd-menu-input-test-value-error' : ''"
          >{{ testValue }}</span
        >
        <gd-input-button-small
          :disabled="!sensor"
          :loading="testLoading"
          @clicked="test"
          icon="rotate"
          type="primary"
          tooltip="Test configuration"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { InputOption, InputSelectOption } from "~/types/general";
  import type { Port } from "~/types/port";
  import type { Sensor } from "~/types/sensor";

  const { readSensor } = useSensor();
  const props = defineProps<{
    name: string;
    port: Port;
    sensor: Sensor | null;
  }>();
  const emits = defineEmits(["update-payload"]);

  const kindInput = ref<InputSelectOption<Sensor["kind"] | "">>({
    name: "sensor-kind",
    label: "Sensor type",
    placeholder: "Select one",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "Temperature",
        value: "temperature",
      },
      {
        name: "Discharge / Flow",
        value: "discharge",
      },
      {
        name: "Pressure",
        value: "pressure",
      },
    ],
  });
  const formatInput = ref<InputSelectOption<Sensor["format"] | "">>({
    name: "sensor-format",
    label: "Reading data type",
    placeholder: "Select one",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "Float 32 Big Endian",
        value: "f32be",
      },
      {
        name: "UInt 32",
        value: "u32",
      },
      {
        name: "Int 16",
        value: "i16",
      },
      {
        name: "Mod 10",
        value: "mod10",
      },
    ],
  });
  const deviceInput = ref<InputOption>({
    name: "device",
    label: "Device (Slave ID)",
    placeholder: "1",
    model: {
      name: "",
      value: "",
    },
  });
  const addressInput = ref<InputOption>({
    name: "address",
    label: "Offset",
    placeholder: "0",
    model: {
      name: "",
      value: "",
    },
  });

  const testLoading = ref<boolean>(false);
  const testValue = ref<string>("N/A");
  const testError = ref<boolean>(false);

  const sensor = computed<Sensor | null>(() => {
    const device = parseInt(deviceInput.value.model.value);
    const address = parseInt(addressInput.value.model.value);
    const kind = kindInput.value.model.value;
    const format = formatInput.value.model.value;

    if (
      !props.name ||
      !format ||
      !kind ||
      isNaN(device) ||
      isNaN(address) ||
      device < 0 ||
      address < 0
    )
      return null;

    return {
      id: props.sensor?.id || "",
      port_id: props.port.id,
      name: props.name,
      device,
      address,
      format,
      kind,
      adjustment: [],
    };
  });

  async function test(): Promise<void> {
    try {
      if (!sensor.value) return;

      testLoading.value = true;

      const response = await readSensor(sensor.value);

      setTimeout(async () => {
        testLoading.value = false;
        if (response === null) {
          testValue.value = "Invalid task";
          throw new Error("");
        }

        testError.value = false;
        testValue.value = response;
      }, 500);
    } catch (e) {
      testError.value = true;
    }
  }

  const sensorKinds = {
    temperature: "Temperature",
    discharge: "Discharge / Flow",
    pressure: "Pressure",
  };
  const sensorFormats = {
    f32be: "Float 32 Big Endian",
    u32: "UInt 32",
    i16: "Int 16",
    mod10: "Mod 10",
  };

  watch(
    () => sensor.value,
    () => {
      emits("update-payload", sensor.value);
    },
    { deep: true }
  );

  onMounted(() => {
    if (props.sensor) {
      kindInput.value.model = {
        name: sensorKinds[props.sensor.kind],
        value: props.sensor.kind,
      };
      deviceInput.value.model = {
        name: props.sensor.toString(),
        value: props.sensor.toString(),
      };
      addressInput.value.model = {
        name: props.sensor.address.toString(),
        value: props.sensor.address.toString(),
      };
      formatInput.value.model = {
        name: sensorFormats[props.sensor.format],
        value: props.sensor.format,
      };
    }
  });
</script>

<style lang="scss" scoped>
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
  }
</style>
