<template>
  <gd-menu label="Edit Controller" :active="active" class="gd-menu">
    <div class="gd-menu-informations">
      <div class="gd-menu-informations-header">
        <span class="gd-menu-informations-title gd-headline-5"
          >Controller information</span
        >
      </div>
      <div class="gd-menu-informations-body">
        <div class="gd-menu-input-wrapper">
          <gd-input-text class="gd-menu-input" :input="nameInput" />
        </div>
      </div>
    </div>
    <div class="gd-menu-informations">
      <div class="gd-menu-informations-header">
        <span class="gd-menu-informations-title gd-headline-5"
          >System password</span
        >
        <gd-input-toggle
          class="gd-menu-item-information-input"
          :input="lockEnabledInput"
        />
      </div>
      <div v-if="lockEnabled" class="gd-menu-informations-body">
        <div class="gd-menu-input-wrapper">
          <gd-input-text class="gd-menu-input" :input="lockInput" />
        </div>
      </div>
    </div>
    <div class="gd-menu-padding"></div>
    <div class="gd-menu-footer">
      <gd-input-button
        @clicked="submit"
        :disabled="!name || (lockEnabled && lock.length !== 6)"
        :loading="submitLoading"
        style="width: 100%"
        label="update controller"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import { InputOption } from "~/types/general";

  const { lock: l, device, closeMenu } = useMain();
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
  });
  const lockEnabledInput = ref<InputToggleOption>({
    model: false,
  });
  const lockInput = ref<InputOption>({
    name: "lock",
    placeholder: "Enter PIN",
    model: {
      name: "",
      value: "",
    },
    type: "password",
  });

  const name = computed<string>(() => nameInput.value.model.value);
  const lockEnabled = computed<boolean>(() => lockEnabledInput.value.model);
  const lock = computed<string>(() => lockInput.value.model.value);

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
        if (lock.value) {
          l.value = lock.value;
          localStorage.setItem("lock", lock.value);
        } else {
          l.value = "";
          localStorage.removeItem("lock");
        }
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
    if (l.value) {
      lockEnabledInput.value.model = true;
      lockInput.value.model = {
        name: "",
        value: l.value,
      };
    }
  });
</script>

<style lang="scss" scoped>
  .gd-menu {
    position: relative;
    display: flex;
    flex-direction: column;

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

      .gd-menu-informations-header {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

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
