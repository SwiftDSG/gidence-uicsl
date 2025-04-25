<template>
  <div
    class="gd-port"
    :class="selected === port.id ? 'gd-port-active' : ''"
    :key="port.id"
  >
    <div class="gd-port-header">
      <div
        class="gd-port-information-container"
        @click="openMenu({ port: { port } })"
      >
        <span class="gd-port-information gd-headline-4">
          {{ port.name }}
        </span>
        <span class="gd-port-information-description gd-caption-text">
          {{ `${port.address.host.join(".")}:${port.address.port}` }}
        </span>
      </div>
      <gd-input-button
        label="add device"
        type="background"
        :radius="0.75"
        @clicked="openMenu({ deviceInformation: { port } })"
      />
    </div>
    <div v-if="devices.length" class="gd-port-body">
      <div
        v-for="device in devices"
        class="gd-port-device"
        :key="device.sensor?.id || device.relay?.id || ''"
      >
        <gd-sensor
          v-if="device.sensor && reading"
          :selected="selected === device.sensor.id"
          :sensor="device.sensor"
          :reading="reading.sensor[device.sensor.id]"
          @select="openMenu({ sensor: { sensor: device.sensor, port: port } })"
        />
        <gd-relay
          v-if="device.relay && reading"
          :selected="selected === device.relay.id"
          :relay="device.relay"
          :reading="reading.relay[device.relay.id]"
          @select="openMenu({ relay: { relay: device.relay, port: port } })"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Port } from "~/types/port";
  import type { Relay } from "~/types/relay";
  import type { Sensor } from "~/types/sensor";

  defineProps<{
    port: Port;
    devices: {
      sensor?: Sensor;
      relay?: Relay;
    }[];
    selected: string | null;
  }>();
  const { reading, openMenu } = useMain();
</script>

<style lang="scss" scoped>
  .gd-port {
    position: relative;
    width: 100%;
    background: var(--background-depth-two-color);
    padding: 1rem;
    border: var(--border);
    border-radius: 1rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .gd-port-header {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: space-between;

      .gd-port-information-container {
        cursor: pointer;
        position: relative;
        height: 2rem;

        span {
          white-space: nowrap;
        }

        span:first-child {
          position: absolute;
          top: 0;
        }

        span:last-child {
          position: absolute;
          bottom: 0;
        }
      }
    }

    .gd-port-body {
      position: relative;
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;

      .gd-port-device {
        position: relative;
        width: calc((100% - 2.25rem) / 4);
        background: var(--background-depth-one-color);
        border: var(--border);
        border-radius: 0.75rem;
        box-sizing: border-box;
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
      border-radius: calc(1rem + 2px);
      box-sizing: border-box;
      box-shadow: 0 0 6px 0 var(--primary-color);
      opacity: 0;
      transition: opacity 0.25s ease-in-out;
    }

    &.gd-port-active::before {
      opacity: 1;
    }
    @media only screen and (max-width: 640px) {
      .gd-port-body {
        .gd-port-device {
          width: 100%;
        }
      }
    }
  }
</style>
