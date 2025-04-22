<template>
  <div
    ref="gdInputComponent"
    class="gd-input-component"
    :class="`${input.error ? 'gd-input-error' : ''} ${
      input.disabled || (input.strict && !input.options?.length)
        ? 'gd-input-disabled'
        : ''
    }`"
    @focusout="focusHandler"
  >
    <label
      v-if="input.label"
      :for="id"
      class="gd-input-label gd-caption-text"
      >{{ input.label }}</label
    >
    <div class="gd-input-container">
      <div v-if="input.icon" class="gd-input-icon-container">
        <gd-svg :name="input.icon" />
      </div>
      <client-only>
        <input
          class="gd-input gd-body-text"
          ref="gdInput"
          type="text"
          :placeholder="input.placeholder"
          :name="input.name"
          :id="id"
          :disabled="input.disabled || (input.strict && !input.options?.length)"
          autocomplete="off"
          @focus="dropDownHandler('open')"
          @input="updateModel"
          :readonly="view === 'mobile'"
        />
      </client-only>
      <div class="gd-input-border"></div>
      <div
        class="gd-input-chevron-container"
        :style="dropDownState === 'opened' ? 'rotate: 180deg' : ''"
      >
        <gd-svg name="chevron-down" />
      </div>
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
    <client-only>
      <gd-popover
        class="gd-input-options"
        :state="dropDownState"
        :limit="9"
        @exit="removeFocus"
      >
        <span v-if="!inputOptions.length" class="gd-input-empty gd-caption-text"
          >Option unavailable</span
        >
        <div
          class="gd-input-option"
          v-for="(option, i) in inputOptions"
          :key="option.value"
          :data-index="i"
          :data-id="id"
          ref="gdInputOption"
          @mousedown="selectOption(i)"
          @mouseenter="dropDownIndex = i"
          :class="`${
            input.model.value === option.value ? 'gd-input-option-selected' : ''
          } ${dropDownIndex === i ? 'gd-input-option-hovered' : ''}`"
          :aria-selected="input.model.value === option.value"
        >
          <span class="gd-input-option-text gd-body-text">
            {{ option.name }}
          </span>
        </div>
      </gd-popover>
    </client-only>
  </div>
</template>

<script lang="ts" setup>
  import type { InputSelectOption } from "~~/types/general.js";

  const props = defineProps<{
    input: InputSelectOption;
  }>();
  const emits = defineEmits(["focusout"]);
  const { view } = useMain();

  const gdInputComponent = ref<HTMLDivElement | null>(null);
  const gdInput = ref<HTMLInputElement | null>(null);
  const gdInputOption = ref<HTMLDivElement[] | null>(null);

  const inputError = ref<string | undefined>(props.input.error);
  const inputModel = ref<InputSelectOption["model"]>({
    name: "",
    value: "",
  });
  const inputOptions = ref<InputSelectOption["options"]>(props.input.options);

  const dropDownState = ref<"opened" | "closed">("closed");
  const dropDownIndex = ref<number>(-1);
  const id = ref<string>("");

  function generateRandomString(): string {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let str = "";
    for (let i = 0; i < 10; i++) {
      str += characters[Math.round(Math.random() * (characters.length - 1))];
    }

    return `gd-input-${str}`;
  }

  function focusHandler(e: FocusEvent) {
    if (
      !e.relatedTarget ||
      (e.relatedTarget instanceof HTMLElement &&
        !gdInputComponent.value?.contains(e.relatedTarget))
    ) {
      dropDownHandler("close", true);
      emits("focusout", props.input);
    } else if (e.relatedTarget instanceof HTMLElement) {
      const index = e.relatedTarget.dataset.index;
      if (index) dropDownIndex.value = parseInt(index);
    }
  }
  function keyHandler(e: KeyboardEvent) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      selectIndex(
        dropDownIndex.value <= 0
          ? inputOptions.value.length - 1
          : dropDownIndex.value - 1
      );
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      selectIndex(
        dropDownIndex.value >= inputOptions.value.length - 1
          ? 0
          : dropDownIndex.value + 1
      );
    } else if (e.key === "Enter") {
      selectOption(dropDownIndex.value);
    } else if (e.key === "Escape") {
      removeFocus();
    } else if (e.key !== "Tab" && gdInput.value) {
      gdInput.value.focus();
    }
  }
  function removeFocus() {
    dropDownState.value = "closed";
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
  function dropDownHandler(state: "open" | "close", validate?: boolean) {
    if (state === "open") {
      dropDownState.value = "opened";
      dropDownIndex.value =
        inputOptions.value?.findIndex(
          (a) => a.value === props.input.model.value
        ) || 0;
      if (view.value === "desktop") {
        window.addEventListener("keydown", keyHandler);
      }
    } else if (gdInput.value) {
      window.removeEventListener("keydown", keyHandler);

      dropDownIndex.value = -1;
      dropDownState.value = "closed";

      if (validate) {
        if (inputModel.value.name) {
          if (
            !props.input.options.find((a) => a.value === inputModel.value.value)
          ) {
            const selection = props.input.options.find((a) =>
              a.name
                .replace(/[^A-Za-z0-9]/g, "")
                .toLowerCase()
                .includes(
                  inputModel.value.name
                    .replace(/[^A-Za-z0-9]/g, "")
                    .toLowerCase()
                )
            );
            if (selection) {
              gdInput.value.value = selection.name;
              inputModel.value = {
                name: selection.name,
                value: selection.value,
              };
              props.input.model = selection;
            } else if (props.input.strict) {
              gdInput.value.value = "";
              inputModel.value = {
                name: "",
                value: "",
              };
              props.input.model = {
                name: "",
                value: "",
              };
              setTimeout(() => {
                filterOptions("");
              }, 250);
            }
          } else if (props.input.model) {
            gdInput.value.value = props.input.model.name;
          }
        } else {
          gdInput.value.value = "";
          inputModel.value = {
            name: "",
            value: "",
          };
          props.input.model = {
            name: "",
            value: "",
          };
          setTimeout(() => {
            filterOptions("");
          }, 250);
        }
      }
    }
  }
  function updateModel(e: Event) {
    if (e.target instanceof HTMLInputElement) {
      inputModel.value.name = e.target.value;
      if (!props.input.strict) {
        props.input.model = {
          name: inputModel.value.name,
          value: inputModel.value.name,
        };
      }
      filterOptions(e.target.value);
      if (dropDownState.value !== "opened") dropDownHandler("open");
    }
  }
  function filterOptions(str: string) {
    if (view.value === "desktop") {
      if (str.length) {
        inputOptions.value = props.input.options
          .filter((a) =>
            a.name
              .replace(/[^A-Za-z0-9]/g, "")
              .toLowerCase()
              .includes(str.replace(/[^A-Za-z0-9]/g, "").toLowerCase())
          )
          .sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          );
      } else {
        inputOptions.value = props.input.options.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
      }
      dropDownIndex.value = 0;
    }
  }
  function selectIndex(index: number) {
    const gdInputOption = document.querySelector(
      `[data-id="${id.value}"][data-index="${index}"]`
    );
    if (gdInputOption instanceof HTMLElement) {
      dropDownIndex.value = index;
      gdInputOption.focus();
    }
  }
  function selectOption(index: number) {
    if (inputOptions.value) {
      const selection = inputOptions.value[index];
      if (selection && gdInput.value) {
        inputModel.value = {
          name: selection.name,
          value: selection.value,
        };
        props.input.model = inputModel.value;
        gdInput.value.value = inputModel.value.name;
        gdInput.value.focus();
        setTimeout(() => {
          filterOptions(inputModel.value.name);
        }, 250);
      }
      dropDownHandler("close");
    }
  }

  watch(
    () => props.input.error,
    (val) => {
      if (val) inputError.value = val;
    }
  );
  watch(
    () => props.input.options,
    (val) => {
      inputOptions.value = (
        JSON.parse(JSON.stringify(val)) as InputSelectOption["options"]
      ).sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));
    },
    {
      deep: true,
      immediate: true,
    }
  );
  watch(
    () => props.input.model,
    (val) => {
      if (val.name) {
        const selection = props.input.options.find(
          (a) => a.name === val.name || a.value === val.value
        );
        if (selection && gdInput.value) {
          gdInput.value.value = selection.name;
          inputModel.value = {
            name: selection.name,
            value: selection.value,
          };
        }
      } else if (gdInput.value) {
        dropDownIndex.value = -1;
        inputModel.value = {
          name: "",
          value: "",
        };
        gdInput.value.value = "";
        filterOptions("");
      }
    },
    { deep: true }
  );
  watch(
    () => gdInput.value,
    () => {
      if (gdInput.value) {
        if (props.input.model.name) {
          inputModel.value.name = props.input.model.name;
          gdInput.value.value = inputModel.value.name;
        }
        if (props.input.model.value) {
          inputModel.value.value = props.input.model.value;
        }
      }
    },
    { once: true }
  );

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", keyHandler);
  });
  onMounted(() => {
    id.value = generateRandomString();
  });
</script>

<style lang="scss" scoped>
  .gd-input-component {
    cursor: pointer;
    position: relative;
    width: 100%;
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
      height: 2rem;
      background: var(--background-depth-two-color);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;

      .gd-input-icon-container {
        pointer-events: none;
        z-index: 2;
        position: absolute;
        width: 2rem;
        height: 2rem;
        padding: 0 0.5rem;
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;

        ~ input.gd-input {
          padding: 0 2rem;
        }
      }

      input.gd-input {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 0 2rem 0 0.5rem;
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

      .gd-input-chevron-container {
        pointer-events: none;
        position: absolute;
        right: 0;
        width: 2rem;
        height: 2rem;
        padding: 0 0.5rem;
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.25s rotate;
      }
    }

    span.gd-input-error {
      position: relative;
      width: 100%;
      height: 1rem;
      display: flex;
      color: var(--error-color);
      align-items: center;

      * {
        pointer-events: none;
      }

      span.gd-text-wrapper {
        span.gd-text-container {
          transition: 0.25s transform;

          span.gd-text {
            transition: 0.25s transform;
          }
        }
      }

      & ~ .gd-input-options {
        top: calc(100% + 2px - 1rem);
      }
    }

    .gd-input-options {
      top: calc(100% + 2px);
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

    &:focus-within {
      .gd-input-container {
        input.gd-input {
          outline: none;
          background: var(--background-depth-two-color);

          & + .gd-input-border {
            border-color: var(--primary-color);

            &::before {
              opacity: 0.25;
            }
          }
        }
      }
    }
  }
</style>

<style lang="scss">
  span.gd-input-empty {
    pointer-events: none;
    position: relative;
    width: 100%;
    height: 2rem;
    color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .gd-input-option {
    cursor: pointer;
    position: relative;
    width: 100%;
    height: 2rem;
    padding: 0 0.75rem;
    border-radius: 0.25rem;
    box-sizing: border-box;
    display: flex;
    flex-shrink: 0;
    align-items: center;

    * {
      pointer-events: none;
    }

    span.gd-input-option-text {
      position: relative;
      width: 100%;
      color: #f0f0f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &::before {
      content: "";
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 0.25rem;
      background: #000;
      opacity: 0;
      transition: background-color 0.25s, opacity 0.25s;
    }

    &.gd-input-option-hovered {
      outline: none;

      &::before {
        background: #000;
        opacity: 0.05;
      }
    }

    &.gd-input-option-selected {
      span.gd-input-option-text {
        color: var(--primary-color);
      }

      &::before {
        background: var(--primary-color);
        opacity: 0.05;
      }
    }
  }
</style>
