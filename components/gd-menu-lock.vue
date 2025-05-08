<template>
  <div class="gd-menu-overlay" ref="gdMenuOverlay">
    <gd-input-button-small
      v-if="view !== 'desktop'"
      icon="arrow-left"
      type="default"
      style="position: absolute; top: 1rem; left: 1rem"
      @clicked="menus = []"
    />
    <span class="gd-menu-overlay-title gd-headline-4">Enter PIN</span>
    <div class="gd-menu-overlay-numbers">
      <div
        v-for="(letter, i) in lock"
        :key="i"
        class="gd-menu-overlay-number"
        :class="
          i + 1 <= enteredPin.length ? 'gd-menu-overlay-number-filled' : ''
        "
      ></div>
    </div>
    <div class="gd-menu-overlay-keypad">
      <div class="gd-menu-overlay-row">
        <gd-input-button-big icon="1" :radius="1.5" @clicked="enterPin('1')" />
        <gd-input-button-big icon="2" :radius="1.5" @clicked="enterPin('2')" />
        <gd-input-button-big icon="3" :radius="1.5" @clicked="enterPin('3')" />
      </div>
      <div class="gd-menu-overlay-row">
        <gd-input-button-big icon="4" :radius="1.5" @clicked="enterPin('4')" />
        <gd-input-button-big icon="5" :radius="1.5" @clicked="enterPin('5')" />
        <gd-input-button-big icon="6" :radius="1.5" @clicked="enterPin('6')" />
      </div>
      <div class="gd-menu-overlay-row">
        <gd-input-button-big icon="7" :radius="1.5" @clicked="enterPin('7')" />
        <gd-input-button-big icon="8" :radius="1.5" @clicked="enterPin('8')" />
        <gd-input-button-big icon="9" :radius="1.5" @clicked="enterPin('9')" />
      </div>
      <div class="gd-menu-overlay-row">
        <gd-input-button-big
          icon="arrow-left"
          :radius="1.5"
          @clicked="deletePin"
        />
        <gd-input-button-big icon="0" :radius="1.5" @clicked="enterPin('0')" />
        <gd-input-button-big
          icon="arrow-right"
          type="primary"
          :radius="1.5"
          @clicked="checkPin"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import gsap from "gsap";
  import { InputOption } from "~/types/general";

  const emits = defineEmits(["shake"]);
  const { locked, lock, view, menus } = useMain();

  const gdMenuOverlay = ref<HTMLElement | null>(null);

  const enteredPin = ref<string>("");

  const animate = {
    init(gdPanel: HTMLElement) {
      gsap.to(gdPanel, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        filter: "blur(0px)",
        ease: "power4.out",
      });
    },
    exit(gdPanel: HTMLElement, cb?: () => void) {
      const vars: gsap.TweenVars = {
        scale: 1.1,
        opacity: 0,
        filter: "blur(10px)",
        ease: "power2.inOut",
        onComplete() {
          if (cb) cb();
        },
      };

      if (view.value === "desktop") {
        delete vars.filter;
        delete vars.scale;
      }

      gsap.to(gdPanel, vars);
    },
  };

  function enterPin(pin: string) {
    if (enteredPin.value.length < lock.value.length) {
      enteredPin.value += pin;
    }
  }
  function deletePin() {
    if (enteredPin.value.length > 0) {
      enteredPin.value = enteredPin.value.slice(0, -1);
    }
  }
  function checkPin() {
    if (enteredPin.value === lock.value && gdMenuOverlay.value) {
      animate.exit(gdMenuOverlay.value, () => {
        locked.value = false;
      });
    } else {
      emits("shake");
      enteredPin.value = "";
    }
  }

  watch(
    () => menus.value.length,
    (val, oldVal) => {
      if (view.value !== "desktop" && gdMenuOverlay.value) {
        if (val > 0 && !oldVal) {
          animate.init(gdMenuOverlay.value);
        } else if (val === 0 && oldVal) {
          animate.exit(gdMenuOverlay.value);
        }
      }
    }
  );

  onMounted(() => {});
</script>

<style lang="scss" scoped>
  .gd-menu-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--background-depth-two-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    z-index: 9999;

    .gd-menu-overlay-numbers {
      position: relative;
      width: 11rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .gd-menu-overlay-number {
        position: relative;
        width: 1.5rem;
        height: 2rem;
        background-color: var(--background-depth-three-color);
        border-radius: 0.5rem;
        display: flex;
        justify-content: center;
        align-items: center;

        &.gd-menu-overlay-number-filled {
          background-color: var(--primary-color);
        }
      }
    }

    .gd-menu-overlay-keypad {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      .gd-menu-overlay-row {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;

        button.gd-menu-overlay-row-button {
          cursor: pointer;
          position: relative;
          width: 3rem;
          height: 3rem;
          background-color: var(--background-depth-one-color);
          border-radius: 50%;
          border: var(--border);
          padding: 0 0.875rem;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;

          &.gd-menu-overlay-row-button-primary {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
          }

          &:hover {
            background-color: var(--background-depth-two-color);
          }

          &:active {
            background-color: var(--background-depth-three-color);
          }
        }
      }
    }

    @media only screen and (max-width: 1280px) {
      opacity: 0;
      transform: scale(1.1);
      filter: blur(10px);
    }
  }
</style>
