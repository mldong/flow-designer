<template>
  <div class="ding-branch-col">
    <!-- 分支顶部竖线 -->
    <div class="ding-branch-col__line-top"></div>
    <!-- 分支名称（没起显示名时回落到条件表达式，避免"只填表达式就整列显示未命名"；纯显示层，不回写 name/text） -->
    <div class="ding-branch-col__head" v-if="displayLabel || !viewer" :title="displayLabel || t('fd.ding.branch.edit')" @click="handleEditBranch">
      <span class="ding-branch-col__head-text">{{ displayLabel || t('fd.ding.branch.unnamed') }}</span>
      <span class="ding-branch-col__head-edit" v-if="!viewer" :title="t('fd.ding.branch.editAction')">
        &#x270E;
      </span>
    </div>
    <!-- 分支内容区（节点链） -->
    <div class="ding-branch-col__content">
      <template v-if="branch.children">
        <NodeChain
          :node="branch.children"
          :type-prefix="typePrefix"
          :viewer="viewer"
          :high-light="highLight"
          :theme="theme"
          :dnd-panel="dndPanel"
          :depth="depth + 1"
          :can-delete-checker="canDeleteChecker"
          @edit="(n) => $emit('edit', n)"
          @delete="(n) => $emit('delete', n)"
          @add="(nodeType, parentNode) => $emit('add', nodeType, parentNode)"
          @add-branch="(n) => $emit('add-branch', n)"
          @edit-branch="(b) => $emit('edit-branch', b)"
        />
      </template>
      <template v-else>
        <!-- 空分支的添加按钮 -->
        <AddButton
          :viewer="viewer"
          :type-prefix="typePrefix"
          :dnd-panel="dndPanel"
          @add="(nodeType) => $emit('add-to-branch', nodeType, branch)"
        />
      </template>
    </div>
    <!-- 分支底部竖线 -->
    <div class="ding-branch-col__line-bottom"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DingBranch, DingNode } from '../types'
import type { FDHighLightType, FDThemeConfig, FDPatternItem } from '../../types'
import AddButton from './AddButton.vue'
import NodeChain from './NodeChain.vue'
import { t } from '../../locales'

const props = withDefaults(defineProps<{
  branch: DingBranch
  typePrefix: string
  viewer: boolean
  highLight?: FDHighLightType
  theme?: FDThemeConfig
  dndPanel?: FDPatternItem[]
  /** 所在分支组节点（条件/并行）的深度；分支内首节点从 depth + 1 起算 */
  depth?: number
  /** 节点是否可删除检查器（false 时隐藏 × 按钮；默认全部可删除） */
  canDeleteChecker?: (node: DingNode) => boolean
}>(), {
  depth: 0
})

const emit = defineEmits<{
  (e: 'edit', node: DingNode): void
  (e: 'delete', node: DingNode): void
  (e: 'add', nodeType: string, parentNode: DingNode | null): void
  (e: 'add-branch', node: DingNode): void
  (e: 'edit-branch', branch: DingBranch): void
  (e: 'add-to-branch', nodeType: string, branch: DingBranch): void
}>()

/**
 * 分支标题的显示值：显示名优先，缺省回落到条件表达式。
 *
 * 只作用于显示层——**不回写 `branch.name`**：反向导出（converter `addEdge`）是
 * `if (name) edge.text = { value: name }`，一旦把 expr 塞进 name，表达式就会被固化进
 * 流程 JSON 的 edge.text（画布那条线凭空多出文字标签，且随流程定义一起存库）。
 */
const displayLabel = computed(() => {
  const name = (props.branch.name || '').trim()
  if (name) return name
  const expr = props.branch.properties?.expr
  return typeof expr === 'string' ? expr.trim() : ''
})

function handleEditBranch() {
  if (props.viewer) return
  emit('edit-branch', props.branch)
}
</script>
