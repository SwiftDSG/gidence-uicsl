<template>
  <gd-menu
    :label="port ? 'Edit Port' : 'Add Port'"
    :active="active"
    class="gd-menu"
  >
    <div class="gd-menu-body">
      <div class="gd-menu-input-wrapper">
        <gd-input-text class="gd-menu-input" :input="nameInput" />
      </div>
      <div class="gd-menu-input-wrapper">
        <gd-input-text
          class="gd-menu-input"
          :input="addressHostInput[0]"
          style="width: calc((100% - 1.5rem) / 4)"
        />
        <gd-input-text
          class="gd-menu-input"
          :input="addressHostInput[1]"
          style="width: calc((100% - 1.5rem) / 4)"
        />
        <gd-input-text
          class="gd-menu-input"
          :input="addressHostInput[2]"
          style="width: calc((100% - 1.5rem) / 4)"
        />
        <gd-input-text
          class="gd-menu-input"
          :input="addressHostInput[3]"
          style="width: calc((100% - 1.5rem) / 4)"
        />
        <span class="gd-menu-input-error gd-caption-text"></span>
      </div>
      <div class="gd-menu-input-wrapper">
        <gd-input-text class="gd-menu-input" :input="addressPortInput" />
      </div>
    </div>
    <div class="gd-menu-footer">
      <gd-input-button
        @clicked="submit"
        :disabled="!name || !address"
        :loading="submitLoading"
        style="width: 100%"
        :label="port ? 'update port' : 'create port'"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import { Port } from "~/types/port";
  import { InputOption } from "~/types/general";

  const { updateDevicePort, closeMenu } = useMain();
  const { createPort, updatePort } = usePort();

  const emits = defineEmits(["shake"]);
  const props = defineProps<{
    active: boolean;
    port?: Port;
  }>();

  const submitLoading = ref<boolean>(false);

  const nameInput = ref<InputOption>({
    name: "name",
    label: "Port name",
    placeholder: "Port 01",
    model: {
      name: "",
      value: "",
    },
    error: "",
  });
  const addressHostInput = ref<
    [InputOption, InputOption, InputOption, InputOption]
  >([
    {
      name: "address-host-0",
      label: "Host",
      placeholder: "0",
      model: {
        name: "",
        value: "",
      },
    },
    {
      name: "address-host-1",
      placeholder: "0",
      model: {
        name: "",
        value: "",
      },
    },
    {
      name: "address-host-2",
      placeholder: "0",
      model: {
        name: "",
        value: "",
      },
    },
    {
      name: "address-host-3",
      placeholder: "0",
      model: {
        name: "",
        value: "",
      },
    },
  ]);
  const addressPortInput = ref<InputOption>({
    name: "address-port",
    label: "Port",
    placeholder: "502",
    model: {
      name: "",
      value: "",
    },
    error: "",
  });

  const name = computed<string>(() => nameInput.value.model.value);
  const address = computed<Port["address"] | null>(() => {
    const host0 = parseInt(addressHostInput.value[0].model.value);
    const host1 = parseInt(addressHostInput.value[1].model.value);
    const host2 = parseInt(addressHostInput.value[2].model.value);
    const host3 = parseInt(addressHostInput.value[3].model.value);
    const port = parseInt(addressPortInput.value.model.value);

    if (
      !isNaN(host0) &&
      !isNaN(host1) &&
      !isNaN(host2) &&
      !isNaN(host3) &&
      !isNaN(port)
    ) {
      return {
        host: [host0, host1, host2, host3],
        port,
      };
    }
    return null;
  });

  async function submit(): Promise<void> {
    if (!name.value || !address.value) return;

    submitLoading.value = true;

    const payload = {
      id: "",
      name: name.value,
      address: address.value,
    };

    let result;
    if (props.port) {
      payload.id = props.port.id;
      result = await updatePort(payload);
    } else {
      result = await createPort(payload);
    }

    setTimeout(() => {
      submitLoading.value = false;
      if (result) {
        updateDevicePort(result);
        closeMenu();
      } else {
        emits("shake");
      }
    }, 1000);
  }

  onMounted(() => {
    if (props.port) {
      nameInput.value.model = {
        name: props.port.name,
        value: props.port.name,
      };
      addressHostInput.value[0].model = {
        name: props.port.address.host[0].toString(),
        value: props.port.address.host[0].toString(),
      };
      addressHostInput.value[1].model = {
        name: props.port.address.host[1].toString(),
        value: props.port.address.host[1].toString(),
      };
      addressHostInput.value[2].model = {
        name: props.port.address.host[2].toString(),
        value: props.port.address.host[2].toString(),
      };
      addressHostInput.value[3].model = {
        name: props.port.address.host[3].toString(),
        value: props.port.address.host[3].toString(),
      };
      addressPortInput.value.model = {
        name: props.port.address.port.toString(),
        value: props.port.address.port.toString(),
      };
    }
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
