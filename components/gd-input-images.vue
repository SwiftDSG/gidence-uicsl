<template>
  <div class="gd-input-component">
    <label class="gd-input-label gd-headline-6">
      <span class="gd-input-label-text">{{ props.input.label }}</span>
      <span class="gd-input-label-limit">{{
        `${inputFiles.length} / ${props.input.limit}`
      }}</span>
    </label>
    <input
      type="file"
      id="gd-input"
      class="gd-input"
      @change="changeHandler"
      accept="image/*"
      multiple
    />
    <label
      ref="gdInputArea"
      for="gd-input"
      class="gd-input-area"
      @dragenter="dragEnterHandler"
      @dragover="dragEnterHandler"
      @dragleave="dragLeaveHandler"
      @drop="dropHandler"
      :class="`${inputDragging ? 'gd-input-area-dragging' : ''} ${
        inputLoading ? 'gd-input-area-loading' : ''
      }`"
    >
      <div class="gd-input-icon-wrapper">
        <div class="gd-input-icon-container">
          <gd-svg name="upload" color="primary" />
        </div>
        <div class="gd-input-icon-progress-bar">
          <div class="gd-input-icon-progress-bar-outer">
            <div class="gd-input-icon-progress-bar-inner"></div>
          </div>
        </div>
      </div>
      <span class="gd-input-text gd-caption-text"
        >Drop images here or
        <span class="gd-input-text-highlight gd-headline-6">select files</span>
      </span>
      <div class="gd-input-border"></div>
    </label>
    <div class="gd-images-wrapper" ref="gdImagesWrapper">
      <div
        v-for="(image, i) in inputFiles"
        :key="image.name"
        ref="gdImage"
        class="gd-image-container"
        :data-index="i"
        :data-ready="false"
      >
        <img
          class="gd-image"
          :src="
            typeof image.image_url === 'string' &&
            image.image_url.includes('/products/')
              ? `${config.public.apiBase}/files${image.image_url}`
              : image.image_url.toString()
          "
        />
        <div class="gd-image-overlay">
          <div class="gd-image-icon-wrapper" @click="removeImage(i)">
            <div class="gd-image-icon-container">
              <gd-svg name="delete" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { InputImageOption } from "~~/types/general.js";

  import gsap from "gsap";

  interface ImageFile {
    name: string;
    type: string;
    size: number;
    image_url: string | ArrayBuffer;
    file: string | File;
  }

  const config = useRuntimeConfig();
  const { setAlert } = useAlert();
  const props = defineProps<{
    input: InputImageOption;
  }>();

  const gdInputArea = ref<HTMLLabelElement | null>(null);
  const gdImagesWrapper = ref<HTMLDivElement | null>(null);
  const gdImage = ref<HTMLDivElement[] | null>(null);

  const inputDragging = ref<boolean>(false);
  const inputLoading = ref<boolean>(false);
  const inputFiles = ref<ImageFile[]>([]);

  const file: ComputedRef<(string | File)[]> = computed((): (string | File)[] =>
    inputFiles.value.map((a) => a.file)
  );

  const animate = {
    initImages(gdInputArea: HTMLElement, gdImagesWrapper: HTMLElement): void {
      const tl = gsap.timeline({
        onComplete() {
          gdImage.forEach((gdElement: HTMLElement) => {
            gdElement.setAttribute("data-ready", "true");
          });
        },
      });

      const gdImage: HTMLElement[] = gsap.utils.toArray(
        gdImagesWrapper.querySelectorAll(".gd-image-container")
      );

      tl.to(gdInputArea, {
        height: "9rem",
        duration: 0.5,
        ease: "power2.out",
      }).to(gdImage, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power4.out",
        stagger: 0.05,
      });
    },
    exitImages(gdInputArea: HTMLElement): void {
      const tl = gsap.timeline();

      tl.to(gdInputArea, {
        height: "13rem",
        duration: 0.5,
        ease: "power2.inOut",
      });
    },
    showImages(gdImagesWrapper: HTMLElement): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          gdImage.forEach((gdElement: HTMLElement) => {
            gdElement.setAttribute("data-ready", "true");
          });
        },
      });

      const gdImage: HTMLElement[] = gsap.utils.toArray(
        gdImagesWrapper.querySelectorAll(
          '.gd-image-container[data-ready="false"]'
        )
      );

      tl.to(gdImage, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power4.out",
        stagger: 0.05,
      });
    },
    removeImage(gdImage: HTMLElement[], index: number, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const rdTargetImage: HTMLElement = gdImage[index];
      const rdShiftImage: HTMLElement[] = rdTargetImage.parentElement
        ? gsap.utils.toArray(
            rdTargetImage.parentElement.querySelectorAll(
              `.gd-image-container[data-index="${index}"] ~ .gd-image-container`
            )
          )
        : [];

      tl.to(rdTargetImage, {
        scale: 0.875,
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      });

      if (rdShiftImage.length) {
        tl.to(rdShiftImage, {
          x: "-=6rem",
          duration: 0.25,
          ease: "power2.out",
          onComplete() {
            gsap.to(rdShiftImage, {
              x: 0,
              duration: 0,
            });
          },
        });
      }
    },
  };

  function dragEnterHandler(e: DragEvent): void {
    e.preventDefault();
    inputDragging.value = true;
  }
  function dragLeaveHandler(e: DragEvent): void {
    e.preventDefault();
    inputDragging.value = false;
  }
  function dropHandler(e: DragEvent): void {
    e.preventDefault();
    inputDragging.value = false;
    if (e.dataTransfer) fileHandler(e.dataTransfer.files);
  }
  function changeHandler(e: Event): void {
    e.preventDefault();
    if (e.target instanceof HTMLInputElement) {
      const files = e.target.files;
      if (files) fileHandler(files);
    }
  }
  async function fileHandler(files: FileList): Promise<void> {
    if (
      files.length > props.input.limit ||
      inputFiles.value.length + files.length > props.input.limit
    ) {
      setAlert({
        type: "warning",
        title: "Exceeded file limit",
        message: `You have exceeded a limit of ${props.input.limit} files`,
      });
    } else {
      const showFiles: boolean = inputFiles.value.length === 0;
      inputLoading.value = true;
      for (let i: number = 0; i < files.length; i++) {
        const file: File = files[i];
        const result: string | ArrayBuffer = await toBase64(file);
        inputFiles.value.push({
          name: file.name,
          type: file.type,
          size: file.size,
          image_url: result,
          file,
        });
        if (i === files.length - 1) {
          setTimeout(() => {
            if (showFiles) inputHandler("show");
            else if (gdImagesWrapper.value)
              animate.showImages(gdImagesWrapper.value);
            inputLoading.value = false;
          }, 1000);
        }
      }
    }
  }

  function toBase64(file: File): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => (reader.result ? resolve(reader.result) : null);
      reader.onerror = (e: ProgressEvent<FileReader>) => reject(e);
    });
  }

  function inputHandler(state: "show" | "hide"): void {
    if (gdInputArea.value) {
      if (state === "show" && gdImagesWrapper.value) {
        animate.initImages(gdInputArea.value, gdImagesWrapper.value);
      } else {
        animate.exitImages(gdInputArea.value);
      }
    }
  }

  function removeImage(index: number): void {
    if (gdImage.value) {
      animate.removeImage(gdImage.value, index, () => {
        inputFiles.value.splice(index, 1);
        if (!inputFiles.value.length) inputHandler("hide");
      });
    }
  }
  function generateId(): string {
    let str = "";
    for (var i: number = 0; i < 10; i++) {
      str += "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[
        Math.round(Math.random() * 25)
      ];
    }
    return str;
  }

  watch(
    () => file.value,
    async (val) => {
      const files: File[] = [];
      for (const file of val) {
        if (typeof file === "string") {
          const response = await fetch(file);
          const blob: Blob = await response.blob();
          files.push(
            new File([blob], generateId(), {
              type: file.match(/^data:(.+);base64/)?.[1],
            })
          );
        } else {
          files.push(file);
        }
      }
      props.input.file = files;
    }
  );

  onMounted(() => {
    setTimeout(() => {
      if (props.input.file?.length) {
        inputFiles.value = props.input.file.map((a): ImageFile => {
          return {
            name: a.toString(),
            type: "",
            size: 0,
            image_url: a.toString(),
            file: a,
          };
        });
        setTimeout(() => {
          inputHandler("show");
        }, 250);
      }
    }, 250);
  });
</script>

<style lang="scss" scoped>
  .gd-input-component {
    position: relative;
    width: 100%;
    height: 14rem;
    display: flex;
    flex-direction: column;
    input.gd-input {
      z-index: -1;
      position: absolute;
      opacity: 0;
      visibility: hidden;
    }
    label.gd-input-label {
      position: relative;
      width: 100%;
      height: 1rem;
      padding: 0 2rem;
      box-sizing: border-box;
      color: var(--font-primary-color);
      opacity: 0.5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    label.gd-input-area {
      position: relative;
      width: calc(100% - 4rem);
      height: 13rem;
      margin: 0 2rem;
      background: var(--background-depth-one-color);
      border-radius: 0.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .gd-input-icon-wrapper {
        pointer-events: none;
        position: relative;
        width: 2rem;
        height: 2rem;
        margin-bottom: 0.75rem;
        border-radius: 0.5rem;
        background: rgba(0, 0, 0, 0.1);
        padding: 0 0.5rem;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 0.25s transform, 0.25s width, 0.25s height;
        .gd-input-icon-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: 0.25s transform, 0.25s opacity;
        }
        .gd-input-icon-progress-bar {
          position: absolute;
          top: calc(50% - 0.375rem);
          left: calc(50% - 0.375rem);
          width: 0.75rem;
          height: 0.75rem;
          opacity: 0;
          animation: gd-rotate 500ms linear infinite;
          transition: 0.25s transform, 0.25s opacity;
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
      }
      span.gd-input-text {
        position: relative;
        width: 75%;
        height: 0.75rem;
        text-align: center;
        opacity: 0.5;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        transition: 0.25s transform, 0.25s opacity;
        span.gd-input-text-highlight {
          cursor: pointer;
          position: relative;
          margin: 0 1%;
          color: var(--primary-color);
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
          border-radius: 0.5rem;
          border: 3px solid var(--primary-color);
          box-sizing: border-box;
          opacity: 0;
          transition: 0.25s opacity;
        }
      }
      &.gd-input-area-dragging {
        .gd-input-icon-wrapper {
          width: 3rem;
          height: 3rem;
          transform: translateY(0.75rem);
        }
        span.gd-input-text {
          pointer-events: none;
          opacity: 0;
          transform: scale(1.125);
        }
        .gd-input-border {
          border-color: var(--primary-color);
          &::before {
            opacity: 0.25;
          }
        }
      }
      &.gd-input-area-loading {
        .gd-input-icon-wrapper {
          width: 3rem;
          height: 3rem;
          transform: translateY(0.75rem);
          .gd-input-icon-container {
            transform: scale(0.875);
            opacity: 0;
          }
          .gd-input-icon-progress-bar {
            transform: scale(1);
            opacity: 1;
          }
        }
        span.gd-input-text {
          pointer-events: none;
          opacity: 0 !important;
          transform: scale(1.125);
        }
        .gd-input-border {
          border-color: var(--primary-color);
          &::before {
            opacity: 0.25;
          }
        }
      }
      &:hover {
        span.gd-input-text {
          opacity: 1;
        }
      }
    }
    .gd-images-wrapper {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3rem;
      padding-left: 2rem;
      box-sizing: border-box;
      overflow-x: auto;
      display: flex;
      .gd-image-container {
        position: relative;
        width: 5rem;
        height: 3rem;
        border-radius: 0.5rem;
        margin-right: 1rem;
        overflow: hidden;
        opacity: 0;
        display: flex;
        flex-shrink: 0;
        justify-content: center;
        align-items: center;
        transform: scale(0.875);
        img.gd-image {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
          object-fit: cover;
        }
        .gd-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
          backdrop-filter: blur(5px);
          background: rgba(0, 0, 0, 0.05);
          opacity: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: 0.25s opacity;
          .gd-image-icon-wrapper {
            cursor: pointer;
            position: relative;
            width: 1.5rem;
            height: 1.5rem;
            padding: 0 0.25rem;
            border-radius: 0.5rem;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.125);
            opacity: 0.5;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: 0.25s transform, 0.25s opacity;
            .gd-image-icon-container {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            &:hover {
              transform: scale(1.125);
              opacity: 1;
            }
          }
        }
        &::after {
          pointer-events: none;
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
          background: rgba(0, 0, 0, 0.05);
        }
        &:hover {
          .gd-image-overlay {
            opacity: 1;
          }
        }
      }
      &::after {
        content: "";
        position: relative;
        width: 2rem;
        flex-shrink: 0;
        margin-left: -1rem;
      }
      &::-webkit-scrollbar {
        display: none;
      }
    }
    [gd-view="mobile"] {
      label.gd-input-label {
        padding: 0 1rem;
      }
      label.gd-input-area {
        width: calc(100% - 2rem);
        margin: 0 1rem;
      }
      .gd-images-wrapper {
        padding-left: 1rem;
        .gd-image-container {
          &:last-child {
            margin-right: 1rem;
          }
        }
        &::after {
          width: 1rem;
          margin-left: -1rem;
        }
      }
    }
  }
</style>
