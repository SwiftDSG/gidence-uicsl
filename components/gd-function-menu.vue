<template>
  <gd-menu :active="active" label="Function List" class="gd-menu">
    <p class="gd-menu-message gd-caption-text">
      By creating a function, you can chain multiple commands. You will see your
      functions here.
    </p>
    <div v-if="props.functions.length" class="gd-menu-functions">
      <gd-function
        v-for="fn in props.functions"
        :key="fn.id"
        :function="fn"
        @open="
          (fn) =>
            openMenu({
              functionInformation: {
                function: fn,
                functions,
                sensors,
                relays,
              },
            })
        "
        @delete="(fn) => openMenu({ functionDelete: { function: fn } })"
      />
    </div>
    <gd-input-button
      label="add function"
      type="background"
      @clicked="
        openMenu({
          functionInformation: {
            functions,
            sensors,
            relays,
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

  const props = defineProps<{
    active: boolean;
    functions: Function[];
    sensors: Sensor[];
    relays: Relay[];
  }>();
  const emits = defineEmits(["exit", "open", "edit"]);
  const { openMenu } = useMain();
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

    .gd-menu-functions {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
