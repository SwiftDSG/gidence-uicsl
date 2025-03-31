<template>
  <div class="gd-menu-input-container">
    <div class="gd-menu-input-wrapper">
      <gd-input-text
        class="gd-menu-input"
        style="width: calc((100% - 1rem) / 3)"
        :input="addressInput"
      />
      <gd-input-text
        class="gd-menu-input"
        style="width: calc((100% - 1rem) / 3)"
        :input="positionInput"
      />
      <gd-input-text
        class="gd-menu-input"
        style="width: calc((100% - 1rem) / 3)"
        :input="countInput"
      />
    </div>
    <div class="gd-menu-input-wrapper">
      <gd-input-text class="gd-menu-input" :input="deviceInput" />
    </div>
    <div class="gd-menu-input-test-container">
      <span class="gd-menu-input-test-label gd-caption-text"
        >Relay reading test</span
      >
      <div class="gd-menu-input-test">
        <span
          class="gd-menu-input-test-value gd-headline-3"
          :class="testError ? 'gd-menu-input-test-value-error' : ''"
          >{{ testValue }}</span
        >
        <gd-input-button-small
          :disabled="!relay"
          :loading="testLoading"
          @clicked="test"
          icon="rotate"
          type="primary"
          tooltip="Test configuration"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Port } from "~/types/port";
  import type { Relay } from "~/types/relay";
  import { InputOption } from "~/types/general";

  const { readRelay } = useRelay();
  const props = defineProps<{
    name: string;
    port: Port;
    relay: Relay | null;
  }>();
  const emits = defineEmits(["update-payload"]);

  const addressInput = ref<InputOption>({
    name: "relay-address",
    label: "Coil address",
    placeholder: "0",
    model: {
      name: "",
      value: "",
    },
  });
  const positionInput = ref<InputOption>({
    name: "relay-position",
    label: "Coil position",
    placeholder: "0",
    model: {
      name: "",
      value: "",
    },
  });
  const countInput = ref<InputOption>({
    name: "relay-count",
    label: "Coil count",
    placeholder: "1",
    model: {
      name: "",
      value: "",
    },
  });
  const deviceInput = ref<InputOption>({
    name: "device",
    label: "Device (Slave ID)",
    placeholder: "0",
    model: {
      name: "0",
      value: 0,
    },
  });

  const testLoading = ref<boolean>(false);
  const testValue = ref<string>("N/A");
  const testError = ref<boolean>(false);

  const relay = computed<Relay | null>(() => {
    const device = parseInt(deviceInput.value.model.value);
    const address = parseInt(addressInput.value.model.value);
    const count = parseInt(countInput.value.model.value);
    const position = parseInt(positionInput.value.model.value);

    if (
      !props.name ||
      isNaN(device) ||
      isNaN(address) ||
      isNaN(count) ||
      isNaN(position) ||
      device < 0 ||
      address < 0 ||
      count <= 0 ||
      position < 0
    )
      return null;

    return {
      id: props.relay?.id || "",
      port_id: props.port.id,
      name: props.name,
      device,
      address,
      count,
      position,
      locked: props.relay?.locked || true,
    };
  });

  async function test(): Promise<void> {
    try {
      if (!relay.value) return;

      testLoading.value = true;

      const response = await readRelay(relay.value);

      setTimeout(async () => {
        testLoading.value = false;
        if (response === null) {
          testValue.value = "Invalid task";
          throw new Error("");
        }

        testError.value = false;
        testValue.value = response;
      }, 500);
    } catch (e) {
      testError.value = true;
    }
  }

  watch(
    () => relay.value,
    () => {
      emits("update-payload", relay.value);
    },
    { deep: true }
  );

  onMounted(() => {
    if (props.relay) {
      deviceInput.value.model = {
        name: props.relay.device.toString(),
        value: props.relay.device.toString(),
      };
      addressInput.value.model = {
        name: props.relay.address.toString(),
        value: props.relay.address.toString(),
      };
      positionInput.value.model = {
        name: props.relay.position.toString(),
        value: props.relay.position.toString(),
      };
      countInput.value.model = {
        name: props.relay.count.toString(),
        value: props.relay.count.toString(),
      };
    }
  });
</script>

<style lang="scss" scoped>
  .gd-menu-input-container {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .gd-menu-input-test-container {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;

      .gd-menu-input-test-label {
        position: relative;
        width: 100%;
        height: 1rem;
        display: flex;
        align-items: center;
      }

      .gd-menu-input-test {
        position: relative;
        width: 100%;
        background: var(--background-depth-two-color);
        padding: 0.5rem;
        border: var(--border);
        border-radius: 0.5rem;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .gd-menu-input-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      gap: 0 0.5rem;
      flex-wrap: wrap;
      align-items: flex-end;

      .gd-menu-input {
        position: relative;
        width: 100%;
      }

      .gd-menu-input-error {
        position: relative;
        width: 100%;
        height: 1rem;
        flex-shrink: 0;
      }
    }
  }
</style>
