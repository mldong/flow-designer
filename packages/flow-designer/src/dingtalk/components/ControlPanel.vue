<template>
  <div class="ding-control-panel" v-if="visibleItems.length > 0">
    <div
      v-for="item in visibleItems"
      :key="item.key"
      class="ding-control-panel__item"
      :title="item.title || item.text"
      @click="handleClick(item)"
    >
      <span class="ding-control-panel__icon" :class="item.iconClass"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
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
