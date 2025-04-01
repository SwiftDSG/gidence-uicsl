<template>
  <div class="gd-watcher">
    <div class="gd-watcher-information-container" @click="emits('open')">
      <span class="gd-watcher-information-name gd-headline-5">{{
        watcher.name
      }}</span>
    </div>
    <div class="gd-watcher-action-container">
      <gd-input-button-small
        :tooltip="watcher.active ? 'Disable watcher' : 'Enable watcher'"
        icon="power"
        @clicked="toggle"
        :loading="watcherLoading"
        :type="watcher.active ? 'default' : 'primary'"
      />
      <gd-input-button-small
        tooltip="Delete watcher"
        icon="delete"
        type="error"
        @clicked="emits('delete', watcher)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Watcher } from "~/types/watcher";

  const props = defineProps<{
    watcher: Watcher;
  }>();
  const emits = defineEmits(["open", "delete"]);

  const { updateWatcher } = useWatcher();

  const watcherLoading = ref<boolean>(false);

  async function toggle() {
    watcherLoading.value = true;

    const payload = {
      ...props.watcher,
      active: !props.watcher.active,
    };

    await updateWatcher(payload);

    setTimeout(async () => {
      watcherLoading.value = false;
    }, 500);
  }
</script>

<style lang="scss" scoped>
  .gd-watcher {
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

    .gd-watcher-information-container {
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

    .gd-watcher-action-container {
      position: relative;
      display: flex;
      gap: 0.5rem;
    }
  }
</style>
