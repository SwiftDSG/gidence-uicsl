<template>
  <div class="gd-layout" ref="gdLayout">
    <main class="gd-main">
      <NuxtPage @shake="shake" />
    </main>
    <gd-alert />
  </div>
</template>

<script setup lang="ts">
  const { view, rem, theme, getTheme } = useMain();

  const gdLayout = ref<HTMLDivElement>();

  function resizeHandler(): void {
    if (window.innerWidth > 1280) view.value = "desktop";
    else if (window.innerWidth > 640) view.value = "tab";
    else view.value = "mobile";
    rem.value = parseInt(getComputedStyle?.(document.body)?.fontSize) || 24;
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );
  }

  function shake(): void {
    if (gdLayout.value) gdLayout.value.classList.add("gd-layout-shake");
    setTimeout(() => {
      if (gdLayout.value) gdLayout.value.classList.remove("gd-layout-shake");
    }, 500);
  }

  onBeforeMount(() => {
    getTheme();

    resizeHandler();
    window.addEventListener("resize", resizeHandler);
  });

  watch(
    () => theme.value,
    (val) => {
      if (val === "dark") document.documentElement.classList.add("gd-dark");
      else document.documentElement.classList.remove("gd-dark");
    }
  );

  onMounted(() => {
    if (theme.value === "dark") {
      document.documentElement.classList.add("gd-dark");
    } else {
      document.documentElement.classList.remove("gd-dark");
    }
  });
</script>

<style lang="scss" scoped>
  .gd-layout {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: var(--background-depth-three-color);
    display: flex;
    overflow: hidden;

    .gd-loading {
      z-index: 2000;
    }

    main.gd-main {
      position: relative;
      width: 100vw;
      min-height: 100%;
      display: flex;
      overflow-y: auto;
    }

    &.gd-layout-shake {
      animation: gd-shake 0.25s infinite;
    }

    [gd-view="mobile"] {
      section.gd-section {
        &:not(:first-child) {
          z-index: 3;
          right: 0;
          width: 100%;
          height: 4rem;
          border: none;

          header.gd-header {
            height: 100%;
            padding: 1rem;
          }
        }
      }
    }
  }
</style>

<style lang="scss">
  :root {
    -webkit-tap-highlight-color: transparent;
    --primary-color: #ffd975;
    --secondary-color: #242529;
    --error-color: #ff584c;
    --warning-color: #ffd975;
    --success-color: #6bc785;
    --border-color: #e0e0e0;
    --font-primary-color: #242529;
    --font-secondary-color: #242529;
    --font-tertiary-color: rgba(36, 37, 41, 0.5);
    --background-depth-one-color: #ffffff;
    --background-depth-two-color: #fafafa;
    --background-depth-three-color: #f0f0f0;
    --border: 1px solid var(--border-color);
    --box-shadow: 0 0.5rem 1rem rgba(199, 199, 199, 0.125);
  }

  ::-webkit-scrollbar {
    display: none;
  }

  html,
  body {
    position: relative;
    width: 100vw;
    margin: 0;
    padding: 0;
    font-size: 24px;
    font-family: "Poppins", -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--font-primary-color);
    background: var(--background-depth-two-color);
    overflow: hidden;

    @media only screen and (max-width: 1900px) and (min-width: 1601px) {
      font-size: 22px;
    }

    @media only screen and (max-width: 1600px) and (min-width: 1481px) {
      font-size: 21px;
    }

    @media only screen and (max-width: 1480px) and (min-width: 1381px) {
      font-size: 20px;
    }

    @media only screen and (max-width: 1380px) and (min-width: 1321px) {
      font-size: 19px;
    }

    @media only screen and (max-width: 1320px) and (min-width: 1025px) {
      font-size: 18px;
    }

    @media only screen and (max-width: 640px) {
      font-size: 24px;
    }

    @media only screen and (max-width: 320px) {
      font-size: 17px;
    }

    @media only screen and (max-width: 1024px) {
      height: auto;
      overflow-y: auto;

      .gd-title-1 {
        font-size: 1.25rem;
      }

      .gd-title-2 {
        font-size: 1.125rem;
      }
    }

    &.gd-dark {
      --primary-color: #fff37a;
      --warning-color: #fff37a;
      --background-depth-one-color: #2d2e32;
      --background-depth-two-color: #242529;
      --background-depth-three-color: #202124;
      --border-color: #222327;
      --box-shadow: 0 0.5rem 1rem rgba(15, 16, 17, 0.25);
      --font-primary-color: #fdebdd;
      --font-secondary-color: #242529;
      --font-tertiary-color: rgba(253, 235, 221, 0.375);
    }
  }

  .gd-title-1 {
    font-size: 1.75rem;
    font-weight: 700;
    font-family: "Poppins";
  }

  .gd-title-2 {
    font-size: 1.375rem;
    font-weight: 700;
    font-family: "Poppins";
  }

  .gd-headline-1 {
    font-size: 1.25rem;
    font-weight: 600;
    font-family: "Poppins";
  }

  .gd-headline-2 {
    font-size: 1rem;
    font-weight: 600;
    font-family: "Poppins";
  }

  .gd-headline-3 {
    font-size: 0.85rem;
    font-weight: 600;
    font-family: "Poppins";
  }

  .gd-headline-4 {
    font-size: 0.75rem;
    font-weight: 600;
    font-family: "Poppins";
  }

  .gd-headline-5 {
    font-size: 0.65rem;
    font-weight: 600;
    font-family: "Poppins";
  }

  .gd-headline-6 {
    font-size: 0.55rem;
    font-weight: 600;
    font-family: "Poppins";
  }

  .gd-subtitle-text {
    font-size: 0.75rem;
    font-weight: 500;
    font-family: "Poppins";
  }

  .gd-body-text {
    font-size: 0.6rem;
    font-weight: 500;
    font-family: "Poppins";
  }

  .gd-caption-text {
    font-size: 0.55rem;
    font-family: "Poppins";
    font-weight: 400;
    color: var(--font-tertiary-color);
  }

  .gd-button-text {
    font-family: "Poppins";
    font-size: 0.55rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.125rem;
    transform: translateX(0.0625rem);
  }

  span.gd-text-wrapper,
  span.gd-wogd-wrapper,
  span.gd-letter-wrapper,
  span.gd-image-wrapper {
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    text-align: inherit;

    span.gd-text-container,
    span.gd-wogd-container,
    span.gd-letter-container,
    span.gd-image-container {
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: inherit;

      &.gd-text-container-up,
      &.gd-wogd-container-up,
      &.gd-letter-container-up,
      &.gd-image-container-up {
        transform: translateY(-100%);

        span.gd-text,
        span.gd-word,
        span.gd-letter,
        span.gd-image,
        img.gd-image {
          transform: translateY(100%);
          text-align: inherit;

          &.gd-image:not(.gd-image-contain) {
            transform: translateY(100%) scale(1.5);
          }

          &.gd-image-contain {
            object-fit: contain;
            transform: translateY(100%) scale(1);
          }
        }
      }

      &.gd-text-container-down,
      &.gd-wogd-container-down,
      &.gd-letter-container-down,
      &.gd-image-container-down {
        transform: translateY(100%);

        span.gd-text,
        span.gd-word,
        span.gd-letter,
        span.gd-image,
        img.gd-image {
          transform: translateY(-100%);
          text-align: inherit;

          &.gd-image:not(.gd-image-contain) {
            transform: translateY(-100%) scale(1.5);
          }

          &.gd-image-contain {
            object-fit: contain;
            transform: translateY(-100%) scale(1);
          }
        }
      }

      &.gd-text-container-left,
      &.gd-wogd-container-left,
      &.gd-letter-container-left,
      &.gd-image-container-left {
        transform: translateX(-100%);

        span.gd-text,
        span.gd-word,
        span.gd-letter,
        span.gd-image,
        img.gd-image {
          transform: translateX(100%);
          text-align: inherit;

          &.gd-image:not(.gd-image-contain) {
            transform: translateX(100%) scale(1.5);
          }

          &.gd-image-contain {
            object-fit: contain;
            transform: translateX(100%) scale(1);
          }
        }
      }

      &.gd-text-container-right,
      &.gd-wogd-container-right,
      &.gd-letter-container-right,
      &.gd-image-container-right {
        transform: translateX(100%);

        span.gd-text,
        span.gd-word,
        span.gd-letter,
        span.gd-image,
        img.gd-image {
          transform: translateX(-100%);
          text-align: inherit;

          &.gd-image:not(.gd-image-contain) {
            transform: translateX(-100%) scale(1.5);
          }

          &.gd-image-contain {
            object-fit: contain;
            transform: translateX(-100%) scale(1);
          }
        }
      }
    }
  }

  span.gd-image-wrapper {
    width: 100%;
    height: 100%;

    span.gd-image-container {
      width: 100%;
      height: 100%;

      span.gd-image {
        position: relative;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;

        &.gd-image-contain {
          background-size: contain;
        }
      }

      img.gd-image {
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform: scale(1.25);

        &.gd-image-contain {
          object-fit: contain;
          transform: scale(1);
        }
      }
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    margin: 0;
    padding: 0;
  }

  @keyframes gd-loading {
    0% {
      left: 0;
      right: 100%;
    }

    50% {
      left: 0;
      right: 0;
    }

    100% {
      left: 100%;
      right: 0;
    }
  }

  @keyframes gd-shake {
    0% {
      transform: translate(1px, 1px);
    }

    10% {
      transform: translate(-1px, -2px);
    }

    20% {
      transform: translate(-3px, 0px);
    }

    30% {
      transform: translate(3px, 2px);
    }

    40% {
      transform: translate(1px, -1px);
    }

    50% {
      transform: translate(-1px, 2px);
    }

    60% {
      transform: translate(-3px, 1px);
    }

    70% {
      transform: translate(3px, 1px);
    }

    80% {
      transform: translate(-1px, -1px);
    }

    90% {
      transform: translate(1px, 2px);
    }

    100% {
      transform: translate(1px, -2px);
    }
  }

  @keyframes gd-rotate {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes gd-circular-rotate {
    0% {
      transform: rotate(0);
    }

    50% {
      transform: rotate(-140deg);
    }

    100% {
      transform: rotate(0);
    }
  }

  @keyframes gd-marquee {
    100% {
      transform: translate3d(-50%, 0, 0);
    }
  }

  @keyframes gd-marquee-rtl {
    100% {
      transform: translate3d(50%, 0, 0);
    }
  }
</style>
