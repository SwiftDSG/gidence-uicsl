<template>
  <div
    class="gd-component-svg"
    ref="gdComponent"
    :class="color ? `gd-color-${color}` : ''"
  ></div>
</template>

<script lang="ts" setup>
  const config = useRuntimeConfig();
  const props = defineProps<{
    name: string;
    color?: string;
  }>();

  const gdComponent = ref<HTMLDivElement | null>(null);

  const gdElementText = ref<string>("");

  onBeforeMount(async () => {
    await loadElementText();
  });

  async function loadElementText(): Promise<boolean> {
    try {
      const data: Response = await fetch(
        `${config.public.base}/icons/${props.name}.svg`
      );
      gdElementText.value = await data.text();
      return true;
    } catch {
      return false;
    }
  }

  watch(
    () => gdElementText.value,
    (val) => {
      if (gdComponent.value) gdComponent.value.innerHTML = val;
    }
  );

  watch(
    () => props.name,
    () => {
      loadElementText();
    }
  );
</script>

<style lang="scss">
  .gd-component-svg {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.25s transform;
    svg {
      position: relative;
      width: 100%;
      height: 100%;
      &.gd-svg-filled {
        .gd-svg-filled-main {
          fill: var(--font-primary-color);
        }
        .gd-svg-filled-secondary {
          fill: var(--font-secondary-color);
        }
      }
      &.gd-svg-outlined {
        .gd-svg-outlined-main {
          stroke: var(--font-primary-color);
        }
        .gd-svg-outlined-secondary {
          stroke: var(--font-secondary-color);
        }
      }
    }
    &.gd-color-secondary {
      svg {
        &.gd-svg-filled {
          .gd-svg-filled-main {
            fill: var(--font-secondary-color);
          }
          .gd-svg-filled-secondary {
            fill: var(--font-primary-color);
          }
        }
        &.gd-svg-outlined {
          .gd-svg-outlined-main {
            stroke: var(--font-secondary-color);
          }
          .gd-svg-outlined-secondary {
            stroke: var(--font-primary-color);
          }
        }
      }
    }
    &.gd-color-primary {
      svg {
        &.gd-svg-filled {
          .gd-svg-filled-main {
            fill: var(--primary-color);
          }
          .gd-svg-filled-secondary {
            fill: var(--secondary-color);
          }
        }
        &.gd-svg-outlined {
          .gd-svg-outlined-main {
            stroke: var(--primary-color);
          }
          .gd-svg-outlined-secondary {
            stroke: var(--secondary-color);
          }
        }
      }
    }
    &.gd-color-error {
      svg {
        &.gd-svg-filled {
          .gd-svg-filled-main {
            fill: var(--error-color);
          }
          .gd-svg-filled-secondary {
            fill: var(--secondary-color);
          }
        }
        &.gd-svg-outlined {
          .gd-svg-outlined-main {
            stroke: var(--error-color);
          }
          .gd-svg-outlined-secondary {
            stroke: var(--secondary-color);
          }
        }
      }
    }
    &.gd-color-success {
      svg {
        &.gd-svg-filled {
          .gd-svg-filled-main {
            fill: var(--success-color);
          }
          .gd-svg-filled-secondary {
            fill: var(--secondary-color);
          }
        }
        &.gd-svg-outlined {
          .gd-svg-outlined-main {
            stroke: var(--success-color);
          }
          .gd-svg-outlined-secondary {
            stroke: var(--secondary-color);
          }
        }
      }
    }
  }
</style>
