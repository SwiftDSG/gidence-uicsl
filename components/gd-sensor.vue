<template>
  <div class="gd-sensor" :class="`${selected ? ' gd-sensor-active' : ''}`">
    <div class="gd-sensor-header">
      <div class="gd-sensor-information-container" @click="emits('select')">
        <div class="gd-sensor-information-icon-container">
          <gd-svg class="gd-sensor-information-icon" name="thermometer" />
        </div>
        <div class="gd-sensor-information">
          <span class="gd-sensor-information-name gd-headline-5">{{
            sensor.name
          }}</span>
          <span class="gd-sensor-information-kind gd-caption-text">{{
            sensor.kind
          }}</span>
        </div>
      </div>
    </div>
    <div class="gd-sensor-body">
      <div class="gd-sensor-value-container">
        <span class="gd-sensor-value gd-headline-3">{{ valuePrinted }}</span>
        <span class="gd-sensor-value-unit gd-headline-5">{{ valueUnit }}</span>
      </div>
      <span class="gd-sensor-value-date gd-caption-text">{{
        formatDateTime(reading?.[1])
      }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Sensor } from "~/types/sensor";

  const emits = defineEmits(["select"]);
  const props = defineProps<{
    selected: boolean;
    sensor: Sensor;
    reading?: [number, number];
  }>();

  const valuePrinted = computed<string>(() => {
    if (!props.reading) return "N/A";
    const value = props.reading[0].toFixed(2);

    return `${value}`;
  });
  const valueUnit = computed<string>(() => {
    let unit = "";

    switch (props.sensor.kind) {
      case "temperature":
        unit = "°C";
        break;
      default:
        unit = "";
        break;
    }

    return unit;
  });

  function formatDateTime(x?: string | number): string {
    if (!x || props.reading === undefined) return "N/A";
    const date = new Date(x);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
  }
</script>

<style lang="scss" scoped>
  .gd-sensor {
    position: relative;
    border-radius: 0.75rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .gd-sensor-header {
      position: relative;
      width: 100%;
      height: 3.5rem;
      padding: 0.75rem;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .gd-sensor-information-container {
        cursor: pointer;
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;

        .gd-sensor-information-icon-container {
          position: relative;
          width: 2rem;
          height: 2rem;
          padding-right: 0.5rem;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
        }

        .gd-sensor-information {
          position: relative;
          width: calc(100% - 2rem);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;

          span.gd-sensor-information-name {
            position: relative;
            width: 100%;
            text-wrap: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }

          span.gd-sensor-information-kind {
            position: relative;
            text-transform: capitalize;
          }
        }
      }
    }

    .gd-sensor-body {
      position: relative;
      width: 100%;
      padding: 0 0.75rem 0.75rem 0.75rem;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: last baseline;

      .gd-sensor-value-container {
        position: relative;
        display: flex;
        align-items: last baseline;

        span.gd-sensor-value-unit {
          position: relative;
          opacity: 0.5;
        }
      }

      span.gd-sensor-value-date {
        position: relative;
        line-height: 1;
      }
    }

    &::before {
      content: "";
      position: absolute;
      top: -3px;
      left: -3px;
      width: calc(100% + 6px);
      height: calc(100% + 6px);
      border: 2px solid var(--primary-color);
      border-radius: calc(0.5rem + 2px);
      box-sizing: border-box;
      box-shadow: 0 0 6px 0 var(--primary-color);
      opacity: 0;
      transition: opacity 0.25s ease-in-out;
    }

    &.gd-sensor-active::before {
      opacity: 1;
    }
  }
</style>
