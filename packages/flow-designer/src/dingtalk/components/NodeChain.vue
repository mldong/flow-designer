<template>
  <div class="ding-node-chain">
    <!-- 当前节点 -->
    <template v-if="isFork">
      <ParallelGroup
        :node="(node as DingForkNode)"
        :type-prefix="typePrefix"
        :viewer="viewer"
        :high-light="highLight"
        :theme="theme"
        :dnd-panel="dndPanel"
        @edit="(n) => $emit('edit', n)"
        @delete="(n) => $emit('delete', n)"
        @add="(nodeType, parentNode) => $emit('add', nodeType, parentNode)"
        @add-branch="(n) => $emit('add-branch', n)"
        @edit-branch="(b) => $emit('edit-branch', b)"
        @add-to-branch="(nodeType, b) => $emit('add-to-branch', nodeType, b)"
      />
    </template>
    <template v-else-if="isCondition">
      <ConditionGroup
        :node="(node as DingConditionNode)"
        :type-prefix="typePrefix"
        :viewer="viewer"
        :high-light="highLight"
        :theme="theme"
        :dnd-panel="dndPanel"
        @edit="(n) => $emit('edit', n)"
        @delete="(n) => $emit('delete', n)"
        @add="(nodeType, parentNode, branchIndex) => $emit('add', nodeType, parentNode)"
        @add-branch="(n) => $emit('add-branch', n)"
        @edit-branch="(b) => $emit('edit-branch', b)"
        @add-to-branch="(nodeType, b) => $emit('add-to-branch', nodeType, b)"
      />
    </template>
    <template v-else>
      <NodeCard
        :node="node"
        :type-prefix="typePrefix"
        :viewer="viewer"
        :high-light="highLight"
        :theme="theme"
        @edit="(n) => $emit('edit', n)"
        @delete="(n) => $emit('delete', n)"
      />
    </template>

    <!-- 添加按钮（非 end 节点后面才有；fork 容器内自带 joinChildren 渲染，不再此处加按钮） -->
    <AddButton
      v-if="!isFork && baseType !== 'end'"
      :viewer="viewer"
      :type-prefix="typePrefix"
      :dnd-panel="dndPanel"
      @add="(nodeType) => $emit('add', nodeType, node)"
    />

    <!-- fork 容器自己负责渲染 joinChildren 之后的链；条件/普通节点走 children 递归 -->
    <NodeChain
      v-if="!isFork && node.children"
      :node="node.children"
      :type-prefix="typePrefix"
      :viewer="viewer"
      :high-light="highLight"
      :theme="theme"
      :dnd-panel="dndPanel"
      @edit="(n) => $emit('edit', n)"
      @delete="(n) => $emit('delete', n)"
      @add="(nodeType, parentNode) => $emit('add', nodeType, parentNode)"
      @add-branch="(n) => $emit('add-branch', n)"
      @edit-branch="(b) => $emit('edit-branch', b)"
      @add-to-branch="(nodeType, b) => $emit('add-to-branch', nodeType, b)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DingNode, DingConditionNode, DingForkNode, DingBranch } from '../types'
import { isConditionNode, isForkNode } from '../types'
import type { FDHighLightType, FDThemeConfig, FDPatternItem } from '../../types'
import NodeCard from './NodeCard.vue'
import AddButton from './AddButton.vue'
import ConditionGroup from './ConditionGroup.vue'
import ParallelGroup from './ParallelGroup.vue'

const props = defineProps<{
  node: DingNode
  typePrefix: string
  viewer: boolean
  highLight?: FDHighLightType
  theme?: FDThemeConfig
  dndPanel?: FDPatternItem[]
}>()

defineEmits<{
  (e: 'edit', node: DingNode): void
  (e: 'delete', node: DingNode): void
  (e: 'add', nodeType: string, parentNode: DingNode | null): void
  (e: 'add-branch', node: DingNode): void
  (e: 'edit-branch', branch: DingBranch): void
  (e: 'add-to-branch', nodeType: string, branch: DingBranch): void
}>()

const isCondition = computed(() => isConditionNode(props.node))
const isFork = computed(() => isForkNode(props.node))

const baseType = computed(() => {
  if (isCondition.value) return 'condition'
  if (isFork.value) return 'fork'
  return props.node.type.replace(props.typePrefix, '')
})
</script>
