<template>
  <div class="gd-port" :class="selected === port.id ? 'gd-port-active' : ''">
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
        :disabled="locked"
        @clicked="openMenu({ deviceInformation: { port } })"
      />
    </div>
    <div v-if="devices.length" class="gd-port-body">
      <div
        v-for="device in devices"
        class="gd-port-device"
        :class="
          dragId && dragId !== (device.sensor?.id || device.relay?.id || '')
            ? 'gd-port-device-dragging'
            : ''
        "
        :key="device.sensor?.id || device.relay?.id || ''"
        :data-id="id"
        :data-device-id="device.sensor?.id || device.relay?.id || ''"
        :onmousedown="mouseDown"
        :onmouseup="changePosition"
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
        <div class="gd-port-device-overlay"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Port } from "~/types/port";
  import type { Relay } from "~/types/relay";
  import type { Sensor } from "~/types/sensor";

  const props = defineProps<{
    port: Port;
    devices: {
      sensor?: Sensor;
      relay?: Relay;
    }[];
    selected: string | null;
  }>();
  const { locked, reading, order, openMenu } = useMain();

  const gdTarget = ref<HTMLElement | null>(null);

  const mouseY = ref<number>(0);
  const mouseX = ref<number>(0);

  const dragId = ref<string>("");

  const id = computed<string>(() => props.port.id);

  function mouseDown(e: MouseEvent) {
    e.stopPropagation();

    let depth = 0;
    let gdCurrentTarget = e.currentTarget as HTMLElement;
    while (gdCurrentTarget.dataset.id !== id.value && depth < 8) {
      gdCurrentTarget = gdCurrentTarget.parentElement as HTMLElement;
      depth++;
    }

    if (depth >= 8) {
      return;
    }

    gdTarget.value = gdCurrentTarget;

    mouseX.value = e.clientX;
    mouseY.value = e.clientY;

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
  }
  function mouseMove(e: MouseEvent) {
    e.stopPropagation();

    // Move the element relative to the mouse position, using translate
    if (!gdTarget.value) {
      return;
    }

    dragId.value = gdTarget.value.dataset.deviceId || "";
    gdTarget.value.style.pointerEvents = "none";

    const x = e.clientX - mouseX.value;
    const y = e.clientY - mouseY.value;

    gdTarget.value.style.transform = `translate(${x}px, ${y}px)`;
    gdTarget.value.style.zIndex = "1000";
  }
  function mouseUp(e: MouseEvent) {
    // Reset the element's position and remove the event listeners
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", mouseUp);

    if (!gdTarget.value) {
      return;
    }

    gdTarget.value.removeAttribute("style");
    gdTarget.value = null;
    dragId.value = "";

    mouseX.value = 0;
    mouseY.value = 0;
  }
  function changePosition(e: MouseEvent) {
    if (!gdTarget.value) {
      return;
    }

    const targetIndex = props.devices.findIndex(
      (device) => (device.sensor?.id || device.relay?.id) === dragId.value
    );
    if (targetIndex === -1) {
      return;
    }

    const newIndex = props.devices.findIndex(
      (device) =>
        (device.sensor?.id || device.relay?.id) ===
        (e.currentTarget as HTMLElement)?.dataset?.deviceId
    );
    if (newIndex === -1) {
      return;
    }

    const temp = props.devices[targetIndex];
    props.devices[targetIndex] = props.devices[newIndex];
    props.devices[newIndex] = temp;

    // Change order
    const orderCopy = JSON.parse(JSON.stringify(order.value.device[id.value]));
    const tempOrder = orderCopy[targetIndex];
    orderCopy[targetIndex] = orderCopy[newIndex];
    orderCopy[newIndex] = tempOrder;
    order.value.device[id.value] = orderCopy;
  }
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
        user-select: none;
        position: relative;
        width: calc((100% - 2.25rem) / 4);
        height: 5.5rem;
        background: var(--background-depth-one-color);
        border: var(--border);
        border-radius: 0.75rem;
        box-sizing: border-box;

        .gd-port-device-overlay {
          pointer-events: none;
          position: absolute;
          top: -1px;
          left: -1px;
          width: calc(100% + 2px);
          height: calc(100% + 2px);
          border-radius: 0.75rem;
          border: 2px solid var(--primary-color);
          box-sizing: border-box;
          opacity: 0;
          backdrop-filter: blur(10px);

          &::after {
            content: "";
            position: relative;
            width: 100%;
            height: 100%;
            display: block;
            background: var(--primary-color);
            opacity: 0.2;
            border-radius: 0.75rem;
          }
        }

        &.gd-port-device-dragging {
          .gd-port-device-overlay {
            pointer-events: auto;
            opacity: 1;
          }
        }
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
