<template>
  <!-- 开始节点 -->
  <div
    v-if="baseType === 'start'"
    :class="['ding-node-pill', 'ding-node-pill--start', highlightClass, { 'is-clickable': !viewer }]"
    @click="!viewer && $emit('edit', node)"
  >
    开始
  </div>

  <!-- 结束节点 -->
  <div
    v-else-if="baseType === 'end'"
    :class="['ding-node-pill', 'ding-node-pill--end', highlightClass, { 'is-clickable': !viewer }]"
    @click="!viewer && $emit('edit', node)"
  >
    结束
  </div>

  <!-- 合并节点（join）：与并行分支容器对称的虚线框容器 -->
  <div
    v-else-if="baseType === 'join'"
    :class="['ding-condition-group', 'ding-join-marker', highlightClass, { 'is-clickable': !viewer }]"
    @click="!viewer && $emit('edit', node)"
  >
    <div class="ding-condition-group__header">
      <span class="ding-condition-group__title">合并节点</span>
    </div>
    <div class="ding-join-marker__inner">
      <span class="ding-join-marker__dot"></span>
      <span class="ding-join-marker__name">{{ node.name || '合并点' }}</span>
    </div>
  </div>

  <!-- 普通任务节点卡片 -->
  <div
    v-else
    :class="['ding-node-card', highlightClass]"
    @click="$emit('edit', node)"
  >
    <div class="ding-node-card__bar" :style="barStyle"></div>
    <div class="ding-node-card__header">
      <span class="ding-node-card__icon">{{ typeIcon }}</span>
      <span class="ding-node-card__title">{{ typeLabel }}</span>
      <span class="ding-node-card__actions" v-if="!viewer">
        <button
          v-if="canDelete"
          class="ding-node-card__action-btn ding-node-card__action-btn--delete"
          @click.stop="$emit('delete', node)"
          title="删除"
        >
          &times;
        </button>
      </span>
    </div>
    <DingTooltip :title="node.name || '未命名节点'">
      <div class="ding-node-card__body">
        {{ node.name || '未命名节点' }}
      </div>
    </DingTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DingNode } from '../types'
import type { FDHighLightType, FDThemeConfig } from '../../types'
import DingTooltip from './DingTooltip.vue'

const props = withDefaults(defineProps<{
  node: DingNode
  typePrefix: string
  viewer: boolean
  highLight?: FDHighLightType
  theme?: FDThemeConfig
  /** 是否可删除（默认 true：start/end/firstChild 等系统节点传 false） */
  canDelete?: boolean
  /** 节点深度（0=start, 1=第一个任务=申请人, >=2=审批人） */
  depth?: number
}>(), {
  canDelete: true,
  depth: 0
})

defineEmits<{
  (e: 'edit', node: DingNode): void
  (e: 'delete', node: DingNode): void
}>()

const baseType = computed(() => {
  return props.node.type.replace(props.typePrefix, '')
})

const typeLabel = computed(() => {
  switch (baseType.value) {
    case 'task': return props.depth === 1 ? '申请人' : '审批人'
    case 'custom': return '自定义节点'
    case 'subProcess': return '子流程'
    default: return '任务'
  }
})

const typeIcon = computed(() => {
  switch (baseType.value) {
    case 'task': return '✓'
    case 'custom': return '★'
    case 'subProcess': return '▣'
    default: return '●'
  }
})

const isActive = computed(() => {
  if (!props.highLight?.activeNodeNames) return false
  return props.highLight.activeNodeNames.includes(props.node.id)
})

const isHistory = computed(() => {
  if (!props.highLight?.historyNodeNames) return false
  return props.highLight.historyNodeNames.includes(props.node.id)
})

const highlightClass = computed(() => {
  if (isActive.value) return baseType.value === 'start' || baseType.value === 'end'
    ? 'ding-node-pill--active' : 'ding-node-card--active'
  if (isHistory.value) return baseType.value === 'start' || baseType.value === 'end'
    ? 'ding-node-pill--history' : 'ding-node-card--history'
  return ''
})

const barStyle = computed(() => {
  if (isActive.value && props.theme?.activeColor) {
    return { backgroundColor: props.theme.activeColor }
  }
  if (isHistory.value && props.theme?.historyColor) {
    return { backgroundColor: props.theme.historyColor }
  }
  if (props.theme?.primaryColor) {
    return { backgroundColor: props.theme.primaryColor }
  }
  return {}
})
</script>
