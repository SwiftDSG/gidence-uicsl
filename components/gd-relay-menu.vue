<template>
  <gd-menu :active="active" :label="relay.name" class="gd-menu">
    <div class="gd-menu-body">
      <div
        class="gd-menu-item"
        @click="
          openMenu({
            deviceInformation: {
              port,
              device: relay,
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
            >See or change this relay's information</span
          >
        </div>
      </div>
      <div class="gd-menu-item gd-menu-item-input">
        <div class="gd-menu-item-icon">
          <gd-svg :name="relay.locked ? 'lock-close' : 'lock-open'" />
        </div>
        <div class="gd-menu-item-information">
          <span class="gd-menu-item-information-value gd-headline-5">
            {{ relay.locked ? "Unlock relay" : "Lock relay" }}
          </span>
          <span class="gd-menu-item-information-placeholder gd-caption-text">
            {{
              relay.locked
                ? "Unlock this relay to allow changes"
                : "Lock this relay to prevent changes"
            }}
          </span>
        </div>
        <gd-input-toggle
          class="gd-menu-item-information-input"
          :input="lockInput"
        />
      </div>
      <div
        class="gd-menu-item gd-menu-item-error"
        @click="
          openMenu({
            deviceDelete: {
              port,
              device: relay,
            },
          })
        "
      >
        <div class="gd-menu-item-icon">
          <gd-svg name="delete" color="error" />
        </div>
        <div class="gd-menu-item-information">
          <span class="gd-menu-item-information-value gd-headline-5"
            >Delete relay</span
          >
          <span class="gd-menu-item-information-placeholder gd-caption-text"
            >Remove this relay from the application</span
          >
        </div>
      </div>
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import type { InputToggleOption } from "~/types/general";
  import type { Port } from "~/types/port";
  import type { Relay } from "~/types/relay";

  const { openMenu, updateDeviceRelay } = useMain();
  const { updateRelay } = useRelay();

  const emits = defineEmits(["shake"]);
  const props = defineProps<{
    active: boolean;
    relay: Relay;
    port: Port;
  }>();

  const lockInput = ref<InputToggleOption>({
    model: props.relay.locked,
  });

  watch(
    () => lockInput.value.model,
    async (val) => {
      const result = await updateRelay({
        ...props.relay,
        locked: val,
      });
      console.log(result);
      if (result) {
        updateDeviceRelay(result);
      }
    }
  );
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

        .gd-menu-item-icon {
          position: relative;
          width: 2rem;
          height: 2rem;
          padding: 0 0.5rem;
          border-radius: 0.5rem;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--background-depth-two-color);
            opacity: 1;
          }
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

        &.gd-menu-item-error {
          border-color: var(--error-color);

          .gd-menu-item-icon::before {
            background: var(--error-color);
            opacity: 0.1;
          }
        }

        &.gd-menu-item-input {
          cursor: default;
        }

        &:not(.gd-menu-item-input)::after {
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
      height: 4rem;
      padding: 1rem;
      border-top: var(--border);
      box-sizing: bogder-box;
      background: var(--background-depth-two-color);
    }
  }
</style>
