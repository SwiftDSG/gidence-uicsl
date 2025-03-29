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
          <div
            v-for="port in ports"
            class="gd-controller-port"
            :class="
              instrumentSelected === port.id ? 'gd-controller-port-active' : ''
            "
            :key="port.id"
          >
            <div class="gd-controller-port-header">
              <div
                class="gd-controller-port-information-container"
                @click="openMenu({ port: { port } })"
              >
                <span class="gd-controller-port-information gd-headline-4">
                  {{ port.name }}
                </span>
                <span
                  class="gd-controller-port-information-description gd-caption-text"
                >
                  {{ `${port.address.host.join(".")}:${port.address.port}` }}
                </span>
              </div>
              <gd-input-button
                label="add device"
                type="background"
                @clicked="openMenu({ deviceInformation: { port } })"
              />
            </div>
            <div class="gd-controller-port-body">
              <div
                v-for="device in devices[port.id]"
                class="gd-controller-port-device"
                :key="device.sensor?.id || device.relay?.id || ''"
              >
                <gd-sensor
                  v-if="device.sensor && reading"
                  :selected="instrumentSelected === device.sensor.id"
                  :sensor="device.sensor"
                  :reading="reading.sensor[device.sensor.id]"
                  @select="
                    openMenu({ sensor: { sensor: device.sensor, port: port } })
                  "
                />
                <gd-relay
                  v-if="device.relay && reading"
                  :selected="instrumentSelected === device.relay.id"
                  :relay="device.relay"
                  :reading="reading.relay[device.relay.id]"
                />
              </div>
            </div>
          </div>
          <div class="gd-controller-actions">
            <gd-input-button
              label="add port"
              type="background"
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

  const { view, device, reading, menus, openMenu, getDevice, getReading } =
    useMain();

  const loading = ref<boolean>(true);
  const online = ref<boolean>(false);
  const refreshFailedCount = ref<number>(0);

  const ports = computed<Port[]>(() =>
    device.value ? Object.values(device.value.port) : []
  );
  const devices = computed<{
    [key: string]: {
      sensor?: Sensor;
      relay?: Relay;
    }[];
  }>(() => {
    if (!device.value) {
      return {};
    }
    const devices: {
      [key: string]: {
        sensor?: Sensor;
        relay?: Relay;
      }[];
    } = {};
    for (const sensor of Object.values(device.value.sensor)) {
      if (!devices[sensor.port_id]) {
        devices[sensor.port_id] = [];
      }
      devices[sensor.port_id].push({ sensor });
    }
    for (const relay of Object.values(device.value.relay)) {
      if (!devices[relay.port_id]) {
        devices[relay.port_id] = [];
      }
      devices[relay.port_id].push({ relay });
    }
    return devices;
  });

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
    } else if (menus.value[i]["sensor"]) {
      return menus.value[i]["sensor"].sensor.id;
    }
    return null;
  });

  async function refresh() {
    if (!(await getReading())) {
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

  onMounted(async () => {
    await getDevice();
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
    width: calc(100% - 20rem);
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

        .gd-controller-port {
          position: relative;
          width: 100%;
          background: var(--background-depth-two-color);
          padding: 1rem;
          border: var(--border);
          border-radius: 1rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;

          .gd-controller-port-header {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: space-between;

            .gd-controller-port-information-container {
              cursor: pointer;
              position: relative;
              height: 2rem;

              span {
                white-space: nowrap;
              }

              span:first-child {
                position: absolute;
                top: 0;
              }

              span:last-child {
                position: absolute;
                bottom: 0;
              }
            }
          }

          .gd-controller-port-body {
            position: relative;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 0.75rem;

            .gd-controller-port-device {
              position: relative;
              width: calc((100% - 2.25rem) / 4);
              background: var(--background-depth-one-color);
              border: var(--border);
              border-radius: 0.75rem;
              box-sizing: border-box;
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
            border-radius: calc(1rem + 2px);
            box-sizing: border-box;
            box-shadow: 0 0 6px 0 var(--primary-color);
            opacity: 0;
            transition: opacity 0.25s ease-in-out;
          }

          &.gd-controller-port-active::before {
            opacity: 1;
          }
        }
      }
    }
  }
</style>
