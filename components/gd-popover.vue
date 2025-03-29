<template>
  <div
    class="gd-popover"
    ref="gdPopover"
    :style="`pointer-events: ${state === 'opened' ? 'all' : 'none'}`"
    :gd-view="view"
  >
    <div class="gd-popover-overlay"></div>
    <teleport v-if="view === 'desktop'" to="body">
      <div
        ref="gdPopoverContent"
        class="gd-popover-content"
        :style="limit ? `max-height: ${limit}rem` : ''"
      >
        <slot />
      </div>
    </teleport>
    <div v-else ref="gdPopoverContent" class="gd-popover-content">
      <div class="gd-popover-content-container" ref="gdPopoverContentContainer">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { gsap } from "gsap";

  type Drag = {
    y: number; // Previous Y touch position
    cy: number; // Current Y touch position
    ay: number; // Actual Y position
    sy: number; // Scroll Y position
    vy: number; // Y velocity
    dy: number; // Y deceleration
    t: number;
    ct: number;
    threshold: number;
    limit: number;
    state:
      | "dragging"
      | "scrolling"
      | "releasing-drag"
      | "releasing-scroll"
      | "idle";
    target: "open" | "close" | null;
    gdPopoverOverlay: HTMLDivElement | null;
    gdPopoverContent: HTMLDivElement | null;
    gdPopoverContentContainer: HTMLDivElement | null;
  };

  const emits = defineEmits(["exit"]);
  const props = defineProps<{
    state: "opened" | "closed";
    width?: number;
    limit?: number;
  }>();
  const { view, rem } = useMain();

  const gdPopover = ref<HTMLDivElement | null>(null);
  const gdPopoverContent = ref<HTMLDivElement | null>(null);
  const gdPopoverContentContainer = ref<HTMLDivElement | null>(null);

  const popoverAnim = ref<GSAPTimeline | null>(null);
  const popoverHeight = ref<number>(0);

  const drag: Drag = {
    y: 0,
    cy: 0,
    ay: 0,
    sy: 0,
    vy: 0,
    dy: 0,
    t: 0,
    ct: 0,
    threshold: 0,
    limit: 0,
    state: "idle",
    target: null,
    gdPopoverOverlay: null,
    gdPopoverContent: null,
    gdPopoverContentContainer: null,
  };

  function dragStart(e: TouchEvent): void {
    if (
      e.touches[0] &&
      gdPopoverContent.value &&
      gdPopoverContentContainer.value
    ) {
      if (!drag.gdPopoverContent || !drag.gdPopoverOverlay) {
        drag.gdPopoverContent = gdPopoverContent.value;
        drag.gdPopoverOverlay = gdPopoverContent.value
          .previousElementSibling as HTMLDivElement;
      }
      drag.state = "dragging";
      drag.target = null;
      drag.ct = 0;
      drag.t = 0;
      drag.cy = e.touches[0].clientY;
      drag.sy =
        gdPopoverContentContainer.value.getBoundingClientRect().top -
        gdPopoverContent.value.getBoundingClientRect().top;
      drag.ay = gdPopoverContent.value.getBoundingClientRect().top;
      drag.threshold = window.innerHeight - popoverHeight.value;
    }
  }
  function dragMove(e: TouchEvent): void {
    if (e.touches[0]) {
      drag.cy = e.touches[0].clientY;

      if (!drag.y) drag.y = drag.cy;
      let dy = drag.cy - drag.y;

      drag.vy = drag.cy - drag.y;

      if (drag.sy < 0 && drag.limit) {
        drag.state = "scrolling";
        if (drag.sy <= drag.limit) {
          dy *= ((drag.sy + dy) / drag.limit) * 0.125;
        } else if (drag.sy + dy >= 0) {
          drag.sy = 0;
          drag.state = "dragging";
        }
      } else {
        drag.state = "dragging";
        if (drag.ay + dy <= drag.threshold && drag.vy && !drag.limit) {
          dy *= ((drag.ay + dy) / drag.threshold) * 0.125;
        } else if (drag.ay + dy <= drag.threshold && drag.vy <= 0) {
          drag.state = "scrolling";
        }
      }

      if (
        drag.state === "dragging" &&
        drag.gdPopoverContent &&
        drag.gdPopoverOverlay
      ) {
        drag.ay += dy;
        drag.gdPopoverContent.style.transform = `translate3d(0, ${drag.ay}px, 0)`;
        drag.gdPopoverOverlay.style.opacity = `${
          1 - (drag.ay - drag.threshold) / (window.innerHeight - drag.threshold)
        }`;
      } else if (drag.state === "scrolling" && drag.gdPopoverContentContainer) {
        drag.sy += dy;
        drag.gdPopoverContentContainer.style.transform = `translate3d(0, ${drag.sy}px, 0)`;
      }

      drag.y = drag.cy;
    }
  }
  function dragEnd(): void {
    drag.cy = 0;
    drag.y = 0;

    if (drag.state === "dragging") {
      const dy = drag.threshold - drag.ay;

      if (dy !== 0) {
        drag.state = "releasing-drag";

        if (drag.ay <= drag.threshold) {
          // Overscrolled
          const dy = drag.threshold - drag.ay;
          drag.vy = dy / 7.5;
          drag.dy = drag.vy / -15;
          drag.t = 15;
          drag.ct = 15;
          drag.target = "open";
        } else if (drag.vy >= 0) {
          // Going down
          if (drag.vy > 30) {
            // If fast
            drag.target = "close";
          } else if (
            // If minimum speed requirement met but not the minimum speed threshold
            (drag.vy <= 30 && drag.vy >= 10) ||
            drag.ay >= window.innerHeight - drag.threshold * 0.5
          ) {
            drag.vy = 30;
            drag.target = "close";
          } else {
            // Going down too slow and actual position near opening point
            drag.vy = dy / 15;
            drag.dy = drag.vy / -30;
            drag.target = "open";
            drag.t = 30;
            drag.ct = 30;
          }
        } else if (calculateDistance(drag.vy) > dy) {
          // Going up too slow
          drag.vy = dy / 15;
          drag.dy = drag.vy / -30;
          drag.t = 30;
          drag.ct = 30;
          drag.target = "open";
        } else {
          // Going up fast
          drag.target = "open";
        }
      } else {
        drag.state = "idle";
      }
    } else {
      drag.state = "releasing-scroll";

      if (drag.sy <= drag.limit) {
        const dy = drag.limit - drag.sy;
        drag.vy = dy / 7.5;
        drag.dy = drag.vy / -15;
        drag.t = 15;
        drag.ct = 15;
      }
    }

    requestAnimationFrame(dragHandler);
  }
  function dragHandler(): void {
    if (drag.state === "releasing-drag") {
      if (drag.target === "open") {
        if (Math.abs(drag.vy) <= 0.01 && drag.ay <= drag.threshold) {
          const dy = drag.threshold - drag.ay;
          drag.vy = dy / 7.5;
          drag.dy = drag.vy / -15;
          drag.t = 15;
          drag.ct = 15;
        }

        if (drag.vy <= 0 && drag.ay <= drag.threshold) {
          // if going up and passed the threshold
          drag.vy *= 0.25;
          drag.ay += drag.vy;
        } else if (drag.vy <= 0 && drag.t) {
          // vy is negative, indicating that it's going up and t exists indicating stopping at opening point
          const vy = drag.dy * drag.t - drag.dy * drag.ct + drag.vy;
          const dy = vy + drag.dy / 2;
          drag.ay += dy;
          drag.ct -= 1;
        } else if (drag.vy <= 0) {
          // vy is negative, indicating that it's going up
          drag.vy += 1;
          drag.ay += drag.vy;
        } else if (drag.ay <= drag.threshold && drag.t) {
          // Going down from overscroll
          const vy = drag.dy * drag.t - drag.dy * drag.ct + drag.vy;
          const dy = vy + drag.dy / 2;
          drag.ay += dy;
          drag.ct -= 1;
        }
      } else {
        drag.ay += drag.vy;
      }

      if (drag.gdPopoverContent && drag.gdPopoverOverlay) {
        drag.gdPopoverContent.style.transform = `translate3d(0, ${drag.ay}px, 0)`;
        drag.gdPopoverOverlay.style.opacity = `${
          1 - (drag.ay - drag.threshold) / (window.innerHeight - drag.threshold)
        }`;
      }

      if (drag.ay >= window.innerHeight || (drag.t && !drag.ct)) {
        drag.t = 0;
        drag.ct = 0;
        drag.state = "idle";
        if (drag.gdPopoverContent && drag.target === "close") {
          drag.gdPopoverContent.removeAttribute("style");
          emits("exit");
        }
        return;
      }

      requestAnimationFrame(dragHandler);
    } else if (drag.state === "releasing-scroll") {
      if (Math.abs(drag.vy) <= 0.01) {
        if (drag.sy <= drag.limit || drag.sy >= 0) {
          const dy = drag.sy <= drag.limit ? drag.limit - drag.sy : 0 - drag.sy;
          drag.vy = dy / 7.5;
          drag.dy = drag.vy / -15;
          drag.t = 15;
          drag.ct = 15;
        } else {
          drag.t = 0;
          drag.ct = 0;
          drag.vy = 0;
          return;
        }
      }

      if (drag.t) {
        const vy = drag.dy * drag.t - drag.dy * drag.ct + drag.vy;
        const dy = vy + drag.dy / 2;
        drag.sy += dy;
        drag.ct -= 1;
      } else {
        drag.vy *= drag.sy <= drag.limit || drag.sy >= 0 ? 0.25 : 0.975;
        drag.sy += drag.vy;
      }

      if (drag.gdPopoverContentContainer) {
        drag.gdPopoverContentContainer.style.transform = `translate3d(0, ${drag.sy}px, 0)`;
      }

      if (drag.t && !drag.ct) {
        drag.t = 0;
        drag.ct = 0;
        drag.vy = 0;
        return;
      }

      requestAnimationFrame(dragHandler);
    }
  }
  function calculateDistance(
    vy: number,
    a: number = 1,
    t: number = 30
  ): number {
    return vy * t + 0.5 * a * t * t;
  }

  const animate = {
    toggle(gdContent: HTMLElement, gdParent: HTMLElement): GSAPTimeline {
      const tl = gsap.timeline({
        paused: true,
        onStart() {
          const { left, top, width } = gdParent.getBoundingClientRect();
          const { height } = gdContent.getBoundingClientRect();

          gdContent.style.pointerEvents = "all";
          gdContent.style.left = `${left}px`;
          if (props.width) gdContent.style.width = `${props.width}px`;
          else gdContent.style.width = `${width}px`;

          if (top + height > window.innerHeight - rem.value * 4) {
            gdContent.style.top = "auto";
            gdContent.style.bottom = `${window.innerHeight - top}px`;
          } else {
            gdContent.style.top = `${top + rem.value * 2}px`;
            gdContent.style.bottom = "auto";
          }
        },
        onReverseComplete() {
          gdContent.style.pointerEvents = "none";
          if (props.limit) gdContent.style.maxHeight = `${props.limit}rem`;
        },
      });

      tl.to(gdContent, {
        scale: 1,
        opacity: 1,
        duration: 0.25,
        ease: "power2.inOut",
      });

      return tl;
    },
  };

  watch(
    () => props.state,
    (val) => {
      if (val === "opened") {
        if (view.value === "desktop" && popoverAnim.value) {
          popoverAnim.value.play();
        } else if (gdPopoverContent.value && gdPopoverContentContainer.value) {
          if (!drag.gdPopoverContent || !drag.gdPopoverOverlay) {
            drag.gdPopoverContent = gdPopoverContent.value;
            drag.gdPopoverOverlay = gdPopoverContent.value
              .previousElementSibling as HTMLDivElement;
          }

          const { top, height } =
            gdPopoverContentContainer.value.getBoundingClientRect();
          popoverHeight.value = height;

          drag.limit =
            gdPopoverContentContainer.value.scrollHeight >
            gdPopoverContent.value.getBoundingClientRect().height
              ? height -
                rem.value -
                gdPopoverContentContainer.value.scrollHeight
              : 0;

          if (drag.limit) {
            drag.gdPopoverContentContainer = gdPopoverContentContainer.value;
            drag.gdPopoverContentContainer.style.transform = `translate3d(0, 0, 0)`;
            drag.sy = 0;
          } else {
            drag.gdPopoverContentContainer = null;
          }

          if (gdPopoverContent.value.parentElement)
            gdPopoverContent.value.parentElement.style.zIndex = "10000";
          gdPopoverContent.value.style.pointerEvents = "all";
          gdPopoverContent.value.style.opacity = "1";

          drag.threshold = window.innerHeight - popoverHeight.value;
          drag.ay = top;
          drag.vy = (drag.threshold - drag.ay) / 10;
          drag.dy = drag.vy / -20;
          drag.t = 20;
          drag.ct = 20;
          drag.target = "open";
          drag.state = "releasing-drag";

          requestAnimationFrame(dragHandler);
        }
      } else {
        if (popoverAnim.value) {
          popoverAnim.value.reverse();
        } else if (drag.state === "idle") {
          drag.vy = 15;
          drag.target = "close";
          drag.state = "releasing-drag";
          requestAnimationFrame(dragHandler);
        }
      }
    }
  );

  onBeforeUnmount(() => {
    if (gdPopoverContent.value) {
      gdPopoverContent.value.removeEventListener("touchstart", dragStart);
      gdPopoverContent.value.removeEventListener("touchmove", dragMove);
      gdPopoverContent.value.removeEventListener("touchend", dragEnd);
    }
  });
  onMounted(() => {
    if (gdPopoverContent.value) {
      if (view.value === "desktop") {
        popoverAnim.value = animate.toggle(
          gdPopoverContent.value,
          gdPopover.value?.parentElement as HTMLElement
        );
      } else if (gdPopoverContentContainer.value) {
        popoverHeight.value =
          gdPopoverContentContainer.value.getBoundingClientRect().height;
        gdPopoverContent.value.addEventListener("touchstart", dragStart);
        gdPopoverContent.value.addEventListener("touchmove", dragMove);
        gdPopoverContent.value.addEventListener("touchend", dragEnd);
      }
    }
  });
</script>

<style lang="scss" scoped>
  .gd-popover {
    pointer-events: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;

    &[gd-view="mobile"] {
      pointer-events: none;
      position: fixed;
      top: 0 !important;
      left: 0;
      bottom: 0;
      right: 0;

      .gd-popover-overlay {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(5px);
        opacity: 0;
      }

      .gd-popover-content {
        touch-action: none;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        max-height: 100%;
        border: none;
        padding: 0;
        border-radius: 0.5rem 0.5rem 0 0;
        box-shadow: none;
        transform: translate3d(0, 100%, 0);
        transform-origin: center;

        .gd-popover-content-container {
          position: relative;
          width: 100%;
          max-height: calc(100% - 4rem);
          padding: 1rem;
          box-sizing: border-box;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
      }
    }
  }
</style>

<style lang="scss">
  .gd-popover-content {
    z-index: 999999999;
    position: absolute;
    background: var(--background-depth-one-color);
    box-shadow: var(--box-shadow);
    border: var(--border);
    padding: 0.5rem;
    border-radius: 0.5rem;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transform: scale(1.125);
    transform-origin: top center;
    opacity: 0;
  }
</style>
