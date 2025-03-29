<template>
  <gd-menu
    :label="device ? 'Edit Device' : 'Create Device'"
    :active="active"
    class="gd-menu"
  >
    <div class="gd-menu-informations">
      <div class="gd-menu-informations-header">
        <span class="gd-menu-informations-title gd-headline-5"
          >Port information</span
        >
      </div>
      <div class="gd-menu-informations-body">
        <div class="gd-menu-information">
          <span class="gd-menu-information-placeholder gd-caption-text"
            >Port name</span
          >
          <span class="gd-menu-information-value gd-headline-5">{{
            port.name
          }}</span>
        </div>
        <div class="gd-menu-input-wrapper">
          <gd-input-text class="gd-menu-input" :input="nameInput" />
        </div>
      </div>
    </div>
    <div class="gd-menu-informations">
      <div class="gd-menu-informations-header">
        <span class="gd-menu-informations-title gd-headline-5"
          >Modbus information</span
        >
      </div>
      <div class="gd-menu-informations-body">
        <div class="gd-menu-input-wrapper">
          <gd-input-select class="gd-menu-input" :input="kindInput" />
        </div>
        <gd-sensor-form
          v-if="kindInput.model.value === 'sensor'"
          type="device"
          :name="name"
          :port="port"
          :sensor="(device as Sensor) || null"
          @update-payload="(v) => (payload = v)"
        />
        <gd-relay-form
          v-else-if="kindInput.model.value === 'relay'"
          type="device"
          :name="name"
          :port="port"
          :relay="(device as Relay) || null"
          @update-payload="(v) => (payload = v)"
        />
      </div>
    </div>
    <div class="gd-menu-padding"></div>
    <div class="gd-menu-footer">
      <gd-input-button
        @clicked="submit"
        :disabled="!payload"
        :loading="submitLoading"
        style="width: 100%"
        :label="device ? 'Update device' : 'Create device'"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import type { InputOption, InputSelectOption } from "~/types/general";
  import type { Port } from "~/types/port";
  import type { Relay } from "~/types/relay";
  import type { Sensor } from "~/types/sensor";

  const emits = defineEmits(["exit", "shake"]);
  const props = defineProps<{
    active: boolean;
    port: Port;
    device?: Sensor | Relay;
  }>();
  const { closeMenu, updateDeviceRelay, updateDeviceSensor } = useMain();
  const { createSensor, updateSensor } = useSensor();
  const { createRelay, updateRelay } = useRelay();

  const submitLoading = ref<boolean>(false);

  const nameInput = ref<InputOption>({
    name: "name",
    label: "Device name",
    placeholder: "Outlet thermometer",
    model: {
      name: "",
      value: "",
    },
  });
  const kindInput = ref<InputSelectOption>({
    name: "kind",
    label: "Device type",
    placeholder: "Select one",
    strict: true,
    model: {
      name: "",
      value: "",
    },
    options: [
      {
        name: "Sensor",
        value: "sensor",
      },
      {
        name: "Relay",
        value: "relay",
      },
    ],
  });

  const payload = ref<Sensor | Relay | null>(null);

  const name = computed<string>(() => nameInput.value.model.name);
  const kind = computed<string>(() => kindInput.value.model.value);

  async function submit(): Promise<void> {
    if (!payload.value) return;

    submitLoading.value = true;

    if (props.device) {
      if (kind.value === "sensor") {
        const result = await updateSensor(payload.value as Sensor);
        setTimeout(() => {
          submitLoading.value = false;
          if (result) {
            updateDeviceSensor(payload.value as Sensor);
            closeMenu();
          } else {
            emits("shake");
          }
        }, 1000);
      } else if (kind.value === "relay") {
        const result = await updateRelay(payload.value as Relay);
        setTimeout(() => {
          submitLoading.value = false;
          if (result) {
            updateDeviceRelay(payload.value as Relay);
            closeMenu();
          } else {
            emits("shake");
          }
        }, 1000);
      }
    } else {
      if (kind.value === "sensor") {
        const result = await createSensor(payload.value as Sensor);
        setTimeout(() => {
          submitLoading.value = false;
          if (result) {
            updateDeviceSensor(payload.value as Sensor);
            closeMenu();
          } else {
            emits("shake");
          }
        }, 1000);
      } else if (kind.value === "relay") {
        const result = await createRelay(payload.value as Relay);
        setTimeout(() => {
          submitLoading.value = false;
          if (result) {
            updateDeviceRelay(payload.value as Relay);
            closeMenu();
          } else {
            emits("shake");
          }
        }, 1000);
      }
    }
  }

  onMounted(() => {
    if (props.device) {
      nameInput.value.model = {
        name: props.device.name,
        value: props.device.name,
      };
      if ((props.device as Relay).count) {
        kindInput.value.model = {
          name: "Relay",
          value: "relay",
        };
      } else {
        kindInput.value.model = {
          name: "Sensor",
          value: "sensor",
        };
      }
    }
  });
</script>

<style lang="scss" scoped>
  .gd-menu {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    * {
      flex-shrink: 0;
    }

    .gd-menu-informations {
      position: relative;
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.75rem;
      border: var(--border);
      box-sizing: border-box;
      background: var(--background-depth-one-color);
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .gd-menu-informations-body {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .gd-menu-information {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

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

    .gd-menu-padding {
      position: relative;
      width: 100%;
      height: 4rem;
    }

    .gd-menu-footer {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4rem;
      padding: 1rem;
      border-top: var(--border);
      box-sizing: border-box;
      background: var(--background-depth-two-color);
    }
  }
</style>
