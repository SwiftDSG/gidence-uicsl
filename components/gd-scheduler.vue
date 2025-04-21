<template>
  <div class="gd-scheduler">
    <div class="gd-scheduler-information-container" @click="emits('open')">
      <span class="gd-scheduler-information-name gd-headline-5">{{
        scheduler.name
      }}</span>
    </div>
    <div class="gd-scheduler-action-container">
      <gd-input-button-small
        :tooltip="scheduler.active ? 'Disable scheduler' : 'Enable scheduler'"
        icon="power"
        @clicked="toggle"
        :loading="schedulerLoading"
        :type="scheduler.active ? 'default' : 'primary'"
      />
      <gd-input-button-small
        tooltip="Delete scheduler"
        icon="delete"
        type="error"
        @clicked="emits('delete', scheduler)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Scheduler } from "~/types/scheduler";

  const props = defineProps<{
    scheduler: Scheduler;
  }>();
  const emits = defineEmits(["open", "delete"]);

  const { updateDeviceScheduler } = useMain();
  const { updateScheduler } = useScheduler();

  const schedulerLoading = ref<boolean>(false);

  async function toggle() {
    schedulerLoading.value = true;

    const payload = {
      ...props.scheduler,
      active: !props.scheduler.active,
    };

    const result = await updateScheduler(payload);

    setTimeout(async () => {
      if (result) {
        updateDeviceScheduler(result);
      }
      schedulerLoading.value = false;
    }, 500);
  }
</script>

<style lang="scss" scoped>
  .gd-scheduler {
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

    .gd-scheduler-information-container {
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

    .gd-scheduler-action-container {
      position: relative;
      display: flex;
      gap: 0.5rem;
    }
  }
</style>
