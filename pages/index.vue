<template>
  <div class="gd-container">
    <client-only>
      <div class="gd-controller" v-if="device">
        <div class="gd-controller-header">
          <div class="gd-controller-name-container">
            <span class="gd-controller-name gd-headline-2">
              {{ device.controller.name }}
            </span>
          </div>
          <div class="gd-controller-status-container">
            <div
              class="gd-controller-status"
              :class="
                online
                  ? 'gd-controller-status-online'
                  : 'gd-controller-status-offline'
              "
            >
              <div class="gd-controller-status-indicator"></div>
              <span class="gd-controller-status-name gd-headline-5">{{
                online ? "Online" : "Offline"
              }}</span>
            </div>
            <gd-input-button-small
              v-if="view !== 'desktop'"
              icon="dots"
              @clicked="
                openMenu({
                  controller: {
                    controller: device.controller,
                  },
                })
              "
            />
          </div>
        </div>
        <div class="gd-controller-body">
          <gd-port
            v-for="port in ports"
            :key="port.id"
            :port="port"
            :devices="devices[port.id]"
            :selected="instrumentSelected"
            @select="openMenu({ port: { port } })"
          />
          <div class="gd-controller-actions">
            <gd-input-button
              label="add port"
              type="background"
              :radius="1"
              @clicked="
                openMenu({
                  portInformation: {},
                })
              "
            />
          </div>
        </div>
      </div>
    </client-only>
    <gd-menus @shake="emits('shake')" />
    <gd-progress-bar
      type="fixed"
      :state="loading ? 'show' : 'hide'"
      :immediate="true"
    />
  </div>
</template>

<script lang="ts" setup>
  import { Port } from "~/types/port";
  import { Relay } from "~/types/relay";
  import { Sensor } from "~/types/sensor";

  const emits = defineEmits(["shake"]);

  const { view, device, order, menus, openMenu, getDevice, getReading } =
    useMain();

  const loading = ref<boolean>(true);
  const online = ref<boolean>(false);
  const refreshFailedCount = ref<number>(0);

  const ports = ref<Port[]>([]);
  const devices = ref<{
    [key: string]: {
      sensor?: Sensor;
      relay?: Relay;
    }[];
  }>({});

  const instrumentSelected = computed<string | null>(() => {
    if (!menus.value || menus.value.length === 0) {
      return null;
    }
    const i = menus.value.length - 1;
    if (menus.value[i]["port"]) {
      return menus.value[i]["port"].port.id;
    } else if (menus.value[i]["portInformation"]?.port) {
      return menus.value[i]["portInformation"].port.id;
    } else if (menus.value[i]["portDelete"]?.port) {
      return menus.value[i]["portDelete"].port.id;
    } else if (menus.value[i]["deviceInformation"]) {
      return (
        menus.value[i]["deviceInformation"].device?.id ||
        menus.value[i]["deviceInformation"].port.id
      );
    } else if (menus.value[i]["deviceDelete"]) {
      return (
        menus.value[i]["deviceDelete"].device?.id ||
        menus.value[i]["deviceDelete"].port.id
      );
    } else if (menus.value[i]["relay"]) {
      return menus.value[i]["relay"].relay.id;
    } else if (menus.value[i]["sensor"]) {
      return menus.value[i]["sensor"].sensor.id;
    } else if (menus.value[i]["sensorAdjustment"]) {
      return menus.value[i]["sensorAdjustment"].sensor.id;
    }
    return null;
  });

  async function refresh() {
    const [device, reading] = await Promise.all([getDevice(), getReading()]);
    if (device) {
      ports.value = device.port;
      devices.value = device.device;
    }
    if (!reading) {
      refreshFailedCount.value += 1;
      if (refreshFailedCount.value === 5) {
        online.value = false;
      }
    } else {
      refreshFailedCount.value = 0;
      online.value = true;
    }
    setTimeout(refresh, 5000);
  }

  watch(
    () => view.value,
    (val) => {
      if (val === "desktop" && device.value && menus.value.length === 0) {
        openMenu({
          controller: {},
        });
      }
    }
  );
  watch(
    () => order.value,
    (val) => {
      console.log(val)
    },
    { deep: true }
  );

  onMounted(async () => {
    await refresh();

    if (view.value === "desktop" && device.value) {
      openMenu({
        controller: {},
      });
    }

    setTimeout(() => {
      loading.value = false;
    }, 1000);
  });
</script>

<style lang="scss" scoped>
  .gd-container {
    position: relative;
    width: 100%;
    background: var(--background-depth-three-color);
    display: flex;

    .gd-controller {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow-y: auto;

      .gd-controller-header {
        position: relative;
        width: 100%;
        height: 4rem;
        padding: 1rem;
        box-sizing: border-box;
        background: var(--background-depth-three-color);
        display: flex;
        justify-content: space-between;
        align-items: center;

        .gd-controller-name-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .gd-controller-status-container {
          position: relative;
          display: flex;
          gap: 1rem;

          .gd-controller-status {
            position: relative;
            height: 2rem;
            padding: 0.5rem 0.75rem;
            border: var(--border);
            border-radius: 1rem;
            box-sizing: border-box;
            background: var(--background-depth-one-color);
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .gd-controller-status-indicator {
              position: relative;
              width: 0.5rem;
              height: 0.5rem;
              border-radius: 0.25rem;
              background: var(--primary-color);
              display: flex;
              justify-content: center;
              align-items: center;
              flex-shrink: 0;

              &::after {
                content: "";
                position: relative;
                width: 1rem;
                height: 1rem;
                border-radius: 0.5rem;
                background: var(--primary-color);
                opacity: 0.2;
                flex-shrink: 0;
              }
            }

            &.gd-controller-status-online {
              .gd-controller-status-indicator {
                background: var(--success-color);

                &::after {
                  background: var(--success-color);
                }
              }
            }

            &.gd-controller-status-offline {
              .gd-controller-status-indicator {
                background: var(--error-color);

                &::after {
                  background: var(--error-color);
                }
              }
            }
          }
        }
      }

      .gd-controller-body {
        position: relative;
        width: 100%;
        padding: 0 1rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
    }

    @media only screen and (min-width: 1281px) {
      width: calc(100% - 20rem);
    }
    @media only screen and (max-width: 640px) {
      .gd-controller {
        .gd-controller-header {
          .gd-controller-name-container {
            display: none;
          }

          .gd-controller-status-container {
            width: 100%;
            justify-content: space-between;
          }
        }
      }
    }
  }
</style>
