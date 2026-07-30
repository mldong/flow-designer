<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="ding-drawer-root"
      :class="{ 'ding-drawer-root--open': opening }"
      @click.self="handleMaskClick"
    >
      <div class="ding-drawer" :class="{ 'ding-drawer--open': opening }" :style="{ width: width }" ref="drawerRef">
        <div class="ding-drawer__header">
          <span class="ding-drawer__title">{{ title }}</span>
          <button class="ding-drawer__close" @click="handleCancel">&times;</button>
        </div>
        <div class="ding-drawer__body">
          <slot />
        </div>
        <div v-if="$slots.footer || showFooter" class="ding-drawer__footer">
          <slot name="footer">
            <button class="ding-btn ding-btn--default" @click="handleCancel">{{ cancelText }}</button>
            <button class="ding-btn ding-btn--primary" @click="handleOk" :disabled="okDisabled">{{ okText }}</button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, onBeforeUnmount } from 'vue'

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
  width: '420px',
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
}>()

const show = ref(false)       // 控制 v-if 挂载/卸载
const opening = ref(false)    // 控制滑入/滑出动画 class

function open() {
  show.value = true
  document.body.style.overflow = 'hidden'
  // 下一帧加 open class 触发滑入过渡
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      opening.value = true
    })
  })
}

function close() {
  opening.value = false  // 触发滑出过渡
  // 等过渡结束再卸载 DOM
  setTimeout(() => {
    show.value = false
    document.body.style.overflow = ''
    emit('update:visible', false)
    emit('cancel')
  }, 260)
}

function handleOk() {
  emit('ok')
}

function handleCancel() {
  close()
}

function handleMaskClick() {
  if (props.maskClosable) {
    close()
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!show.value || !props.keyboard) return
  if (e.key === 'Escape') {
    close()
  }
}

// 监听 visible prop 变化
watch(() => props.visible, (v) => {
  if (v) {
    open()
  }
  // 不处理 v=false：统一走 close() 流程（由父组件 cancel 或 X 按钮触发）
}, { immediate: true })

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.ding-drawer-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0);
  transition: background 0.25s ease;
  pointer-events: none;
}

.ding-drawer-root--open {
  background: rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}

.ding-drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.ding-drawer--open {
  transform: translateX(0);
}

.ding-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.ding-drawer__title {
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

.ding-drawer__close {
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

.ding-drawer__close:hover {
  background: #f5f5f5;
  color: #333;
}

.ding-drawer__body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.ding-drawer__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 24px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

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
</style>
