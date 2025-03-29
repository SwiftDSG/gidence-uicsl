<template>
  <label
    class="gd-input-component"
    :class="props.input.disabled ? 'gd-input-component-disabled' : ''"
  >
    <input
      type="file"
      class="gd-input"
      :accept="input.type === 'image' ? 'image/*' : '*/*'"
      @change="changeHandler"
    />
    <div
      v-if="!file"
      ref="gdInputLabel"
      class="gd-input-label"
      :class="init ? 'gd-input-label-init' : ''"
    >
      <span class="gd-input-placeholder gd-caption-text">
        Click
        <span class="gd-input-placeholder-highlight gd-headline-6">here</span>
        {{ `to upload ${input?.type === "image" ? "image" : "file"}` }}
      </span>
    </div>
    <div v-else ref="gdInputDetails" class="gd-input-details-container">
      <div class="gd-input-icon-container">
        <gd-svg :name="iconHandler(file.name)" color="primary" />
      </div>
      <div class="gd-input-details">
        <span class="gd-input-value gd-headline-5">{{ file.name }}</span>
        <span class="gd-input-placeholder gd-caption-text">{{
          sizeHandler(file.size)
        }}</span>
      </div>
      <div class="gd-input-remove-button" @click.prevent="removeFile">
        <gd-svg :name="'close'" :color="'secondary'" />
      </div>
    </div>
    <div ref="gdInputLoading" class="gd-input-loading">
      <div class="gd-input-icon-progress-bar">
        <div class="gd-input-icon-progress-bar-outer">
          <div class="gd-input-icon-progress-bar-inner"></div>
        </div>
      </div>
    </div>
  </label>
</template>

<script lang="ts" setup>
  import type { InputFileOption } from "~~/types/general.js";

  import gsap from "gsap";

  interface AnyFile {
    name: string;
    type: string;
    size: number;
    file: File;
  }

  const props = defineProps<{
    input: InputFileOption;
  }>();

  const gdInputLabel = ref<HTMLDivElement | null>(null);
  const gdInputDetails = ref<HTMLDivElement | null>(null);
  const gdInputLoading = ref<HTMLDivElement | null>(null);

  const file = ref<AnyFile | null>(null);
  const init = ref<boolean>(true);

  const animate = {
    initLabel(gdInputLabel: HTMLElement): void {
      const tl: GSAPTimeline = gsap.timeline();

      const gdInputPlaceholder: HTMLElement | null = gdInputLabel.querySelector(
        "span.gd-input-placeholder"
      );

      tl.to(gdInputPlaceholder, {
        scale: 0.875,
        opacity: 0,
        duration: 0,
      }).to(gdInputPlaceholder, {
        scale: 1,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    },
    exitLabel(gdInputLabel: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const gdInputPlaceholder: HTMLElement | null = gdInputLabel.querySelector(
        "span.gd-input-placeholder"
      );

      tl.to(gdInputPlaceholder, {
        scale: 1.125,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      }).to(gdInputPlaceholder, {
        scale: 0.875,
        opacity: 0,
        duration: 0,
      });
    },
    initDetails(gdInputDetails: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      tl.to(gdInputDetails, {
        scale: 0.875,
        opacity: 0,
        duration: 0,
      }).to(gdInputDetails, {
        scale: 1,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    },
    exitDetails(gdInputDetails: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      tl.to(gdInputDetails, {
        scale: 1.125,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      }).to(gdInputDetails, {
        scale: 0.875,
        opacity: 0,
        duration: 0,
      });
    },
    initLoading(gdInputLoading: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const gdInputProgressBar: HTMLElement | null =
        gdInputLoading.querySelector(".gd-input-icon-progress-bar");

      tl.to(gdInputProgressBar, {
        scale: 0.875,
        opacity: 0,
        duration: 0,
      }).to(gdInputProgressBar, {
        scale: 1,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    },
    exitLoading(gdInputLoading: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const gdInputProgressBar: HTMLElement | null =
        gdInputLoading.querySelector(".gd-input-icon-progress-bar");

      tl.to(gdInputProgressBar, {
        scale: 1.125,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      }).to(gdInputProgressBar, {
        scale: 0.875,
        opacity: 0,
        duration: 0,
      });
    },
  };

  function iconHandler(name: string): string {
    const str: string = name.split(".").reverse()[0];
    if (!str) return "file";
    if (str === "svg") return "image";
    if (str === "png") return "image";
    if (str === "jpg") return "image";
    if (str === "jpeg") return "image";
    if (str === "doc" || str === "docs") return "word";
    if (str === "xlx" || str === "xlxs" || str === "csv") return "excel";
    if (str === "pdf") return "pdf";
    return "file";
  }
  function sizeHandler(size: number): string {
    if (size > 1000000) return `${(size / 1000000).toFixed(1)} mb`;
    if (size > 1000) return `${(size / 1000).toFixed(1)} kb`;
    return `${size} b`;
  }

  function removeFile(): void {
    if (gdInputDetails.value) {
      animate.exitDetails(gdInputDetails.value, () => {
        file.value = null;
        setTimeout(() => {
          if (gdInputLabel.value) animate.initLabel(gdInputLabel.value);
        }, 100);
      });
    }
  }

  function changeHandler(e: Event): void {
    e.preventDefault();
    if (e.target instanceof HTMLInputElement) {
      const files = e.target.files;
      if (files) fileHandler(files);
    }
  }
  function fileHandler(files: FileList): void {
    if (gdInputLabel.value) {
      animate.exitLabel(gdInputLabel.value, () => {
        if (gdInputLoading.value) {
          init.value = false;
          file.value = {
            name: files[0].name,
            type: files[0].type,
            size: files[0].size,
            file: files[0],
          };
          props.input.file = files[0];
          animate.initLoading(gdInputLoading.value, () => {
            setTimeout(() => {
              if (gdInputLoading.value) {
                animate.exitLoading(gdInputLoading.value, () => {
                  if (gdInputDetails.value) {
                    animate.initDetails(gdInputDetails.value);
                  }
                });
              }
            }, 500);
          });
        }
      });
    }
  }
</script>

<style lang="scss" scoped>
  label.gd-input-component {
    position: relative;
    width: 100%;
    height: 3.5rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    input.gd-input {
      z-index: -1;
      position: absolute;
      visibility: hidden;
    }
    .gd-input-label {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      span.gd-input-placeholder {
        position: relative;
        opacity: 0;
        transform: scale(0.875);
        .gd-input-placeholder-highlight {
          cursor: pointer;
          position: relative;
          color: var(--primary-color);
        }
      }
      &.gd-input-label-init {
        span.gd-input-placeholder {
          opacity: 1;
          transform: scale(1);
        }
      }
    }
    .gd-input-details-container {
      position: relative;
      width: 100%;
      height: 2rem;
      opacity: 0;
      display: flex;
      align-items: center;
      transform: scale(0.875);
      .gd-input-icon-container {
        position: relative;
        width: 2rem;
        height: 2rem;
        background: var(--background-depth-two-color);
        border-radius: 0.5rem;
        padding: 0 0.5rem;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .gd-input-details {
        position: absolute;
        top: 0;
        left: 2rem;
        width: calc(100% - 2rem);
        height: 100%;
        padding-left: 0.5rem;
        box-sizing: border-box;
        border-radius: 0.5rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
        span.gd-input-value {
          position: relative;
          width: calc(100% - 2rem);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        span.gd-input-placeholder {
          position: relative;
          opacity: 0.5;
          margin-top: 0.125rem;
        }
      }
      .gd-input-remove-button {
        cursor: pointer;
        position: absolute;
        top: 0;
        right: -0.25rem;
        width: 2rem;
        height: 2rem;
        padding: 0 0.5rem;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .gd-input-loading {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .gd-input-icon-progress-bar {
        position: absolute;
        top: calc(50% - 0.375rem);
        left: calc(50% - 0.375rem);
        width: 0.75rem;
        height: 0.75rem;
        opacity: 0;
        animation: gd-rotate 500ms linear infinite;
        transition: 0.25s transform, 0.25s opacity;
        transform: scale(0.875);
        .gd-input-icon-progress-bar-outer {
          position: absolute;
          top: 0;
          left: 0;
          width: 0.375rem;
          height: 0.75rem;
          overflow: hidden;
          .gd-input-icon-progress-bar-inner {
            position: absolute;
            top: 0;
            left: 0;
            width: 0.75rem;
            height: 0.75rem;
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            border-left-color: transparent;
            border-bottom-color: transparent;
            box-sizing: border-box;
            animation: gd-circular-rotate 1000ms cubic-bezier(0.4, 0, 0.22, 1)
              infinite;
          }
        }
      }
    }
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 0.5rem;
      border: var(--border);
      box-sizing: border-box;
      opacity: 0.05;
    }
    &.gd-input-component-disabled {
      pointer-events: none;
      .gd-input-label {
        pointer-events: none;
        filter: grayscale(0.75);
        opacity: 0.5;
      }
    }
  }
</style>
