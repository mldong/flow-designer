<template>
  <MDrawer v-if="isAntd" :open="visible" :title="title" @close="visible=false">
    antd
  </MDrawer>
  <MDrawer v-else  v-model="visible" :title="title">
    element-plus
  </MDrawer>
</template>
<script setup lang="ts">
import { computed, PropType, ref } from 'vue';
import UIAdapter from '../UIAdapter';
const visible = ref(false)
defineProps({
  title: { // 标题
    type: String as PropType<string>
  },
})
const uiAdapter = new UIAdapter();
const isAntd = computed(()=>{
  return uiAdapter.isAntd()
})
const MDrawer = uiAdapter.createDrawer();
defineExpose({
  show(){
    visible.value = true
  }
})
</script>
<style lang="less" scoped>

</style>