<template>
  <gd-menu :active="active" label="Delete Function" class="gd-menu">
    <p class="gd-menu-message gd-caption-text">
      Warning! this action cannot be undone
    </p>
    <div class="gd-menu-footer">
      <gd-input-button
        @clicked="submit"
        :loading="submitLoading"
        style="width: 100%"
        label="Delete function"
        type="error"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import type { Function } from "~/types/function";

  const emits = defineEmits(["exit", "shake"]);
  const props = defineProps<{
    active: boolean;
    function: Function;
  }>();
  const { closeMenu } = useMain();
  const { deleteFunction } = useFunction();

  const submitLoading = ref<boolean>(false);

  async function submit(): Promise<void> {
    submitLoading.value = true;

    const result = await deleteFunction(props.function);
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
