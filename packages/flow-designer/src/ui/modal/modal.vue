<template>
  <MModal v-if="isAntd" v-model:open="visible" title="标题">
    Antd
  </MModal>
  <MModal v-else v-model="visible" title="标题">
    element-plus
  </MModal>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import UIAdapter from '../UIAdapter';
const visible = ref(false)
const uiAdapter = new UIAdapter();
const isAntd = computed(()=>{
  return uiAdapter.isAntd()
})
const MModal = uiAdapter.createModal();
defineExpose({
  show() {
    visible.value = true
  },
})
</script>
<style lang="less" scoped>

</style>