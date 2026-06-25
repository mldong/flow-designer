<template>
  <div class="ding-control-panel" :class="{ 'is-mobile': isMobile, 'is-mobile-open': isMobile && mobileOpen }">
    <!-- 移动端 FAB 折叠按钮 -->
    <button
      v-if="isMobile"
      class="ding-control-panel__mobile-toggle"
      :title="mobileOpen ? '收起操作' : '展开操作'"
      @click.stop="toggleMobile"
    >
      <svg v-if="!mobileOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <!-- 工具项列表（桌面常显 / 移动 popover） -->
    <div
      v-if="visibleItems.length > 0 && (!isMobile || mobileOpen)"
      class="ding-control-panel__list"
      @click.stop
    >
      <div
        v-for="item in visibleItems"
        :key="item.key"
        class="ding-control-panel__item"
        :title="item.title || item.text"
        @click="handleClick(item)"
      >
        <span class="ding-control-panel__icon" :class="item.iconClass"></span>
        <span v-if="isMobile" class="ding-control-panel__text">{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, PropType } from 'vue'
import type { FDControlItem } from '../../types'

const props = defineProps({
  initControl: {
    type: Boolean,
    default: true
  },
  control: {
    type: Array as PropType<FDControlItem[]>
  },
  viewer: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'clear'): void
  (e: 'view-data'): void
  (e: 'import-data'): void
  (e: 'fullscreen'): void
}>()

// ─── 移动端折叠状态 ────────────────────────────────────────
const isMobile = ref(typeof window !== 'undefined' && window.innerWidth < 768)
const mobileOpen = ref(false)

function handleResize() {
  const next = window.innerWidth < 768
  isMobile.value = next
  if (!next) mobileOpen.value = false
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value
}

function closeMobile() {
  mobileOpen.value = false
}

function handleClickOutside() {
  if (isMobile.value && mobileOpen.value) closeMobile()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})

const defaultControl: FDControlItem[] = [
  {
    key: 'save',
    iconClass: 'ding-icon-save',
    title: '保存',
    text: '保存',
    sort: 90,
  },
  {
    key: 'clear',
    iconClass: 'ding-icon-clear',
    title: '清空',
    text: '清空',
    sort: 60,
  },
  {
    key: 'see',
    iconClass: 'ding-icon-see',
    title: '查看数据',
    text: '查看数据',
    sort: 70,
  },
  {
    key: 'import',
    iconClass: 'ding-icon-import',
    title: '导入',
    text: '导入',
    sort: 80,
  },
  {
    key: 'fullscreen',
    iconClass: 'ding-icon-fullscreen',
    title: '全屏',
    text: '全屏',
    sort: 100,
  },
]

const mergedItems = computed<FDControlItem[]>(() => {
  if (!props.initControl) return props.control || []

  let items = [...defaultControl]

  // 合并外部 control 配置
  if (props.control && props.control.length > 0) {
    for (const ext of props.control) {
      const idx = items.findIndex(d => d.key === ext.key)
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...ext }
      } else {
        items.push(ext)
      }
    }
  }

  return items
})

const visibleItems = computed<FDControlItem[]>(() => {
  let items = mergedItems.value.filter(item => !item.hide)

  // viewer 模式隐藏编辑类按钮
  if (props.viewer) {
    items = items.filter(item => !['clear', 'import'].includes(item.key || ''))
  }

  // 按 sort 排序
  return items.sort((a, b) => (a.sort || 0) - (b.sort || 0))
})

function handleClick(item: FDControlItem) {
  // 移动端点击后关闭 popover
  if (isMobile.value) closeMobile()

  // 自定义 onClick 优先
  if (item.onClick && typeof item.onClick === 'function') {
    item.onClick(item)
    return
  }

  // 默认行为
  switch (item.key) {
    case 'save':
      emit('save')
      break
    case 'clear':
      emit('clear')
      break
    case 'see':
      emit('view-data')
      break
    case 'import':
      emit('import-data')
      break
    case 'fullscreen':
      emit('fullscreen')
      break
  }
}
</script>
