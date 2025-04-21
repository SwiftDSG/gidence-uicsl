<template>
  <gd-menu :active="active" label="Schedulers List" class="gd-menu">
    <p class="gd-menu-message gd-caption-text">
      By creating a scheduler, you can decide when a function will be triggered.
      You will see your schedulers here.
    </p>
    <div v-if="schedulers.length" class="gd-menu-schedulers">
      <gd-scheduler
        v-for="scheduler in schedulers"
        :key="scheduler.id"
        :scheduler="scheduler"
        @open="
          openMenu({
            schedulerInformation: {
              scheduler,
              schedulers,
              sensors,
              relays,
              functions,
            },
          })
        "
        @delete="(scheduler) => openMenu({ schedulerDelete: { scheduler } })"
      />
    </div>
    <gd-input-button
      label="add scheduler"
      type="background"
      @clicked="
        openMenu({
          schedulerInformation: {
            schedulers,
            sensors,
            relays,
            functions,
          },
        })
      "
    />
  </gd-menu>
</template>

<script lang="ts" setup>
  import type { Function } from "~/types/function";
  import type { Relay } from "~/types/relay";
  import type { Sensor } from "~/types/sensor";
  import type { Scheduler } from "~/types/scheduler";

  const emits = defineEmits(["exit", "open", "edit"]);
  const props = defineProps<{
    active: boolean;
    sensors: Sensor[];
    relays: Relay[];
    functions: Function[];
  }>();
  const { device, openMenu } = useMain();

  const schedulers = computed<Scheduler[]>(() => {
    return device.value
      ? Object.values(device.value.scheduler).sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        )
      : [];
  });
</script>

<style lang="scss" scoped>
  .gd-menu {
    position: relative;
    display: flex;
    flex-direction: column;

    .gd-menu-message {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
    }

    .gd-menu-schedulers {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
