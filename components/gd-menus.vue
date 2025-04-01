<template>
  <div
    class="gd-menus"
    :style="menusCopy.length > 0 ? 'pointer-events: all;' : ''"
  >
    <div v-for="(menu, i) in menusCopy" :key="i" class="gd-menu">
      <gd-controller-menu
        v-if="menu['controller']"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-controller-information-menu
        v-else-if="menu['controllerInformation']"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-port-menu
        v-if="menu['port']"
        :port="menu['port'].port"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-port-delete-menu
        v-if="menu['portDelete']"
        :port="menu['portDelete'].port"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-port-information-menu
        v-else-if="menu['portInformation']"
        :port="menu['portInformation'].port"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-device-information-menu
        v-else-if="menu['deviceInformation']"
        :port="menu['deviceInformation'].port"
        :device="menu['deviceInformation'].device"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-device-delete-menu
        v-else-if="menu['deviceDelete']"
        :port="menu['deviceDelete'].port"
        :device="menu['deviceDelete'].device"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-relay-menu
        v-if="menu['relay']"
        :port="menu['relay'].port"
        :relay="menu['relay'].relay"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-sensor-menu
        v-if="menu['sensor']"
        :port="menu['sensor'].port"
        :sensor="menu['sensor'].sensor"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-sensor-adjustment-menu
        v-if="menu['sensorAdjustment']"
        :port="menu['sensorAdjustment'].port"
        :sensor="menu['sensorAdjustment'].sensor"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-function-menu
        v-if="menu['function']"
        :sensors="menu['function'].sensors"
        :relays="menu['function'].relays"
        :functions="menu['function'].functions"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-function-information-menu
        v-if="menu['functionInformation']"
        :sensors="menu['functionInformation'].sensors"
        :relays="menu['functionInformation'].relays"
        :functions="menu['functionInformation'].functions"
        :function="menu['functionInformation'].function"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-function-delete-menu
        v-if="menu['functionDelete']"
        :function="menu['functionDelete'].function"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-watcher-menu
        v-if="menu['watcher']"
        :sensors="menu['watcher'].sensors"
        :relays="menu['watcher'].relays"
        :functions="menu['watcher'].functions"
        :watchers="menu['watcher'].watchers"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-watcher-information-menu
        v-if="menu['watcherInformation']"
        :sensors="menu['watcherInformation'].sensors"
        :relays="menu['watcherInformation'].relays"
        :functions="menu['watcherInformation'].functions"
        :watchers="menu['watcherInformation'].watchers"
        :watcher="menu['watcherInformation'].watcher"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
      <gd-watcher-delete-menu
        v-if="menu['watcherDelete']"
        :watcher="menu['watcherDelete'].watcher"
        :active="i === menusCopy.length - 1"
        @shake="emits('shake')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Menu } from "~/types/general";

  const emits = defineEmits(["shake"]);

  const { menus } = useMain();

  const menusCopy = ref<Menu[]>([]);

  watch(
    () => menus.value.length,
    (val, oldVal) => {
      setTimeout(
        () => {
          menusCopy.value = JSON.parse(JSON.stringify(menus.value));
        },
        val < (oldVal || 0) ? 500 : 0
      );
    },
    { deep: true, immediate: true }
  );
</script>

<style lang="scss" scoped>
  .gd-menus {
    pointer-events: none;
    position: fixed;
    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-shrink: 0;
    > .gd-menu {
      position: absolute;
      top: 0;
      right: 0;
    }
    @media only screen and (min-width: 1281px) {
      width: 20rem;
      height: 100vh;
      background-color: var(--background-depth-two-color);

      > .gd-menu {
        border-left: var(--border);
        box-sizing: border-box;
      }
    }
  }
</style>
