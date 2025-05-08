<template>
  <div class="gd-menu-overlay">
    <span class="gd-menu-overlay-title gd-headline-4">Enter PIN</span>
    <div class="gd-menu-overlay-numbers">
      <div class="gd-menu-overlay-number"></div>
      <div class="gd-menu-overlay-number"></div>
      <div class="gd-menu-overlay-number"></div>
      <div class="gd-menu-overlay-number"></div>
      <div class="gd-menu-overlay-number"></div>
      <div class="gd-menu-overlay-number"></div>
    </div>
    <div class="gd-menu-overlay-keypad">
      <div class="gd-menu-overlay-row">
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="1" />
        </button>
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="2" />
        </button>
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="3" />
        </button>
      </div>
      <div class="gd-menu-overlay-row">
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="4" />
        </button>
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="5" />
        </button>
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="6" />
        </button>
      </div>
      <div class="gd-menu-overlay-row">
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="7" />
        </button>
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="8" />
        </button>
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="9" />
        </button>
      </div>
      <div class="gd-menu-overlay-row">
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="arrow-left" />
        </button>
        <button class="gd-menu-overlay-row-button">
          <gd-svg name="0" />
        </button>
        <button
          class="gd-menu-overlay-row-button gd-menu-overlay-row-button-primary"
        >
          <gd-svg name="arrow-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { InputOption } from "~/types/general";

  const pinInput = ref<InputOption>({
    name: "pin",
    placeholder: "Enter PIN",
    type: "password",
    disabled: true,
    alignment: "center",
    model: {
      name: "",
      value: "",
    },
  });
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
  }
</style>
