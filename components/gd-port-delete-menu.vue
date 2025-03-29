<template>
  <gd-menu :active="active" label="Delete Port" class="gd-menu">
    <p class="gd-menu-message gd-caption-text">
      Warning! deleting this port will also delete all devices available within
      this port, also this action cannot be undone
    </p>
    <div class="gd-menu-footer">
      <gd-input-button
        @clicked="submit"
        :loading="submitLoading"
        style="width: 100%"
        label="Delete port"
        type="error"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import { Port } from "~/types/port";

  const emits = defineEmits(["exit", "shake"]);
  const props = defineProps<{
    active: boolean;
    port: Port;
  }>();
  const { closeMenu } = useMain();
  const { deletePort } = usePort();

  const submitLoading = ref<boolean>(false);

  async function submit(): Promise<void> {
    submitLoading.value = true;

    const result = await deletePort(props.port);
    setTimeout(() => {
      submitLoading.value = false;
      if (result) {
        closeMenu();
      } else {
        emits("shake");
      }
    }, 1000);
  }
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
