<template>
  <button
    class="gd-input-component"
    ref="gdInputComponent"
    @mousedown="mouseDownHandler"
    @keydown.space.enter="keyDownHandler"
    :class="`${disabled ? 'gd-input-component-disabled' : ''} ${
      loading || buttonAnimating ? 'gd-input-component-animating' : ''
    } ${side ? `gd-input-component-${side}` : ''} gd-input-component-${
      type || 'default'
    }`"
    :disabled="disabled"
  >
    <div v-if="icon" class="gd-input-icon-container">
      <gd-svg
        :name="icon"
        :color="
          type === 'primary' ? 'secondary' : type === 'error' ? 'error' : ''
        "
      />
    </div>
    <div v-else-if="image" class="gd-input-image-container">
      <img :src="image" class="gd-input-image" />
    </div>
    <div v-else-if="color" class="gd-input-color-container">
      <div :style="`background: ${color}`" class="gd-input-color"></div>
    </div>
    <div class="gd-input-progress-bar">
      <div class="gd-input-progress-bar-outer">
        <div class="gd-input-progress-bar-inner"></div>
      </div>
    </div>
    <div class="gd-input-overlay"></div>
    <div class="gd-input-border"></div>
    <client-only>
      <div class="gd-input-tooltip" v-if="tooltip && view === 'desktop'">
        <span class="gd-input-tooltip-message gd-headline-6">{{
          tooltip
        }}</span>
      </div>
    </client-only>
  </button>
</template>

<script lang="ts" setup>
  import gsap from "gsap";

  const props = defineProps<{
    icon?: string;
    image?: string;
    color?: string;
    disabled?: boolean;
    loading?: boolean;
    type?: "default" | "primary" | "secondary" | "error";
    side?: "left" | "right";
    tooltip?: string;
  }>();
  const emits = defineEmits(["clicked"]);
  const { view } = useMain();

  const gdInputComponent = ref<HTMLButtonElement | null>(null);

  const buttonAnimating = ref<boolean>(false);
  const buttonClicking = ref<boolean>(false);
  const buttonPressed = ref<boolean>(false);
  const buttonLoadingAnim = ref<GSAPTimeline | null>(null);

  const animate = {
    click(gdInputComponent: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const gdOverlay: HTMLElement | null =
        gdInputComponent.querySelector(".gd-input-overlay");

      tl.to(gdInputComponent, {
        scale: 0.95,
        duration: 0.25,
        ease: "power2.out",
      }).to(
        gdOverlay,
        {
          opacity: 1,
          duration: 0.25,
          ease: "power2.inOut",
        },
        "<0"
      );
    },
    release(gdInputComponent: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const gdOverlay: HTMLElement | null =
        gdInputComponent.querySelector(".gd-input-overlay");

      tl.to(gdInputComponent, {
        scale: 1,
        duration: 0.25,
        ease: "back.out(2)",
      }).to(
        gdOverlay,
        {
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        },
        "<0"
      );
    },
    loading(gdInputComponent: HTMLElement, cb?: () => void): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({});

      const gdProgressBar: HTMLElement | null = gdInputComponent.querySelector(
        ".gd-input-progress-bar"
      );
      if (gdProgressBar) {
        const gdLabel: Element | null =
          gdProgressBar.previousElementSibling?.firstElementChild || null;

        tl.to(gdLabel, {
          y: "-100%",
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
          stagger: 0.05,
        }).to(gdProgressBar, {
          opacity: 1,
          duration: 0.25,
          ease: "powr2.out",
        });
      }

      return tl;
    },
  };

  function mouseDownHandler(e?: MouseEvent): MouseEvent | undefined {
    buttonAnimating.value = true;
    buttonClicking.value = true;
    buttonPressed.value = true;
    if (gdInputComponent.value) {
      animate.click(gdInputComponent.value, () => {
        buttonClicking.value = false;
        if (!buttonPressed.value) {
          releaseHandler();
        }
      });
    }
    window.addEventListener("mouseup", releaseHandler);

    return e;
  }
  function keyDownHandler(e?: KeyboardEvent): KeyboardEvent | undefined {
    buttonAnimating.value = true;
    buttonClicking.value = true;
    buttonPressed.value = true;
    if (gdInputComponent.value) {
      animate.click(gdInputComponent.value, () => {
        buttonClicking.value = false;
        if (!buttonPressed.value) {
          releaseHandler();
        }
      });
    }
    window.addEventListener("keyup", releaseHandler);

    return e;
  }
  function releaseHandler(): void {
    window.removeEventListener("mouseup", releaseHandler);
    window.removeEventListener("keyup", releaseHandler);
    buttonPressed.value = false;
    if (!buttonClicking.value && gdInputComponent.value) {
      emits("clicked");
      animate.release(gdInputComponent.value, () => {
        buttonAnimating.value = false;
      });
    }
  }

  watch(
    () => props.loading,
    (val) => {
      setTimeout(() => {
        if (!buttonLoadingAnim.value && gdInputComponent.value) {
          buttonLoadingAnim.value = animate.loading(gdInputComponent.value);
        }
        if (buttonLoadingAnim.value) {
          if (val) buttonLoadingAnim.value.play();
          else buttonLoadingAnim.value.reverse();
        }
      }, 100);
    }
  );

  onBeforeUnmount(() => {
    window.removeEventListener("mouseup", releaseHandler);
    window.removeEventListener("keyup", releaseHandler);
  });
</script>

<style lang="scss" scoped>
  button.gd-input-component {
    cursor: pointer;
    position: relative;
    width: 2rem;
    height: 2rem;
    display: flex;
    border-radius: 0.5rem;
    margin: 0;
    background: var(--background-depth-one-color);
    border: none;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    * {
      pointer-events: none;
    }

    .gd-input-icon-container,
    .gd-input-image-container,
    .gd-input-color-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;

      img.gd-input-image {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 0.5rem;
        object-fit: cover;
      }

      .gd-input-color {
        position: relative;
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 0.375rem;
      }
    }

    .gd-input-icon-container {
      padding: 0 0.5rem;
      box-sizing: border-box;
    }

    .gd-input-progress-bar {
      position: absolute;
      top: calc(50% - 0.375rem);
      left: calc(50% - 0.375rem);
      width: 0.75rem;
      height: 0.75rem;
      opacity: 0;
      animation: gd-rotate 500ms linear infinite;

      .gd-input-progress-bar-outer {
        position: absolute;
        top: 0;
        left: 0;
        width: 0.375rem;
        height: 0.75rem;
        overflow: hidden;

        .gd-input-progress-bar-inner {
          position: absolute;
          top: 0;
          left: 0;
          width: 0.75rem;
          height: 0.75rem;
          border: 2px solid var(--font-secondary-color);
          border-radius: 50%;
          border-left-color: transparent;
          border-bottom-color: transparent;
          box-sizing: border-box;
          animation: gd-circular-rotate 1000ms cubic-bezier(0.4, 0, 0.22, 1)
            infinite;
        }
      }
    }

    .gd-input-overlay {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 0.5rem;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      opacity: 0;
    }

    .gd-input-tooltip {
      z-index: 2000000;
      position: absolute;
      top: calc(100% + 0.25rem);
      height: 1rem;
      padding: 0 0.25rem;
      border-radius: 0.25rem;
      background: var(--font-primary-color);
      opacity: 0;
      transform: scale(0.75);
      transform-origin: top center;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.125s opacity, 0.125s transform ease-out;

      span.gd-input-tooltip-message {
        position: relative;
        color: var(--background-depth-one-color);
        white-space: nowrap;
      }

      &::after {
        content: " ";
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0.25rem;
        border-style: solid;
        border-color: transparent transparent var(--font-primary-color)
          transparent;
      }
    }

    .gd-input-border {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 0.5rem;
      border: var(--border);
      box-sizing: border-box;
      transition: 0.25s border-color, 0.25s border-width;

      &::before {
        content: "";
        position: absolute;
        top: -3px;
        left: -3px;
        width: calc(100% + 6px);
        height: calc(100% + 6px);
        border-radius: 0.5rem;
        border: 3px solid var(--primary-color);
        box-sizing: border-box;
        opacity: 0;
        transition: 0.25s opacity;
      }
    }

    &.gd-input-component-disabled {
      pointer-events: none;
      filter: grayscale(0.75);
      opacity: 0.25;
    }

    &.gd-input-component-primary {
      background: var(--primary-color);
      border-color: var(--primary-color);

      .gd-input-border {
        border-color: var(--primary-color);
      }
    }

    &.gd-input-component-error {
      border-color: var(--error-color);

      .gd-input-border {
        border-color: var(--error-color);
      }
    }

    &.gd-input-component-left {
      .gd-input-overlay {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .gd-input-border {
        border-right: 0.5px solid var(--border-color);
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    &.gd-input-component-right {
      .gd-input-overlay {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      .gd-input-border {
        border-left: 0.5px solid var(--border-color);
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }

    &.gd-input-component-animating {
      pointer-events: none;
    }

    @media only screen and (min-width: 1025px) {
      &:hover {
        z-index: 10;

        &:not(:active) {
          .gd-input-tooltip {
            opacity: 1;
            transform: scale(1);
          }
        }
      }
    }

    &:focus-visible {
      outline: none;

      .gd-input-border {
        border-color: var(--primary-color);

        &::before {
          opacity: 0.25;
        }
      }
    }
  }
</style>
