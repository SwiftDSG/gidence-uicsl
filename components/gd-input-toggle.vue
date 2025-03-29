<template>
  <div class="gd-input-component" ref="gdInputComponent">
    <label
      class="gd-input-label"
      @mousedown="mouseDownHandler"
      :class="`${buttonAnimating ? 'gd-input-label-animating ' : ''}${
        input.model ? 'gd-input-label-active ' : ''
      }`"
    >
      <div class="gd-input-label-slider"></div>
    </label>
  </div>
</template>

<script lang="ts" setup>
  import type { InputToggleOption } from "~~/types/general";

  import gsap from "gsap";

  const props = defineProps<{
    input: InputToggleOption;
  }>();

  const emits = defineEmits(["clicked"]);
  const gdInputComponent = ref<HTMLButtonElement | null>(null);

  const buttonAnimating = ref<boolean>(false);
  const buttonClicking = ref<boolean>(false);
  const buttonPressed = ref<boolean>(false);

  const animate = {
    click(
      toggled: boolean,
      gdInputComponent: HTMLElement,
      cb?: () => void
    ): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const gdInputSlider: HTMLElement | null = gdInputComponent.querySelector(
        ".gd-input-label-slider"
      );

      tl.to(gdInputSlider, {
        width: "1rem",
        x: toggled ? "-=0.25rem" : 0,
        duration: 0.25,
        ease: "power2.inOut",
      });
    },
    release(
      toggled: boolean,
      gdInputComponent: HTMLElement,
      cb?: () => void
    ): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const gdInputLabel: HTMLElement | null =
        gdInputComponent.querySelector(".gd-input-label");
      const gdInputSlider: HTMLElement | null = gdInputComponent.querySelector(
        ".gd-input-label-slider"
      );

      tl.to(gdInputLabel, {
        backgroundColor: toggled
          ? "var(--background-depth-three-color)"
          : "var(--primary-color)",
      }).to(
        gdInputSlider,
        {
          width: "0.75rem",
          x: toggled ? 0 : "0.5rem",
          duration: 0.25,
          ease: "power2.inOut",
        },
        "<0"
      );
    },
  };

  function mouseDownHandler(): void {
    buttonAnimating.value = true;
    buttonClicking.value = true;
    buttonPressed.value = true;
    if (gdInputComponent.value) {
      animate.click(props.input.model, gdInputComponent.value, () => {
        emits("clicked");
        buttonClicking.value = false;
        if (!buttonPressed.value) {
          mouseUpHandler();
        }
      });
      window.addEventListener("mouseup", mouseUpHandler);
    }
  }
  function mouseUpHandler(): void {
    window.removeEventListener("mouseup", mouseUpHandler);
    buttonPressed.value = false;
    if (!buttonClicking.value && gdInputComponent.value) {
      animate.release(props.input.model, gdInputComponent.value, () => {
        props.input.model = !props.input.model;
        setTimeout(() => {
          buttonAnimating.value = false;
        }, 100);
      });
    }
  }

  watch(
    () => props.input.model,
    (val) => {
      if (!buttonAnimating.value && gdInputComponent.value) {
        buttonAnimating.value = true;
        animate.click(!val, gdInputComponent.value, () => {
          if (gdInputComponent.value) {
            animate.release(!val, gdInputComponent.value, () => {
              buttonAnimating.value = false;
            });
          }
        });
      }
    }
  );

  onMounted(() => {
    if (props.input.model && gdInputComponent.value) {
      animate.click(false, gdInputComponent.value, () => {
        if (gdInputComponent.value) {
          animate.release(false, gdInputComponent.value, () => {
            buttonAnimating.value = false;
          });
        }
      });
    }
  });
</script>

<style lang="scss" scoped>
  .gd-input-component {
    position: relative;
    width: 1.5rem;
    height: 1rem;
    display: flex;
    align-items: center;
    label.gd-input-label {
      cursor: pointer;
      position: relative;
      width: 100%;
      height: 100%;
      background: var(--background-depth-three-color);
      border-radius: 0.5rem;
      padding: 0.125rem;
      box-sizing: border-box;
      transition: 0.25s ease-in-out background-color;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      * {
        pointer-events: none;
      }
      .gd-input-label-slider {
        position: absolute;
        top: 0.125rem;
        left: 0.125rem;
        width: 0.75rem;
        height: 0.75rem;
        border-radius: 0.375rem;
        box-sizing: border-box;
        background: var(--background-depth-one-color);
        overflow: hidden;
        display: flex;
        align-items: center;
      }
      &.gd-input-label-animating {
        pointer-events: none;
      }
      &.gd-input-label-active {
        background: var(--primary-color);
      }
    }
  }
</style>
