<template>
  <div class="ding-node-selector" v-if="visible">
    <div class="ding-node-selector__overlay" @click="close"></div>
    <div class="ding-node-selector__panel">
      <div
        v-for="item in filteredItems"
        :key="item.type"
        class="ding-node-selector__item"
        @click="handleSelect(item)"
      >
        <span :class="['ding-node-selector__item__icon', getIconClass(item)]">
          {{ getIconText(item) }}
        </span>
        <span>{{ item.label || item.text || item.type }}</span>
      </div>
      <!-- 条件分支选项 -->
      <div class="ding-node-selector__item" @click="handleSelectCondition">
        <span class="ding-node-selector__item__icon ding-node-selector__item__icon--condition">
          &#x2726;
        </span>
        <span>条件分支</span>
      </div>
      <!-- 并行分支选项 -->
      <div class="ding-node-selector__item" @click="handleSelectParallel">
        <span class="ding-node-selector__item__icon ding-node-selector__item__icon--parallel">
          &#x2263;
        </span>
        <span>并行分支</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FDPatternItem } from '../../types'

const props = defineProps<{
  visible: boolean
  dndPanel?: FDPatternItem[]
  typePrefix: string
}>()

const emit = defineEmits<{
  (e: 'select', nodeType: string): void
  (e: 'update:visible', value: boolean): void
}>()

/** 过滤掉 start/end 以及 decision/fork 类型 */
const filteredItems = computed(() => {
  if (!props.dndPanel) return []
  return props.dndPanel.filter(item => {
    if (!item.type) return false
    if (item.hide) return false
    const baseType = item.type.replace(props.typePrefix, '')
    return !['start', 'end', 'decision', 'fork', 'join'].includes(baseType)
  })
})

function getIconClass(item: FDPatternItem) {
  if (!item.type) return ''
  const baseType = item.type.replace(props.typePrefix, '')
  switch (baseType) {
    case 'task': return 'ding-node-selector__item__icon--task'
    case 'custom': return 'ding-node-selector__item__icon--custom'
    case 'subProcess': return 'ding-node-selector__item__icon--subprocess'
    default: return 'ding-node-selector__item__icon--task'
  }
}

function getIconText(item: FDPatternItem) {
  if (!item.type) return '?'
  const baseType = item.type.replace(props.typePrefix, '')
  switch (baseType) {
    case 'task': return '\u2713'
    case 'custom': return '\u2605'
    case 'subProcess': return '\u25A3'
    default: return '\u2713'
  }
}

function handleSelect(item: FDPatternItem) {
  if (item.type) {
    emit('select', item.type)
  }
  close()
}

function handleSelectCondition() {
  emit('select', '__condition__')
  close()
}

function handleSelectParallel() {
  emit('select', '__parallel__')
  close()
}

function close() {
  emit('update:visible', false)
}
</script>
