<template>
  <div class="gd-input-component">
    <label class="gd-input-label gd-caption-text">
      <span class="gd-input-label-text">{{ props.input.label }}</span>
    </label>
    <input
      type="file"
      :id="id"
      class="gd-input"
      @change="changeHandler"
      accept="image/*"
    />
    <label
      ref="gdInputArea"
      class="gd-input-area"
      :class="inputLoading ? 'gd-input-area-loading' : ''"
    >
      <div v-if="inputFile" class="gd-input-image-container">
        <img :src="inputFile.image_url.toString()" class="gd-input-image" />
        <div class="gd-input-image-overlay">
          <div
            class="gd-input-image-icon-wrapper"
            @click="inputHandler('hide')"
          >
            <div class="gd-input-image-icon-container">
              <gd-svg name="delete" />
            </div>
          </div>
        </div>
      </div>
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
      <span class="gd-input-text gd-caption-text">
        click
        <label class="gd-input-text-highlight gd-headline-6" :for="id"
          >here</label
        >
        to select image
      </span>
      <div class="gd-input-border"></div>
    </label>
  </div>
</template>

<script lang="ts" setup>
  import type { InputFileOption } from "~~/types/general.js";

  import gsap from "gsap";

  interface ImageFile {
    name: string;
    type: string;
    size: number;
    image_url: string | ArrayBuffer;
    file?: File;
  }

  const props = defineProps<{
    input: InputFileOption;
  }>();

  const gdInputArea = ref<HTMLLabelElement | null>(null);
  const inputLoading = ref<boolean>(false);
  const inputFile = ref<ImageFile | null>(null);

  const file = computed<File | undefined>(() => inputFile.value?.file);
  const id = computed<string>(() => `gd-input-${generateId()}`);

  const types: { [k: string]: string } = {
    "text/html": "html",
    "text/css": "css",
    "text/xml": "xml",
    "image/gif": "gif",
    "image/jpeg": "jpeg",
    "application/x-javascript": "js",
    "application/atom+xml": "atom",
    "application/rss+xml": "rss",
    "text/mathml": "mml",
    "text/plain": "txt",
    "text/vnd.sun.j2me.app-descriptor": "jad",
    "text/vnd.wap.wml": "wml",
    "text/x-component": "htc",
    "image/png": "png",
    "image/tiff": "tif",
    "image/vnd.wap.wbmp": "wbmp",
    "image/x-icon": "ico",
    "image/x-jng": "jng",
    "image/x-ms-bmp": "bmp",
    "image/svg+xml": "svg",
    "image/webp": "webp",
    "application/java-archive": "jar",
    "application/mac-binhex40": "hqx",
    "application/msword": "doc",
    "application/pdf": "pdf",
    "application/postscript": "ps",
    "application/rtf": "rtf",
    "application/vnd.ms-excel": "xls",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.wap.wmlc": "wmlc",
    "application/vnd.google-earth.kml+xml": "kml",
    "application/vnd.google-earth.kmz": "kmz",
    "application/x-7z-compressed": "7z",
    "application/x-cocoa": "cco",
    "application/x-java-archive-diff": "jardiff",
    "application/x-java-jnlp-file": "jnlp",
    "application/x-makeself": "run",
    "application/x-perl": "pl",
    "application/x-pilot": "prc",
    "application/x-rar-compressed": "rar",
    "application/x-redhat-package-manager": "rpm",
    "application/x-sea": "sea",
    "application/x-shockwave-flash": "swf",
    "application/x-stuffit": "sit",
    "application/x-tcl": "tcl",
    "application/x-x509-ca-cert": "pem",
    "application/x-xpinstall": "xpi",
    "application/xhtml+xml": "xhtml",
    "application/zip": "zip",
    "application/octet-stream": "bin",
    "audio/midi": "mid",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
    "audio/x-realaudio": "ra",
    "video/3gpp": "3gp",
    "video/mpeg": "mpeg",
    "video/quicktime": "mov",
    "video/x-flv": "flv",
    "video/x-mng": "mng",
    "video/x-ms-asf": "asx",
    "video/x-ms-wmv": "wmv",
    "video/x-msvideo": "avi",
    "video/mp4": "mp4",
  };

  const animate = {
    initImage(gdInputArea: HTMLElement): void {
      const tl = gsap.timeline({
        onComplete() {},
      });

      const gdInputImage: HTMLElement | null = gdInputArea.querySelector(
        ".gd-input-image-container"
      );

      tl.to(gdInputImage, {
        scale: 1,
        opacity: 1,
        duration: 0.25,
        ease: "power4.out",
      });
    },
    exitImage(gdInputArea: HTMLElement, cb?: () => void): void {
      const tl = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const gdInputImage: HTMLElement | null = gdInputArea.querySelector(
        ".gd-input-image-container"
      );

      tl.to(gdInputImage, {
        scale: 1.125,
        opacity: 0,
        duration: 0.25,
        ease: "power4.in",
      });
    },
  };

  function changeHandler(e: Event): Event {
    e.preventDefault();
    if (e.target instanceof HTMLInputElement) {
      const files = e.target.files;
      if (files) fileHandler(files);
    }
    return e;
  }
  async function fileHandler(files: FileList): Promise<void> {
    inputLoading.value = true;
    const file: File = files[0];
    const result: string | ArrayBuffer = await toBase64(file);
    inputFile.value = {
      name: file.name,
      type: file.type,
      size: file.size,
      image_url: result,
      file,
    };
    setTimeout(() => {
      inputHandler("show");
      inputLoading.value = false;
    }, 1000);
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
      if (state === "show") {
        animate.initImage(gdInputArea.value);
      } else {
        animate.exitImage(gdInputArea.value, () => {
          inputFile.value = null;
          props.input.file = undefined;
        });
      }
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
    (val) => {
      if (val) props.input.file = val;
    }
  );

  onMounted(() => {
    setTimeout(async () => {
      if (props.input.image_url) {
        const response = await fetch(props.input.image_url);
        const blob: Blob = await response.blob();

        inputFile.value = {
          name: "",
          type: "",
          size: 0,
          image_url: props.input.image_url,
          file: new File([blob], `${generateId()}.${types[blob.type] || ""}`, {
            type: blob.type,
          }),
        };
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
      box-sizing: border-box;
      color: var(--font-primary-color);
      opacity: 0.5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    label.gd-input-area {
      position: relative;
      width: 100%;
      height: 13rem;
      background: var(--background-depth-one-color);
      border-radius: 0.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .gd-input-image-container {
        z-index: 2;
        position: absolute;
        width: calc(100% - 1rem);
        height: calc(100% - 1rem);
        border-radius: 0.25rem;
        overflow: hidden;
        opacity: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        transform: scale(0.875);

        img.gd-input-image {
          pointer-events: none;
          position: relative;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0.25rem;
        }

        .gd-input-image-overlay {
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

          .gd-input-image-icon-wrapper {
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

            .gd-input-image-icon-container {
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

        &:hover {
          .gd-input-image-overlay {
            opacity: 1;
          }
        }

        & ~ .gd-input-icon-wrapper {
          opacity: 0;
        }

        & ~ .gd-input-text {
          opacity: 0;
        }
      }

      .gd-input-icon-wrapper {
        z-index: 1;
        pointer-events: none;
        position: relative;
        width: 2rem;
        height: 2rem;
        margin-bottom: 0.75rem;
        border-radius: 0.5rem;
        background: rgba(0, 0, 0, 0.05);
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
        z-index: 1;
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

        label.gd-input-text-highlight {
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
  }
</style>
