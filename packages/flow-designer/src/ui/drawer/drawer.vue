<template>
  <MDrawer v-if="isAntd" :open="visible" :title="mTitle" @close="visible=false">
    antd
  </MDrawer>
  <MDrawer v-else  v-model="visible" :title="title">
    element-plus
  </MDrawer>
</template>
<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue';
import UIAdapter from '../UIAdapter';
const visible = ref(false)
const props = defineProps({
  title: { // 标题
    type: String as PropType<string>
  },
})
const mTitle = ref(props.title)
watch(()=>props.title,()=>{
  mTitle.value = props.title
})
const uiAdapter = new UIAdapter();
const isAntd = computed(()=>{
  return uiAdapter.isAntd()
})
const MDrawer = uiAdapter.createDrawer();
defineExpose({
  show(e: any){
    if(e.data.type == 'process') {
      mTitle.value = '设置流程属性'
    } else if(e.data.type == 'subProcess') {
      mTitle.value = '设置子流程属性'
    } else if(e.data.type == 'decision') {
      mTitle.value = '设置决策节点属性'
    } else if(e.data.type == 'fork') {
      mTitle.value = '设置分支节点属性'
    } else if(e.data.type == 'join') {
      mTitle.value = '设置合并节点属性'
    } else if(e.data.type == 'transition') {
      mTitle.value = '设置边属性'
    } else {
      if(e.data.text?.value) {
        mTitle.value = `设置【${e.data.text.value}】属性`
      } else {
        mTitle.value = '设置属性'
      }
    }
    console.log(e)
    visible.value = true
  }
})
</script>
<style lang="less" scoped>

</style>