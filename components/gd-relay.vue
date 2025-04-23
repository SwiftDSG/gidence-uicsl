<template>
  <div
    class="gd-relay"
    :class="`${selected ? ' gd-relay-active' : ''}${
      reading?.[0] ? ' gd-relay-on' : ' gd-relay-off'
    }`"
  >
    <div class="gd-relay-header">
      <div class="gd-relay-information-container" @click="emits('select')">
        <div class="gd-relay-information-icon-container">
          <gd-svg class="gd-relay-information-icon" name="fan" />
        </div>
        <div class="gd-relay-information">
          <span class="gd-relay-information-name gd-headline-5">{{
            relay.name
          }}</span>
          <span class="gd-relay-information-task gd-caption-text">Relay</span>
        </div>
      </div>
      <div v-if="!relay.locked" class="gd-relay-action-container">
        <gd-input-button-small
          :tooltip="reading?.[0] ? 'Turn off' : 'Turn on'"
          :loading="flipLoading"
          :type="reading?.[0] ? 'error' : 'primary'"
          :color="reading?.[0] ? 'error' : undefined"
          icon="power"
          :disabled="reading === undefined"
          @clicked="flipState"
        />
      </div>
    </div>
    <div class="gd-relay-body">
      <div class="gd-relay-value-container">
        <span class="gd-relay-value gd-headline-3">{{
          reading === undefined ? "N/A" : reading[0] ? "ON" : "OFF"
        }}</span>
      </div>
      <span class="gd-relay-value-date gd-caption-text">{{
        formatDateTime(reading?.[1])
      }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Relay } from "~/types/relay";

  const emits = defineEmits(["select", "flip-state"]);
  const props = defineProps<{
    selected: boolean;
    relay: Relay;
    reading?: [boolean, number];
  }>();
  const { updateReadingRelay } = useMain();
  const { flipRelay } = useRelay();

  const flipLoading = ref<boolean>(false);

  async function flipState(): Promise<void> {
    if (props.reading === undefined) return;
    const reading = props.reading[0];
    flipLoading.value = true;

    const result = await flipRelay(props.relay);
    setTimeout(() => {
      if (result && props.reading) {
        updateReadingRelay(props.relay, reading);
      }
      flipLoading.value = false;
    }, 500);
  }

  function formatDateTime(x?: string | number): string {
    if (!x || props.reading === undefined) return "N/A";
    const date = new Date(x);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
  }
</script>

<style lang="scss" scoped>
  .gd-relay {
    position: relative;
    width: 100%;
    border-radius: 0.5rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .gd-relay-header {
      position: relative;
      width: 100%;
      height: 3.5rem;
      padding: 0.75rem;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .gd-relay-information-container {
        cursor: pointer;
        position: relative;
        width: calc(100% - 2.5rem);
        height: 100%;
        display: flex;
        align-items: center;

        .gd-relay-information-icon-container {
          position: relative;
          width: 2rem;
          height: 2rem;
          padding-right: 0.5rem;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
        }

        .gd-relay-information {
          position: relative;
          width: calc(100% - 2rem);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;

          span.gd-relay-information-name {
            position: relative;
            width: 100%;
            text-wrap: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }

          span.gd-relay-information-kind {
            position: relative;
            text-transform: capitalize;
          }
        }
      }
    }

    .gd-relay-body {
      position: relative;
      width: 100%;
      padding: 0 0.75rem 0.75rem 0.75rem;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: last baseline;

      .gd-relay-value-container {
        position: relative;
        display: flex;
        align-items: last baseline;

        span.gd-relay-value-unit {
          position: relative;
          opacity: 0.5;
        }
      }

      span.gd-relay-value-date {
        position: relative;
        line-height: 1;
      }
    }

    &.gd-relay-on {
      .gd-relay-header {
        .gd-relay-information-container {
          .gd-relay-information-icon-container {
            animation: gd-rotate 1s linear infinite;
          }
        }
      }
      .gd-relay-body {
        .gd-relay-value-container {
          color: var(--success-color);
        }
      }
    }

    &.gd-relay-off {
      .gd-relay-body {
        .gd-relay-value-container {
          color: var(--error-color);
        }
      }
    }

    &::before {
      content: "";
      position: absolute;
      top: -3px;
      left: -3px;
      width: calc(100% + 6px);
      height: calc(100% + 6px);
      border: 2px solid var(--primary-color);
      border-radius: calc(0.75rem + 2px);
      box-sizing: border-box;
      box-shadow: 0 0 6px 0 var(--primary-color);
      opacity: 0;
      transition: opacity 0.25s ease-in-out;
    }

    &.gd-relay-active::before {
      opacity: 1;
    }
  }
</style>
