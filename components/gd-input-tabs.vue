<template>
  <div
    class="gd-input-component"
    ref="gdInputComponent"
    :class="input.disabled ? 'gd-input-component-disabled' : ''"
  >
    <input
      v-for="(option, i) in input.options"
      :key="i"
      type="radio"
      class="gd-input"
      name="gd-input-radio"
      ref="gdInput"
      :id="`${id}-${i}`"
      :disabled="input.disabled"
      :data-index="i"
      @change="updateModel"
    />
    <label
      v-for="(option, i) in input.options"
      :key="i"
      :for="`${id}-${i}`"
      :class="props.input.model === option ? 'gd-input-label-active' : ''"
      class="gd-input-label"
      ref="gdInputLabel"
    >
      <span class="gd-input-label-option gd-body-text">{{ option }}</span>
    </label>
    <div ref="gdInputBorder" class="gd-input-border"></div>
  </div>
</template>

<script lang="ts" setup>
  import type { InputSwitchOption } from "~~/types/general";

  import gsap from "gsap";

  type Size = {
    left: number;
    width: number;
  };

  const props = defineProps<{
    input: InputSwitchOption;
  }>();
  const { rem } = useMain();

  const gdInputLabel = ref<HTMLLabelElement[] | null>(null);
  const gdInputComponent = ref<HTMLDivElement | null>(null);
  const gdInputBorder = ref<HTMLDivElement | null>(null);

  const windowLeft = ref<number>(0);
  const sizes = ref<Size[]>([]);

  const id = computed<string>(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let combination = "";
    for (let i = 0; i < 6; i++) {
      combination += chars[Math.round(Math.random() * 35)];
    }
    return `gd-input-${combination}`;
  });

  function updateModel(e: Event): Event {
    if (e.target instanceof HTMLInputElement) {
      const index: number = parseInt(e.target.dataset.index || "-1");
      if (index > -1) {
        props.input.model = props.input.options[index];
        const { width, left }: Size = sizes.value[index];
        gsap.to(gdInputBorder.value, {
          x: left - windowLeft.value - 0.75 * rem.value,
          width,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    }
    return e;
  }

  watch(
    () => props.input.model,
    (val) => {
      const index = props.input.options.findIndex((a) => a === val);
      if (index > -1) {
        const { width, left }: Size = sizes.value[index];
        gsap.to(gdInputBorder.value, {
          x: left - windowLeft.value - 0.75 * rem.value,
          width,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    }
  );

  onMounted(() => {
    if (gdInputComponent.value && gdInputLabel.value) {
      windowLeft.value = gdInputComponent.value.getBoundingClientRect().left;
      for (const gdElement of gdInputLabel.value) {
        const { width, left }: DOMRect = gdElement.getBoundingClientRect();
        sizes.value.push({ width, left });
      }

      const gdInput = gdInputComponent.value.querySelector("input");
      if (gdInput) gdInput.click();
    }
  });
</script>

<style lang="scss" scoped>
  .gd-input-component {
    position: relative;
    width: 100%;
    padding: 0 0.75rem;
    box-sizing: border-box;
    display: flex;
    gap: 0.75rem;
    align-items: center;
    overflow-x: auto;
    input.gd-input {
      pointer-events: none;
      position: fixed;
      top: -1rem;
      left: -1rem;
      opacity: 0;
      &:checked + label.gd-input-label {
        .gd-input-label-slider {
          transform: translateX(100%);
          span.gd-input-label-slider-option {
            transform: translateX(-100%);
          }
        }
      }
    }
    label.gd-input-label {
      cursor: pointer;
      position: relative;
      padding-bottom: 0.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      * {
        pointer-events: none;
      }
      span.gd-input-label-option {
        position: relative;
        width: 100%;
        white-space: nowrap;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.2s color;
      }
      &.gd-input-label-active {
        span.gd-input-label-option {
          color: var(--primary-color);
        }
      }
    }
    .gd-input-border {
      position: absolute;
      bottom: 0;
      height: 2px;
      background: var(--primary-color);
    }
    &.gd-input-component-disabled {
      pointer-events: none;
      opacity: 0.5;
    }
    &::-webkit-scrollbar {
      display: none;
    }
  }
</style>
