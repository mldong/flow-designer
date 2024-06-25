<template>
  <div>isHovered:{{ model?.isHovered }}-isSelected:{{ model?.isSelected }}</div>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import { BaseNodeModel } from '@logicflow/core'
defineProps({
  model: {
    type: Object as PropType<BaseNodeModel>,
    required: true
  },
  isHovered: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})
</script>
<style lang="less" scoped>

</style>