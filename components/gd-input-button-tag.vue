<template>
  <button
    class="gd-input-component"
    ref="gdInputComponent"
    :class="`${props.disabled ? 'gd-input-component-disabled' : ''} ${
      props.loading || buttonAnimating ? 'gd-input-component-animating' : ''
    } gd-input-component-${props.type ? props.type : 'primary'}`"
    :disabled="props.disabled"
    @mousedown="mouseDownHandler"
  >
    <div class="gd-input-label-container">
      <label class="gd-input-label gd-body-text gd-input-label-decoy">
        {{ props.label }}
      </label>
      <label class="gd-input-label gd-headline-6 gd-input-label-main">
        <span
          class="gd-letter"
          :class="letter === ' ' ? 'gd-letter-space' : ''"
          v-for="(letter, i) in props.label"
          :key="i"
        >
          {{ letter }}
        </span>
      </label>
      <label class="gd-input-label gd-body-text gd-input-label-overlay">
        <span
          class="gd-letter"
          :class="letter === ' ' ? 'gd-letter-space' : ''"
          v-for="(letter, i) in props.label"
          :key="i"
        >
          {{ letter }}
        </span>
      </label>
    </div>
    <div class="gd-input-progress-bar">
      <div class="gd-input-progress-bar-outer">
        <div class="gd-input-progress-bar-inner"></div>
      </div>
    </div>
    <div class="gd-input-overlay"></div>
  </button>
</template>

<script lang="ts" setup>
  import gsap from "gsap";

  const props = defineProps<{
    label: string;
    type?: "primary" | "secondary" | "error" | "background";
    disabled?: boolean;
    loading?: boolean;
  }>();
  const emits = defineEmits(["clicked"]);

  const gdInputComponent = ref<HTMLButtonElement | null>(null);

  const buttonAnimating = ref<boolean>(false);
  const buttonClicking = ref<boolean>(false);
  const buttonPressed = ref<boolean>(false);
  const buttonHovered = ref<boolean>(false);
  const buttonLoadingAnim = ref<GSAPTimeline | null>(null);

  const animate = {
    hover(gdInputComponent: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          gsap.to(gdLetter, {
            y: 0,
            opacity: 1,
            duration: 0,
          });
          gsap.to(gdOverlayLetter, {
            y: "100%",
            opacity: 0,
            duration: 0,
          });
          if (cb) cb();
        },
      });

      const gdLetter: HTMLElement[] = gsap.utils.toArray(
        gdInputComponent.querySelectorAll(
          "label.gd-input-label-main .gd-letter"
        )
      );
      const gdOverlayLetter: HTMLElement[] = gsap.utils.toArray(
        gdInputComponent.querySelectorAll(
          "label.gd-input-label-overlay .gd-letter"
        )
      );

      tl.to(gdLetter, {
        y: "-100%",
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        stagger: 0.05,
      }).to(
        gdOverlayLetter,
        {
          y: 0,
          opacity: 1,
          duration: 0.25,
          ease: "powr2.out",
          stagger: 0.05,
        },
        "<0.125"
      );
    },
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

      const gdLetter: HTMLElement[] = gsap.utils.toArray(
        gdInputComponent.querySelectorAll(
          "label.gd-input-label-main .gd-letter"
        )
      );
      const gdProgressBar: HTMLElement | null = gdInputComponent.querySelector(
        ".gd-input-progress-bar"
      );

      tl.to(gdLetter, {
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

      return tl;
    },
  };

  function mouseDownHandler(e: MouseEvent): MouseEvent {
    buttonAnimating.value = true;
    buttonClicking.value = true;
    buttonPressed.value = true;
    if (gdInputComponent.value) {
      animate.click(gdInputComponent.value, () => {
        buttonClicking.value = false;
        if (!buttonPressed.value) {
          mouseUpHandler();
        }
      });
    }
    window.addEventListener("mouseup", mouseUpHandler);
    return e;
  }
  function mouseUpHandler(): void {
    window.removeEventListener("mouseup", mouseUpHandler);
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
    window.removeEventListener("mouseup", mouseUpHandler);
  });
</script>

<style lang="scss" scoped>
  button.gd-input-component {
    cursor: pointer;
    position: relative;
    height: 1.5rem;
    display: flex;
    background: var(--primary-color);
    border-radius: 0.75rem;
    border: 1px solid var(--primary-color);
    padding: 0;
    margin: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    * {
      pointer-events: none;
    }
    .gd-input-label-container {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 0 0.5rem;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      label.gd-input-label {
        position: absolute;
        width: 100%;
        height: 100%;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        span.gd-letter {
          position: relative;
          display: flex;
          color: inherit;
          line-height: 1;
          &.gd-letter-space {
            width: 0.125rem;
            height: 100%;
          }
        }
        &.gd-input-label-overlay {
          span.gd-letter {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        &.gd-input-label-decoy {
          position: relative;
          opacity: 0;
          visibility: hidden;
        }
      }
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
          border: 2px solid #fff;
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
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      opacity: 0;
    }
    &.gd-input-component-disabled {
      pointer-events: none;
      filter: grayscale(0.75);
      opacity: 0.5;
    }
    &.gd-input-component-animating {
      pointer-events: none !important;
    }
    &.gd-input-component-icon {
      .gd-input-label-container {
        width: calc(100% - 2rem);
      }
      .gd-input-icon-container {
        position: relative;
        width: 2rem;
        height: 2rem;
        background: rgba(0, 0, 0, 0.05);
        padding: 0 0.5rem;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    &.gd-input-component-secondary {
      background: transparent;
      border: var(--border);
      box-sizing: border-box;
      .gd-input-label-container {
        label.gd-input-label {
          color: var(--font-primary-color);
        }
      }
    }
    &.gd-input-component-background {
      background: var(--background-depth-one-color);
      .gd-input-label-container {
        label.gd-input-label {
          color: var(--font-primary-color);
        }
      }
    }
    &.gd-input-component-error {
      background: transparent;
      border: 1px solid var(--error-color);
      box-sizing: border-box;
      .gd-input-label-container {
        label.gd-input-label {
          color: var(--error-color);
        }
      }
    }
  }
</style>
