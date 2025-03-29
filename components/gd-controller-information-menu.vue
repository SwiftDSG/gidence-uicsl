<template>
  <gd-menu label="Edit Controller" :active="active" class="gd-menu">
    <div class="gd-menu-body">
      <div class="gd-menu-input-wrapper">
        <gd-input-text class="gd-menu-input" :input="nameInput" />
      </div>
    </div>
    <div class="gd-menu-footer">
      <gd-input-button
        @clicked="submit"
        :disabled="!name"
        :loading="submitLoading"
        style="width: 100%"
        label="update controller"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import { InputOption } from "~/types/general";

  const { device, closeMenu } = useMain();
  const { updateController } = useController();

  const emits = defineEmits(["shake"]);
  const props = defineProps<{
    active: boolean;
  }>();

  const submitLoading = ref<boolean>(false);

  const nameInput = ref<InputOption>({
    name: "name",
    label: "Controller name",
    placeholder: "Super Chiller 01",
    model: {
      name: "",
      value: "",
    },
    error: "",
  });

  const name = computed<string>(() => nameInput.value.model.value);

  async function submit(): Promise<void> {
    if (!name.value || !device.value) return;
    submitLoading.value = true;
    const payload = {
      ...device.value.controller,
      name: name.value,
    };

    const result = await updateController(payload);
    setTimeout(() => {
      submitLoading.value = false;
      if (result) {
        if (device.value) device.value.controller = result;
        closeMenu();
      } else {
        emits("shake");
      }
    }, 1000);
  }

  onMounted(() => {
    if (device.value) {
      nameInput.value.model = {
        name: device.value.controller.name,
        value: device.value.controller.name,
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
      gap: 1rem;

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
