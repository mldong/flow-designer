<template>
  <div class="ding-tooltip" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
    <slot />
    <Teleport to="body">
      <transition name="ding-tooltip-fade">
        <div
          v-if="visible"
          class="ding-tooltip__popup"
          :style="popupStyle"
          ref="popupRef"
        >
          <div class="ding-tooltip__arrow"></div>
          <div class="ding-tooltip__inner">{{ title }}</div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  offset?: number
}>(), {
  placement: 'top',
  offset: 8
})

const visible = ref(false)
const popupRef = ref<HTMLElement | null>(null)
const popupPos = ref({ x: 0, y: 0 })

function show(e: MouseEvent | FocusEvent) {
  visible.value = true
  nextTick(() => {
    if (!popupRef.value) return
    const target = (e.currentTarget as HTMLElement)
    const rect = target.getBoundingClientRect()
    const popup = popupRef.value.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let x: number, y: number

    switch (props.placement) {
      case 'top':
        x = rect.left + rect.width / 2 - popup.width / 2
        y = rect.top - popup.height - props.offset
        break
      case 'bottom':
        x = rect.left + rect.width / 2 - popup.width / 2
        y = rect.bottom + props.offset
        break
      case 'left':
        x = rect.left - popup.width - props.offset
        y = rect.top + rect.height / 2 - popup.height / 2
        break
      case 'right':
        x = rect.right + props.offset
        y = rect.top + rect.height / 2 - popup.height / 2
        break
    }

    // clamp to viewport
    x = Math.max(4, Math.min(x, vw - popup.width - 4))
    y = Math.max(4, Math.min(y, vh - popup.height - 4))

    popupPos.value = { x, y }
  })
}

function hide() {
  visible.value = false
}

const popupStyle = computed(() => ({
  left: `${popupPos.value.x}px`,
  top: `${popupPos.value.y}px`
}))
</script>

<style scoped>
.ding-tooltip {
  display: inline-block;
  max-width: 100%;
}

.ding-tooltip__popup {
  position: fixed;
  z-index: 9999;
  max-width: 280px;
  pointer-events: none;
}

.ding-tooltip__inner {
  padding: 6px 12px;
  font-size: 13px;
  line-height: 1.5;
  color: #fff;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 6px;
  word-break: break-all;
  white-space: normal;
}

.ding-tooltip__arrow {
  display: none;
}

/* fade transition */
.ding-tooltip-fade-enter-active,
.ding-tooltip-fade-leave-active {
  transition: opacity 0.15s ease;
}
.ding-tooltip-fade-enter-from,
.ding-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
