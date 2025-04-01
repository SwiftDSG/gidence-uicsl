<template>
  <gd-menu
    :active="active"
    :label="view !== 'desktop' ? 'Controller Menu' : ''"
    class="gd-menu"
  >
    <div v-if="device" class="gd-menu-body">
      <div class="gd-menu-informations">
        <div class="gd-menu-information-container" style="z-index: 1">
          <div class="gd-menu-information">
            <span class="gd-menu-information-placeholder gd-caption-text"
              >Controller ID</span
            >
            <span class="gd-menu-information-value gd-headline-5">{{
              device.controller.id
            }}</span>
          </div>
        </div>
        <div class="gd-menu-information-container">
          <div class="gd-menu-information">
            <span class="gd-menu-information-placeholder gd-caption-text"
              >Controller address</span
            >
            <span class="gd-menu-information-value gd-headline-5">{{
              addressWrite(device.controller.address)
            }}</span>
          </div>
        </div>
      </div>
      <div
        class="gd-menu-item"
        @click="
          openMenu({
            controllerInformation: {
              controller: device.controller,
            },
          })
        "
      >
        <div class="gd-menu-item-icon">
          <gd-svg name="information" />
        </div>
        <div class="gd-menu-item-information">
          <span class="gd-menu-item-information-value gd-headline-5"
            >General information</span
          >
          <span class="gd-menu-item-information-placeholder gd-caption-text"
            >See or change this controller's information</span
          >
        </div>
      </div>
      <div
        class="gd-menu-item"
        @click="
          openMenu({
            function: {
              sensors,
              relays,
              functions,
            },
          })
        "
      >
        <div class="gd-menu-item-icon">
          <gd-svg name="code" />
        </div>
        <div class="gd-menu-item-information">
          <span class="gd-menu-item-information-value gd-headline-5"
            >Functions</span
          >
          <span class="gd-menu-item-information-placeholder gd-caption-text"
            >See or change the functions in this controller</span
          >
        </div>
      </div>
      <div
        class="gd-menu-item"
        @click="
          openMenu({
            watcher: {
              sensors,
              relays,
              functions,
              watchers,
            },
          })
        "
      >
        <div class="gd-menu-item-icon">
          <gd-svg name="eye" />
        </div>
        <div class="gd-menu-item-information">
          <span class="gd-menu-item-information-value gd-headline-5"
            >Watchers</span
          >
          <span class="gd-menu-item-information-placeholder gd-caption-text"
            >See or change the watchers in this controller</span
          >
        </div>
      </div>
    </div>
    <div class="gd-menu-footer">
      <div class="gd-menu-item">
        <div class="gd-menu-item-icon">
          <gd-svg
            :name="theme === 'dark' ? 'weather-night' : 'weather-sunny'"
          />
        </div>
        <div class="gd-menu-item-information">
          <span class="gd-menu-item-information-value gd-headline-5">
            Enable dark theme
          </span>
          <span class="gd-menu-item-information-placeholder gd-caption-text">
            Change the theme of the application
          </span>
        </div>
        <gd-input-toggle
          class="gd-menu-item-information-input"
          :input="themeInput"
        />
      </div>
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import type { InputToggleOption, Theme } from "~/types/general";
  import type { Controller } from "~/types/controller";
  import type { Function } from "~/types/function";
  import type { Relay } from "~/types/relay";
  import type { Sensor } from "~/types/sensor";
  import type { Watcher } from "~/types/watcher";

  const emits = defineEmits(["shake"]);
  const props = defineProps<{
    active: boolean;
  }>();

  const { getTheme, setTheme, device, view, openMenu } = useMain();

  const themeInput = ref<InputToggleOption>({
    model: false,
  });

  const theme = computed<Theme>(() =>
    themeInput.value.model ? "dark" : "light"
  );
  const sensors = computed<Sensor[]>(() => {
    return device.value
      ? Object.values(device.value.sensor).sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        )
      : [];
  });
  const relays = computed<Relay[]>(() => {
    return device.value
      ? Object.values(device.value.relay).sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        )
      : [];
  });
  const functions = computed<Function[]>(() => {
    return device.value
      ? Object.values(device.value.function).sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        )
      : [];
  });
  const watchers = computed<Watcher[]>(() => {
    return device.value
      ? Object.values(device.value.watcher).sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        )
      : [];
  });

  function addressWrite(address: Controller["address"]): string {
    return `${address.host.join(".")}:${address.port}`;
  }

  watch(
    () => theme.value,
    (val) => {
      setTheme(val);
    }
  );

  onMounted(() => {
    themeInput.value.model = getTheme() === "dark";
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
    }

    .gd-menu-body {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .gd-menu-informations {
        position: relative;
        width: 100%;
        padding: 0.75rem;
        border-radius: 0.75rem;
        border: var(--border);
        box-sizing: border-box;
        background: var(--background-depth-one-color);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .gd-menu-information-container {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .gd-menu-information {
            position: relative;
            display: flex;
            flex-direction: column;

            span.gd-menu-information-value {
              position: relative;
              width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }

      .gd-menu-item {
        cursor: pointer;
        position: relative;
        width: 100%;
        padding: 0.75rem;
        border-radius: 0.75rem;
        border: var(--border);
        background: var(--background-depth-one-color);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        overflow: hidden;

        * {
          pointer-events: none;
        }

        .gd-menu-item-icon {
          position: relative;
          width: 2rem;
          height: 2rem;
          background: var(--background-depth-two-color);
          padding: 0 0.5rem;
          border-radius: 0.5rem;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        .gd-menu-item-information {
          position: relative;
          width: calc(100% - 2.5rem);
          display: flex;
          flex-direction: column;

          span.gd-menu-item-information-placeholder {
            position: relative;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        &::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--font-primary-color);
          opacity: 0;
          transition: 0.25s opacity;
        }

        &:hover::after {
          opacity: 0.025;
        }
      }
    }

    .gd-menu-footer {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 5.5rem;
      padding: 1rem;
      border-top: var(--border);
      box-sizing: border-box;
      background: var(--background-depth-two-color);

      .gd-menu-item {
        position: relative;
        width: 100%;
        padding: 0.75rem;
        border-radius: 0.75rem;
        border: var(--border);
        background: var(--background-depth-one-color);
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        overflow: hidden;

        .gd-menu-item-icon {
          position: relative;
          width: 2rem;
          height: 2rem;
          background: var(--background-depth-two-color);
          padding: 0 0.5rem;
          border-radius: 0.5rem;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
        }

        .gd-menu-item-information {
          position: relative;
          width: calc(100% - 4.5rem);
          display: flex;
          flex-direction: column;
          span.gd-menu-item-information-placeholder {
            position: relative;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .gd-menu-item-information-input {
          flex-shrink: 0;
        }
      }
    }
  }
</style>
