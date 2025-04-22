<template>
  <div
    ref="gdInputComponent"
    class="gd-input-component"
    :class="`${input.error ? 'gd-input-error' : ''} ${
      input.disabled ? 'gd-input-disabled' : ''
    }`"
  >
    <label v-if="input.label" class="gd-input-label gd-caption-text">{{
      input.label
    }}</label>
    <div class="gd-input-container">
      <textarea
        class="gd-input gd-body-text"
        type="text"
        :placeholder="input.placeholder"
        :name="input.name"
        :disabled="input.disabled"
        ref="gdInput"
        autocomplete="off"
        @input="updateModel"
        @focusout="focusHandler"
      ></textarea>
      <div class="gd-input-border"></div>
    </div>
    <span
      v-if="typeof input.error === 'string'"
      class="gd-input-error gd-caption-text"
    >
      <span class="gd-text-wrapper">
        <span class="gd-text-container gd-text-container-up">
          <span class="gd-text">{{ inputError }}</span>
        </span>
      </span>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import type { InputOption } from "~~/types/general.js";

  const props = defineProps<{
    input: InputOption;
  }>();
  const emits = defineEmits(["focusout"]);

  const gdInput = ref<HTMLInputElement | null>(null);

  const inputError = ref<string | undefined>(props.input.error);
  const inputModel = ref<string>("");

  function focusHandler(): void {
    emits("focusout", props.input);
  }
  function updateModel(e: Event): void {
    if (e.target instanceof HTMLTextAreaElement) {
      inputModel.value = e.target.value;
      props.input.model = {
        name: e.target.value,
        value: e.target.value,
      };
    }
  }

  watch(
    () => props.input.model,
    (val) => {
      if (inputModel.value !== val.name && gdInput.value) {
        gdInput.value.value = val.name;
        inputModel.value = val.name;
      }
    },
    { deep: true }
  );
  watch(
    () => props.input.error,
    (val) => {
      if (val) inputError.value = val;
    }
  );

  onMounted(() => {
    if (props.input.model.name && gdInput.value) {
      gdInput.value.value = props.input.model.name;
      inputModel.value = props.input.model.name;
    }
  });
</script>

<style lang="scss" scoped>
  .gd-input-component {
    position: relative;
    display: flex;
    flex-direction: column;

    label.gd-input-label {
      position: relative;
      width: 100%;
      height: 1rem;
      display: flex;
      color: var(--font-primary-color);
      opacity: 0.5;
      align-items: center;
    }

    .gd-input-container {
      position: relative;
      width: 100%;
      height: 5rem;
      background: var(--background-depth-two-color);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;

      textarea.gd-input {
        resize: none;
        position: relative;
        width: 100%;
        height: 100%;
        padding: 0.5rem;
        border: none;
        border-radius: 0.5rem;
        box-sizing: border-box;
        color: var(--font-primary-color);
        background: rgba(0, 0, 0, 0);
        display: flex;
        transition: background-color 0.25s;

        &::placeholder {
          color: var(--font-primary-color);
          opacity: 0.5;
          transition: opacity 0.25s;
        }

        &:hover {
          outline: none;
          background: rgba(0, 0, 0, 0);

          &::placeholder {
            opacity: 1;
          }
        }

        &:focus {
          outline: none;
          background: var(--background-depth-two-color);

          &::placeholder {
            opacity: 1;
          }
        }

        &:focus + .gd-input-border {
          border-color: var(--primary-color);

          &::before {
            opacity: 0.25;
          }
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
          border-radius: calc(0.5rem + 1px);
          border: 3px solid var(--primary-color);
          box-sizing: border-box;
          opacity: 0;
          transition: 0.25s opacity;
        }
      }
    }

    span.gd-input-error {
      position: relative;
      width: 100%;
      height: 1rem;
      display: flex;
      color: var(--error-color);
      align-items: center;

      span.gd-text-wrapper {
        span.gd-text-container {
          transition: 0.25s transform;

          span.gd-text {
            transition: 0.25s transform;
          }
        }
      }
    }

    &.gd-input-error {
      span.gd-input-error {
        span.gd-text-wrapper {
          span.gd-text-container {
            transform: translateY(0);

            span.gd-text {
              transform: translateY(0);
            }
          }
        }
      }
    }

    &.gd-input-disabled {
      pointer-events: none;
      filter: grayscale(0.75);
      opacity: 0.5;
    }
  }
</style>
