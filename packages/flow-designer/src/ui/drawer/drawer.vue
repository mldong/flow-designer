<template>
  <MDrawer v-if="isAntd" :open="visible" :title="mTitle" @close="visible=false" :width="width">
    {{ formState }}
    <MMorm :model="formState">
      <MFormItem name="title" label="标题">
        <MInput v-model:value="formState.title" placeholder="请输入标题"></MInput>
      </MFormItem>
    </MMorm>
  </MDrawer>
  <MDrawer v-else  v-model="visible" :title="title" :size="width">
    {{ formState }}
    <MMorm :model="formState">
      <MFormItem prop="title" label="标题">
        <MInput v-model="formState.title" placeholder="请输入标题"></MInput>
      </MFormItem>
    </MMorm>
  </MDrawer>
</template>
<script setup lang="ts">
import { computed, PropType, reactive, ref, watch } from 'vue';
import UIAdapter from '../UIAdapter';
const visible = ref(false)
const props = defineProps({
  title: { // 标题
    type: String as PropType<string>
  },
  width: { // 抽屉宽度
    type: [String,Number] as PropType<string | number>,
    default: '600px'
  }
})
const mTitle = ref(props.title)
const formState = reactive({
  title: ''
})
watch(()=>props.title,()=>{
  mTitle.value = props.title
})
const uiAdapter = new UIAdapter();
const isAntd = computed(()=>{
  return uiAdapter.isAntd()
})
const MDrawer = uiAdapter.createDrawer();
const MMorm = uiAdapter.createForm();
const MFormItem = uiAdapter.createFormItem();
const MInput = uiAdapter.createInput();
defineExpose({
  show(e: any){
    if(e.data.type == 'process') {
      mTitle.value = '设置流程属性'
    } else if(e.data.type == 'transition') {
      mTitle.value = '设置边属性'
    } else {
      if(e.patternItem?.drawerTitle) {
        mTitle.value = e.patternItem?.drawerTitle
      } else {
        if(e.patternItem?.text) {
          mTitle.value = `设置【${e.patternItem?.text.replace('节点','')}】节点属性`
        } else {
          mTitle.value = '设置属性'
        }
      }
    }
    console.log(e)
    visible.value = true
  }
})
</script>
<style lang="less" scoped>

</style>