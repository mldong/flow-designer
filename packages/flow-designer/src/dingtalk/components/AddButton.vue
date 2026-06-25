<template>
  <!-- 可插入：上线 + 圆 + 下线 -->
  <div class="ding-add-btn" v-if="!viewer && !readonly">
    <div class="ding-line-vertical"></div>
    <button class="ding-add-btn__circle" @click.stop="toggleSelector">+</button>
    <div class="ding-line-vertical"></div>
    <NodeSelector
      :visible="showSelector"
      :dnd-panel="dndPanel"
      :type-prefix="typePrefix"
      @update:visible="showSelector = $event"
      @select="handleSelect"
    />
  </div>
  <!-- 受保护节点后：仅渲染短连接线（不显示 + 圆） -->
  <div class="ding-add-btn ding-add-btn--readonly" v-else-if="!viewer && readonly">
    <div class="ding-line-vertical ding-line-vertical--short"></div>
  </div>
  <!-- viewer 模式 -->
  <div class="ding-add-btn" v-else>
    <div class="ding-line-vertical"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FDPatternItem } from '../../types'
import NodeSelector from './NodeSelector.vue'

withDefaults(
  defineProps<{
    viewer: boolean
    typePrefix: string
    dndPanel?: FDPatternItem[]
    /** 不可插入：仅渲染短连接线，不显示 + 圆 */
    readonly?: boolean
  }>(),
  { readonly: false }
)

const emit = defineEmits<{
  (e: 'add', nodeType: string): void
}>()

const showSelector = ref(false)

function toggleSelector() {
  showSelector.value = !showSelector.value
}

function handleSelect(nodeType: string) {
  emit('add', nodeType)
  showSelector.value = false
}
</script>
