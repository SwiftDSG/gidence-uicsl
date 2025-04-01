<template>
  <div class="gd-cron">
    <div class="gd-cron-information-container" @click="emits('open')">
      <span class="gd-cron-information-name gd-headline-5">{{
        cron.name
      }}</span>
    </div>
    <div class="gd-cron-action-container">
      <gd-input-button-small
        :tooltip="cron.active ? 'Disable cron' : 'Enable cron'"
        icon="power"
        @clicked="toggle"
        :loading="cronLoading"
        :type="cron.active ? 'default' : 'primary'"
      />
      <gd-input-button-small
        tooltip="Delete cron"
        icon="delete"
        type="error"
        @clicked="emits('delete', cron)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Cron } from "~/types/cron";

  const props = defineProps<{
    cron: Cron;
  }>();
  const emits = defineEmits(["open", "delete"]);

  const { updateDeviceCron } = useMain();
  const { updateCron } = useCron();

  const cronLoading = ref<boolean>(false);

  async function toggle() {
    cronLoading.value = true;

    const payload = {
      ...props.cron,
      active: !props.cron.active,
    };

    const result = await updateCron(payload);

    setTimeout(async () => {
      if (result) {
        updateDeviceCron(result);
      }
      cronLoading.value = false;
    }, 500);
  }
</script>

<style lang="scss" scoped>
  .gd-cron {
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

    .gd-cron-information-container {
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

    .gd-cron-action-container {
      position: relative;
      display: flex;
      gap: 0.5rem;
    }
  }
</style>
