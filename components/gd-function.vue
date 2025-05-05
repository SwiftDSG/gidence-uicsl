<template>
  <div class="gd-function" :class="pinned ? 'gd-function-pinned' : ''">
    <div
      class="gd-function-information-container"
      @click="emits('open', props.function)"
    >
      <span class="gd-function-information-name gd-headline-5">{{
        props.function.name
      }}</span>
    </div>
    <div class="gd-function-action-container">
      <gd-input-button-small
        v-if="!pinned"
        :tooltip="index >= 0 ? 'Unpin function' : 'Pin function'"
        icon="pin"
        @clicked="pinHandler"
        :loading="functionLoading"
        :type="index >= 0 ? 'primary' : 'default'"
      />
      <gd-input-button-small
        tooltip="Run function"
        icon="play"
        @clicked="run"
        :loading="functionLoading"
      />
      <gd-input-button-small
        v-if="!pinned"
        tooltip="Delete function"
        icon="delete"
        type="error"
        @clicked="emits('delete', props.function)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Function } from "~/types/function";

  const props = defineProps<{
    function: Function;
    pinned?: boolean;
  }>();
  const emits = defineEmits(["open", "delete"]);
  const { pin, getDevice } = useMain();
  const { executeFunction } = useFunction();

  const functionLoading = ref<boolean>(false);

  const index = computed(() => {
    return pin.value.findIndex((a) => a === props.function.id);
  });

  async function run() {
    functionLoading.value = true;

    await executeFunction(props.function);
    await getDevice();

    setTimeout(async () => {
      functionLoading.value = false;
    }, 500);
  }

  function pinHandler() {
    if (index.value === -1) {
      pin.value.push(props.function.id);
    } else {
      pin.value.splice(index.value, 1);
    }
  }
</script>

<style lang="scss" scoped>
  .gd-function {
    position: relative;
    width: 100%;
    padding: 0.75rem;
    background: var(--background-depth-one-color);
    border-radius: 0.75rem;
    border: var(--border);
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .gd-function-information-container {
      cursor: pointer;
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      * {
        pointer-events: none;
      }
    }

    .gd-function-action-container {
      position: relative;
      display: flex;
      gap: 0.5rem;
    }

    &.gd-function-pinned {
      background: var(--background-depth-two-color);
      border: var(--border);
      border-radius: 1rem;
    }
  }
</style>
