<template>
  <gd-menu :active="active" label="Schedulers List" class="gd-menu">
    <p class="gd-menu-message gd-caption-text">
      By creating a scheduler, you can decide when a function will be triggered.
      You will see your schedulers here.
    </p>
    <div v-if="crons.length" class="gd-menu-crons">
      <gd-cron
        v-for="cron in crons"
        :key="cron.id"
        :cron="cron"
        @open="
          openMenu({
            cronInformation: {
              cron,
              crons,
              sensors,
              relays,
              functions,
            },
          })
        "
        @delete="(cron) => openMenu({ cronDelete: { cron } })"
      />
    </div>
    <gd-input-button
      label="add scheduler"
      type="background"
      @clicked="
        openMenu({
          cronInformation: {
            crons,
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
  import type { Cron } from "~/types/cron";

  const emits = defineEmits(["exit", "open", "edit"]);
  const props = defineProps<{
    active: boolean;
    sensors: Sensor[];
    relays: Relay[];
    functions: Function[];
  }>();
  const { device, openMenu } = useMain();

  const crons = computed<Cron[]>(() => {
    return device.value
      ? Object.values(device.value.cron).sort((a, b) =>
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

    .gd-menu-crons {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
