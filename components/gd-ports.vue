<template>
  <div class="gd-ports">
    <div class="gd-port" v-for="port in ports" :key="port.id"
      :class="dragId && dragId !== port.id ? 'gd-port-dragging' : ''" :data-id="id" :data-port-id="port.id"
      :onmousedown="mouseDown" :onmouseup="changePosition">
      <gd-port :port="port" :devices="devices[port.id] || []" :selected="selected"
        @select="openMenu({ port: { port } })" />
      <div class="gd-port-overlay"></div>
    </div>
    <div class="gd-ports-actions">
      <gd-input-button label="add port" type="background" :radius="1" @clicked="
        openMenu({
          portInformation: {},
        })
        " />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Controller } from "~/types/controller";
import type { Port } from "~/types/port";
import type { Relay } from "~/types/relay";
import type { Sensor } from "~/types/sensor";

const props = defineProps<{
  controller: Controller;
  ports: Port[];
  devices: Record<
    string,
    {
      relay?: Relay;
      sensor?: Sensor;
    }[]
  >;
  selected: string | null;
}>();
const { order, openMenu } = useMain();

const gdTarget = ref<HTMLElement | null>(null);

const mouseY = ref<number>(0);
const mouseX = ref<number>(0);

const dragId = ref<string>("");

const id = computed<string>(() => props.controller.id);

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

  dragId.value = gdTarget.value.dataset.portId || "";
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

  const targetIndex = props.ports.findIndex(
    (port) => port.id === dragId.value
  );
  if (targetIndex === -1) {
    return;
  }

  const newIndex = props.ports.findIndex(
    (port) => port.id === (e.currentTarget as HTMLElement)?.dataset?.portId
  );
  if (newIndex === -1) {
    return;
  }

  const temp = props.ports[targetIndex];
  props.ports[targetIndex] = props.ports[newIndex];
  props.ports[newIndex] = temp;

  // Change order
  const orderCopy = JSON.parse(JSON.stringify(order.value.port));
  const tempOrder = orderCopy[targetIndex];
  orderCopy[targetIndex] = orderCopy[newIndex];
  orderCopy[newIndex] = tempOrder;
  order.value.port = orderCopy;
}
</script>

<style lang="scss" scoped>
.gd-ports {
  position: relative;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .gd-port {
    user-select: none;
    position: relative;
    width: 100%;
    display: flex;

    .gd-port-overlay {
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

    &.gd-port-dragging {
      .gd-port-overlay {
        pointer-events: auto;
        opacity: 1;
      }
    }
  }
}
</style>
