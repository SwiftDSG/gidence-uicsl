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
              :radius="1"
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
        <div
          v-if="pinnedFunction.length > 0"
          class="gd-controller-functions"
          :style="locked ? 'pointer-events: none' : ''"
        >
          <gd-function
            v-for="fn in pinnedFunction"
            :key="fn.id"
            :function="fn"
            :pinned="true"
            @open="
              (fn) =>
                openMenu({
                  functionInformation: {
                    function: fn,
                    functions: device?.function || [],
                    sensors: device?.sensor || [],
                    relays: device?.relay || [],
                  },
                })
            "
            @delete="(fn) => openMenu({ functionDelete: { function: fn } })"
          />
        </div>
        <gd-ports
          :controller="device.controller"
          :ports="ports"
          :devices="devices || []"
          :selected="instrumentSelected"
          :style="locked ? 'pointer-events: none' : ''"
        />
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
  import type { Port } from "~/types/port";
  import type { Relay } from "~/types/relay";
  import type { Sensor } from "~/types/sensor";
  import type { Function } from "~/types/function";
  import { Order } from "~/types/general";

  const emits = defineEmits(["shake"]);

  const {
    view,
    device,
    order,
    menus,
    pin,
    lock,
    locked,
    load,
    openMenu,
    getDevice,
    getReading,
  } = useMain();

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
  const pinnedFunction = computed<Function[]>(() => {
    return device.value?.function.filter((f) => pin.value.includes(f.id)) || [];
  });

  async function refresh() {
    const reading = await getReading();
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
  function adjustDevices() {
    if (!device.value) return;
    const o: Order = JSON.parse(JSON.stringify(order.value));
    const p: Port[] = JSON.parse(JSON.stringify(device.value.port));
    const k = o.port.filter((a) => p.findIndex((b) => a === b.id) > -1);
    let u = k.length;
    console.log("DEVICE: ", JSON.parse(JSON.stringify(device.value)));
    console.log("PORT: ", p);
    for (let i = 0; i < p.length; i++) {
      const j = k.findIndex((a) => p[i].id === a);
      console.log("INDEX: ", j);
      if (j > -1) {
        const t = p[j];
        p[j] = p[i];
        p[i] = t;
      } else {
        const t = p[u];
        p[u] = p[i];
        p[i] = t;
        u += 1;
        o.port.push(p[i].id);
        o.device[p[i].id] = [];
      }
    }

    const d: {
      [k: string]: {
        sensor?: Sensor;
        relay?: Relay;
      }[];
    } = {};
    for (const sensor of device.value.sensor) {
      if (!d[sensor.port_id]) {
        if (!o.device[sensor.port_id]) {
          o.device[sensor.port_id] = [];
          d[sensor.port_id] = [];
        } else {
          d[sensor.port_id] = Array(o.device[sensor.port_id].length).fill({});
        }
      }

      const j = o.device[sensor.port_id]
        ? o.device[sensor.port_id].findIndex((a) => a === sensor.id)
        : -1;

      if (j > -1) {
        d[sensor.port_id][j] = { sensor };
      } else {
        d[sensor.port_id].push({ sensor });
        o.device[sensor.port_id].push(sensor.id);
      }
    }

    for (const relay of device.value.relay) {
      if (!d[relay.port_id]) {
        if (!o.device[relay.port_id]) {
          o.device[relay.port_id] = [];
          d[relay.port_id] = [];
        } else {
          d[relay.port_id] = Array(o.device[relay.port_id].length).fill({});
        }
      }

      const j = o.device[relay.port_id]
        ? o.device[relay.port_id].findIndex((a) => a === relay.id)
        : -1;

      if (j > -1) {
        d[relay.port_id][j] = { relay };
      } else {
        d[relay.port_id].push({ relay });
        o.device[relay.port_id].push(relay.id);
      }
    }

    devices.value = d;
    ports.value = p;
    order.value = o;
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
    () => device.value,
    (val) => {
      adjustDevices();
    },
    { deep: true }
  );
  watch(
    () => order.value,
    (val) => {
      if (!val) {
        localStorage.removeItem("order");
        return;
      }
      localStorage.setItem("order", JSON.stringify(val));
    },
    { deep: true }
  );
  watch(
    () => pin.value,
    (val) => {
      if (!val) {
        localStorage.removeItem("pin");
        return;
      }
      localStorage.setItem("pin", JSON.stringify(val));
    },
    { deep: true }
  );
  watch(
    () => locked.value,
    (val) => {
      if (!val) {
        setTimeout(() => {
          if (lock.value) locked.value = true;
        }, 1000 * 60 * 5);
      }
    }
  );

  onMounted(async () => {
    load();
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

      .gd-controller-functions {
        position: relative;
        width: 100%;
        padding: 1rem;
        box-sizing: border-box;
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;

        .gd-function {
          position: relative;
          width: calc((100% - 3rem) / 4);
          flex-shrink: 0;
        }
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
