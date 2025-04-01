<template>
  <gd-menu :active="active" label="Watchers List" class="gd-menu">
    <p class="gd-menu-message gd-caption-text">
      By creating a watcher, you can decide when a function will be triggered.
      You will see your watchers here.
    </p>
    <div v-if="watchers.length" class="gd-menu-watchers">
      <gd-watcher
        v-for="watcher in watchers"
        :key="watcher.id"
        :watcher="watcher"
        @open="
          openMenu({
            watcherInformation: {
              watcher,
              watchers,
              sensors,
              relays,
              functions,
            },
          })
        "
        @delete="(watcher) => openMenu({ watcherDelete: { watcher } })"
      />
    </div>
    <gd-input-button
      label="add watcher"
      type="background"
      @clicked="
        openMenu({
          watcherInformation: {
            watchers,
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
  import type { Watcher } from "~/types/watcher";

  const emits = defineEmits(["exit", "open", "edit"]);
  const props = defineProps<{
    active: boolean;
    sensors: Sensor[];
    relays: Relay[];
    functions: Function[];
  }>();
  const { device, openMenu } = useMain();

  const watchers = computed<Watcher[]>(() => {
    return device.value
      ? Object.values(device.value.watcher).sort((a, b) =>
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

    .gd-menu-watchers {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
