<template>
  <div class="gd-container">
    <gd-input-select class="gd-menu-input" :input="kindInput" />
  </div>
</template>

<script setup lang="ts">
  import type { InputSelectOption } from "~/types/general";
  import type { Sensor } from "~/types/sensor";

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
</script>

<style lang="scss" scoped>
  .gd-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    padding: 0 calc(50vw - 5rem);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
