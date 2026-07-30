<template>
  <Teleport to="body">
    <transition name="ding-modal-fade">
      <div v-if="visible" class="ding-modal-root" @click.self="handleOverlayClick">
        <transition name="ding-modal-zoom">
          <div
            v-if="visible"
            class="ding-modal"
            :style="{ width: width }"
            ref="modalRef"
          >
            <!-- header -->
            <div class="ding-modal__header">
              <span class="ding-modal__title">{{ title }}</span>
              <button class="ding-modal__close" @click="handleCancel">&times;</button>
            </div>

            <!-- body -->
            <div class="ding-modal__body">
              <slot />
            </div>

            <!-- footer -->
            <div v-if="$slots.footer || showFooter" class="ding-modal__footer">
              <slot name="footer">
                <button class="ding-btn ding-btn--default" @click="handleCancel">{{ cancelText }}</button>
                <button class="ding-btn ding-btn--primary" @click="handleOk" :disabled="okDisabled">{{ okText }}</button>
              </slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  width?: string
  cancelText?: string
  okText?: string
  okDisabled?: boolean
  showFooter?: boolean
  maskClosable?: boolean
  keyboard?: boolean
}>(), {
  title: '',
  width: '520px',
  cancelText: '取消',
  okText: '确定',
  okDisabled: false,
  showFooter: true,
  maskClosable: true,
  keyboard: true
})

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'ok'): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()

const modalRef = ref<HTMLElement | null>(null)

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

function handleOk() {
  emit('ok')
}

function handleCancel() {
  emit('update:visible', false)
  emit('cancel')
}

function handleOverlayClick() {
  if (props.maskClosable) {
    handleCancel()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.visible || !props.keyboard) return
  if (e.key === 'Escape') {
    handleCancel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 弹窗打开时禁止 body 滚动
watch(() => props.visible, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<style scoped>
/* ── overlay ── */
.ding-modal-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

/* ── modal box ── */
.ding-modal {
  position: relative;
  max-height: calc(100vh - 80px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── header ── */
.ding-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.ding-modal__title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

.ding-modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: #999;
  border-radius: 4px;
  padding: 0;
}

.ding-modal__close:hover {
  background: #f5f5f5;
  color: #333;
}

/* ── body ── */
.ding-modal__body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* ── footer ── */
.ding-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 24px 16px;
  border-top: 1px solid #f0f0f0;
}

/* ── buttons ── */
.ding-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ding-btn--default {
  background: #fff;
  border-color: #d9d9d9;
  color: #333;
}

.ding-btn--default:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.ding-btn--primary {
  background: #1677ff;
  color: #fff;
}

.ding-btn--primary:hover {
  background: #4096ff;
}

.ding-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ding-btn--primary:disabled:hover {
  background: #1677ff;
}

/* ── transitions ── */
.ding-modal-fade-enter-active,
.ding-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.ding-modal-fade-enter-from,
.ding-modal-fade-leave-to {
  opacity: 0;
}

.ding-modal-zoom-enter-active,
.ding-modal-zoom-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.ding-modal-zoom-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.ding-modal-zoom-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
