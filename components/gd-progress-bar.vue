<template>
  <div
    ref="gdComponent"
    class="gd-component"
    :class="`${type === 'overlay' ? 'gd-component-overlay' : ''} ${
      type === 'fixed' ? 'gd-component-fixed' : ''
    }`"
  >
    <div class="gd-progress-bar-outer">
      <div class="gd-progress-bar-inner"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import gsap from "gsap";

  const props = defineProps<{
    state: "show" | "hide";
    type?: "default" | "overlay" | "fixed";
    immediate?: boolean;
  }>();

  const gdComponent = ref<HTMLDivElement | null>(null);
  const initialized = ref<boolean>(false);

  const animate = {
    init(gdComponent: HTMLElement) {
      const vars: gsap.TweenVars = {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.inOut",
        onStart: () => {
          gdComponent.style.pointerEvents = "auto";
        },
        onComplete: () => {
          initialized.value = true;
        },
      };

      if (props.type === "overlay" || props.type === "fixed") {
        delete vars.scale;
      }
      if (props.immediate && !initialized.value) {
        vars.duration = 0;
        delete vars.ease;
      }

      gsap.to(gdComponent, vars);
    },
    exit(gdComponent: HTMLElement): void {
      const vars: gsap.TweenVars = {
        duration: 0.5,
        opacity: 0,
        scale: 1.125,
        ease: "power2.inOut",
        onComplete: () => {
          gdComponent.style.pointerEvents = "none";
        },
      };

      if (props.type === "overlay" || props.type === "fixed") {
        delete vars.scale;
      }

      gsap.to(gdComponent, vars);
    },
  };

  watch(
    () => props.state,
    (val) => {
      if (gdComponent.value) {
        if (val === "hide") animate.exit(gdComponent.value);
        else animate.init(gdComponent.value);
      }
    }
  );

  onMounted(() => {
    if (props.state === "show" && gdComponent.value)
      animate.init(gdComponent.value);
  });
</script>

<style lang="scss" scoped>
  .gd-component {
    pointer-events: none;
    position: relative;
    width: 10rem;
    height: 2rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    box-sizing: border-box;
    background: var(--background-depth-one-color);
    box-shadow: var(--box-shadow);
    opacity: 0;
    display: flex;
    justify-content: center !important;
    align-items: center !important;
    transform: scale(0.875);
    overflow: hidden;
    .gd-progress-bar-outer {
      position: relative;
      width: 100%;
      height: 0.25rem;
      border-radius: 0.125rem;
      background: var(--background-depth-three-color);
      overflow: hidden;
      display: flex;
      .gd-progress-bar-inner {
        position: absolute;
        top: 0;
        left: 0;
        right: 100%;
        height: 100%;
        background: var(--primary-color);
        border-radius: 0.125rem;
        animation: gd-loading 2s ease infinite;
      }
    }
    &.gd-component-overlay,
    &.gd-component-fixed {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 0 2rem;
      border-radius: 0;
      background: var(--background-depth-one-color);
      box-shadow: none;
      opacity: 0;
      transform: scale(1) !important;
      .gd-progress-bar-outer {
        max-width: 10rem;
      }
    }
    &.gd-component-fixed {
      position: fixed;
    }
  }
</style>
