<template>
  <gd-menu :active="active" label="Readings Adjustment" class="gd-menu">
    <p class="gd-menu-message gd-caption-text">
      Adjust the readings of the sensor by chaining the value into some basic
      mathematical operations.
    </p>
    <div class="gd-menu-test-container">
      <div class="gd-menu-test">
        <div class="gd-menu-test-value-container">
          <span class="gd-menu-test-placeholder gd-caption-text"
            >Initial value</span
          >
          <span
            class="gd-menu-test-value gd-headline-3"
            :class="testError ? 'gd-menu-test-value-error' : ''"
            >{{ testValue }}</span
          >
        </div>
        <gd-input-button-small
          :loading="testLoading"
          @clicked="test"
          icon="rotate"
          type="primary"
          tooltip="Test configuration"
        />
      </div>
    </div>
    <div
      v-for="(adjustment, i) in adjustmentInput"
      :key="i"
      class="gd-menu-adjustment"
    >
      <div class="gd-menu-adjustment-header">
        <gd-input-select
          class="gd-menu-adjustment-input"
          :input="adjustment.kindInput"
        />
        <gd-input-button-small
          icon="close"
          tooltip="Remove adjustment"
          @clicked="removeAdjustment(i)"
        />
      </div>
      <div class="gd-menu-adjustment-body">
        <div class="gd-menu-adjustment-equation">
          <gd-input-text
            class="gd-menu-adjustment-input"
            :input="{
              name: 'placeholder',
              disabled: true,
              placeholder: '0',
              alignment: 'center',
              model: {
                name: values[i][0].toString(),
                value: values[i][0],
              },
            }"
          />
          <span class="gd-menu-adjustment-value gd-headline-4">{{
            adjustmentSymbols[adjustment.kindInput.model.value]
          }}</span>
          <gd-input-text
            class="gd-menu-adjustment-input"
            :input="adjustment.valueInput"
          />
        </div>
        <span class="gd-menu-adjustment-value gd-headline-3">{{
          values[i][1].toFixed(1)
        }}</span>
      </div>
    </div>
    <div class="gd-menu-input-wrapper">
      <gd-input-button
        @clicked="addAdjustment"
        label="Add adjustment"
        type="background"
        style="width: 100%; margin-bottom: 1rem"
        :disabled="init"
      />
    </div>
    <div class="gd-menu-padding"></div>
    <div class="gd-menu-footer">
      <gd-input-button
        @clicked="submit"
        :loading="submitLoading"
        :disabled="init"
        style="width: 100%"
        label="Update adjustment"
      />
    </div>
  </gd-menu>
</template>

<script lang="ts" setup>
  import type { InputOption, InputSelectOption } from "~/types/general";
  import type { Port } from "~/types/port";
  import type { Sensor } from "~/types/sensor";

  type AdjustmentKind = "add" | "subtract" | "multiply" | "divide";

  const emits = defineEmits(["exit", "shake"]);
  const props = defineProps<{
    active: boolean;
    port: Port;
    sensor: Sensor;
  }>();
  const { $fetch } = useNuxtApp();
  const { updateSensor, readSensor } = useSensor();

  const adjustmentNames = {
    add: "Add (+)",
    subtract: "Subtract (-)",
    multiply: "Multiply (×)",
    divide: "Divide (/)",
  };
  const adjustmentSymbols = {
    add: "+",
    subtract: "-",
    multiply: "×",
    divide: "/",
  };

  const submitLoading = ref<boolean>(false);
  const testLoading = ref<boolean>(false);
  const testValue = ref<string>("N/A");
  const testError = ref<boolean>(false);
  const initialValue = ref<number>(0);
  const init = ref<boolean>(true);
  const key = ref<number>(0);

  const adjustmentInput = ref<
    {
      kindInput: InputSelectOption<AdjustmentKind>;
      valueInput: InputOption;
    }[]
  >([]);

  const adjustment = computed<Sensor["adjustment"]>(() => {
    return adjustmentInput.value.map((a) => {
      switch (a.kindInput.model.value) {
        case "add":
          return {
            add: parseFloat(a.valueInput.model.value),
          };
        case "subtract":
          return {
            subtract: parseFloat(a.valueInput.model.value),
          };
        case "multiply":
          return {
            multiply: parseFloat(a.valueInput.model.value),
          };
        case "divide":
          return {
            divide: parseFloat(a.valueInput.model.value),
          };
      }
    });
  });
  const values = computed<[number, number][]>(() => {
    return adjustment.value.reduce<[number, number][]>((a, b) => {
      let first, last;
      if (a.length === 0) {
        first = initialValue.value;
        last = initialValue.value;
      } else {
        first = a[a.length - 1][1];
        last = a[a.length - 1][1];
      }

      if (b.add) last += b.add;
      else if (b.subtract) last -= b.subtract;
      else if (b.multiply) last *= b.multiply;
      else if (b.divide) last /= b.divide;

      a.push([first, last]);
      return a;
    }, []);
  });

  function removeAdjustment(i: number): void {
    adjustmentInput.value.splice(i, 1);
  }
  function addAdjustment(): void {
    adjustmentInput.value.push({
      kindInput: {
        name: "adjustment-kind",
        placeholder: "Adjustment type",
        strict: true,
        model: {
          name: "Add (+)",
          value: "add",
        },
        options: [
          {
            name: "Add (+)",
            value: "add",
          },
          {
            name: "Subtract (-)",
            value: "subtract",
          },
          {
            name: "Multiply (×)",
            value: "multiply",
          },
          {
            name: "Divide (/)",
            value: "divide",
          },
        ],
      },
      valueInput: {
        name: `adjustment-${key.value++}`,
        placeholder: "Val",
        model: {
          name: "0",
          value: 0,
        },
        alignment: "center",
      },
    });
  }

  async function test(): Promise<void> {
    try {
      testLoading.value = true;

      const response = await readSensor(props.sensor);

      setTimeout(async () => {
        testLoading.value = false;
        if (response === null) {
          testValue.value = "Invalid task";
          throw new Error("");
        }

        testError.value = false;
        testValue.value = response;
        initialValue.value = parseFloat(response);
      }, 500);
    } catch (e) {
      testError.value = true;
    }
  }
  async function submit(): Promise<void> {
    submitLoading.value = true;
    props.sensor.adjustment = adjustment.value;

    const result = await updateSensor(props.sensor);
    setTimeout(() => {
      submitLoading.value = false;
      if (result) {
        emits("exit");
      } else {
        emits("shake");
      }
    }, 1000);
  }

  watch(
    () => initialValue.value,
    (val) => {
      if (!isNaN(val) && init.value) {
        for (let i = 0; i < props.sensor.adjustment.length; i++) {
          const adjustment = props.sensor.adjustment[i];
          const kind = Object.keys(adjustment)[0] as AdjustmentKind;
          adjustmentInput.value.push({
            kindInput: {
              name: "adjustment-kind",
              placeholder: "Adjustment type",
              strict: true,
              model: {
                name: adjustmentNames[kind],
                value: kind,
              },
              options: [
                {
                  name: "Add (+)",
                  value: "add",
                },
                {
                  name: "Subtract (-)",
                  value: "subtract",
                },
                {
                  name: "Multiply (×)",
                  value: "multiply",
                },
                {
                  name: "Divide (/)",
                  value: "divide",
                },
              ],
            },
            valueInput: {
              name: `adjustment-${key.value++}`,
              placeholder: "Val",
              model: {
                name: (adjustment[kind] || 0).toString(),
                value: adjustment[kind] || 0,
              },
              alignment: "center",
            },
          });
        }
        init.value = false;
      }
    }
  );

  onMounted(async () => {
    await test();
  });
</script>

<style lang="scss" scoped>
  .gd-menu {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    * {
      flex-shrink: 0;
    }

    .gd-menu-message {
      position: relative;
      margin-bottom: 0.75rem;
    }

    .gd-menu-test-container {
      position: relative;
      width: 100%;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;

      .gd-menu-test {
        position: relative;
        width: 100%;
        background: var(--background-depth-one-color);
        padding: 0.75rem;
        border: var(--border);
        border-radius: 0.75rem;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .gd-menu-test-value-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.125rem;

          .gd-menu-test-value {
            line-height: 1;
          }
        }
      }
    }

    .gd-menu-adjustment {
      position: relative;
      width: 100%;
      padding: 0.75rem;
      border: var(--border);
      border-radius: 0.75rem;
      background: var(--background-depth-one-color);
      box-sizing: border-box;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .gd-menu-adjustment-header {
        position: relative;
        width: 100%;
        height: 2rem;
        display: flex;
        justify-content: space-between;

        .gd-menu-adjustment-input {
          position: relative;
          width: 7.5rem;
        }
      }

      .gd-menu-adjustment-body {
        position: relative;
        width: 100%;
        height: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .gd-menu-adjustment-equation {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .gd-menu-adjustment-input {
            position: relative;
            width: 3rem;
          }
        }
      }
    }

    .gd-menu-input-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      gap: 0 0.5rem;
      flex-wrap: wrap;
      align-items: flex-end;

      .gd-menu-input {
        position: relative;
        width: 100%;
      }

      .gd-menu-input-error {
        position: relative;
        width: 100%;
        height: 1rem;
        flex-shrink: 0;
      }
    }

    .gd-menu-padding {
      position: relative;
      width: 100%;
      height: 4rem;
    }

    .gd-menu-footer {
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4rem;
      padding: 1rem;
      border-top: var(--border);
      box-sizing: border-box;
      background: var(--background-depth-two-color);
    }
  }
</style>
