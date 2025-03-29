<template>
  <div class="gd-component" ref="gdComponent">
    <div class="gd-panel" ref="gdPanel">
      <div
        v-if="label"
        class="gd-panel-header"
        :class="headerActive ? 'gd-panel-header-active' : ''"
      >
        <gd-input-button-small
          class="gd-panel-button"
          :icon="'arrow-left'"
          @clicked="closeMenu"
        />
        <h2 v-if="label" class="gd-panel-title gd-headline-5">{{ label }}</h2>
        <gd-input-button-small
          v-if="action"
          class="gd-panel-button"
          :icon="action.icon"
          :disabled="action.disabled"
          :type="action.type || 'primary'"
          @clicked="emits('clicked')"
        />
      </div>
      <div
        class="gd-panel-body"
        @scroll="scrollHandler"
        :class="!label ? 'gd-panel-body-full' : ''"
      >
        <h2 v-if="label" class="gd-panel-title gd-headline-3">{{ label }}</h2>
        <div class="gd-panel-content">
          <slot />
        </div>
      </div>
      <gd-progress-bar
        :state="loading ? 'show' : 'hide'"
        class="gd-panel-overlay-loading"
        type="overlay"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { View } from "~~/types/general";

  import gsap from "gsap";

  const { view, rem, menus, closeMenu } = useMain();
  const props = defineProps<{
    active: boolean;
    label?: string;
    action?: {
      icon: string;
      type?: "primary" | "secondary" | "default";
      disabled?: boolean;
    };
    loading?: boolean;
  }>();
  const emits = defineEmits(["exit", "clicked"]);

  const gdPanel = ref<HTMLDivElement | null>(null);

  const scrollValue = ref<number>(0);
  const scrollThreshold = ref<number>(0);

  const headerActive: ComputedRef<boolean> = computed(
    (): boolean => scrollValue.value >= scrollThreshold.value
  );

  const animate = {
    init(gdPanel: HTMLElement) {
      gsap.to(gdPanel, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power4.out",
      });
    },
    exit(view: View, gdPanel: HTMLElement, cb?: () => void) {
      const vars: gsap.TweenVars = {
        y: "125%",
        duration: 0.5,
        ease: "power2.inOut",
        onComplete() {
          if (cb) cb();
        },
      };
      if (view === "desktop") {
        delete vars.y;
        vars.x = "125%";
      }

      gsap.to(gdPanel, vars);
    },
  };

  function scrollHandler(e: Event): UIEvent {
    if (e.target instanceof HTMLElement) {
      scrollValue.value = e.target.scrollTop;
    }
    return e as UIEvent;
  }

  function exit(): void {
    if (gdPanel.value) {
      animate.exit(view.value, gdPanel.value);
    }
  }

  watch(
    () => menus.value.length,
    (val, oldVal) => {
      if (val < oldVal && gdPanel.value && props.active) {
        exit();
      }
    }
  );

  onMounted(() => {
    scrollThreshold.value = 2 * rem.value;
    if (gdPanel.value) {
      animate.init(gdPanel.value);
    }
  });
</script>

<style lang="scss" scoped>
  .gd-component {
    position: fixed;
    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    height: calc(var(--vh) * 100);
    display: flex;
    flex-shrink: 0;
    .gd-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(43, 25, 6, 0.5);
      backdrop-filter: blur(10px);
      opacity: 0;
    }
    .gd-panel {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      height: calc(var(--vh) * 100);
      background: var(--background-depth-two-color);
      overflow-y: hidden;
      overflow-x: visible;
      display: flex;
      flex-direction: column;
      transform: translateY(125%);
      .gd-panel-header {
        z-index: 2;
        position: relative;
        width: 100%;
        height: 4rem;
        background: var(--background-depth-two-color);
        padding: 1rem;
        box-sizing: border-box;
        box-shadow: 0 0.5rem 0.5rem 0.5rem var(--background-depth-two-color);
        display: flex;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        .gd-panel-button {
          position: absolute;
          top: 1rem;
          left: 1rem;
          &:last-child {
            left: auto;
            right: 1rem;
          }
        }
        .gd-panel-title {
          position: relative;
          opacity: 0;
          transform: scale(0.875);
          transition: 0.25s opacity, 0.25s transform;
        }
        &.gd-panel-header-active {
          box-shadow: none;
          .gd-panel-title {
            opacity: 1;
            transform: scale(1);
          }
          &::after {
            opacity: 1;
          }
        }
        &::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          height: 1px;
          background: var(--border-color);
          opacity: 0;
          transition: 0.25s opacity;
        }
      }
      .gd-panel-body {
        z-index: 1;
        position: relative;
        width: 100%;
        height: calc(100% - 4rem);
        padding: 1rem 1rem 0 1rem;
        box-sizing: border-box;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-shrink: 0;
        flex-direction: column;
        h2.gd-panel-title {
          position: relative;
          width: 100%;
          height: 1rem;
          margin-bottom: 1rem;
          display: flex;
          flex-shrink: 0;
          align-items: center;
        }
        .gd-panel-content {
          position: relative;
          width: 100%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }
        &.gd-panel-body-full {
          height: 100%;
        }
      }
      .gd-panel-overlay {
        pointer-events: none;
        z-index: 999999;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 1rem;
        opacity: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.25s opacity;
        .gd-panel-overlay-loading {
          z-index: 2;
        }
        &::before {
          z-index: 0;
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(5px);
        }
        &::after {
          z-index: 1;
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--font-primary-color);
          opacity: 0.25;
        }
        &.gd-panel-overlay-active {
          pointer-events: all;
          opacity: 1;
        }
      }
    }
    @media only screen and (min-width: 1025px) {
      width: 20rem;
      .gd-panel {
        top: 0;
        right: 0;
        width: 100%;
        box-sizing: border-box;
        transform: translateX(125%);
      }
    }
  }
</style>
