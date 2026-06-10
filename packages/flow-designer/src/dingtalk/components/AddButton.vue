<template>
  <div class="ding-add-btn" v-if="!viewer">
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
  <div class="ding-add-btn" v-else>
    <div class="ding-line-vertical"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FDPatternItem } from '../../types'
import NodeSelector from './NodeSelector.vue'

defineProps<{
  viewer: boolean
  typePrefix: string
  dndPanel?: FDPatternItem[]
}>()

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
