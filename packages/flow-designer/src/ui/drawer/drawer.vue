<template>
  <MDrawer v-if="isAntd" :open="visible" :title="mTitle" @close="visible=false" :width="width">
    {{ formState }}
    <MMorm :model="formState" v-if="form.formItems?.length" :label-col="{
      flex: form.labelWidth || '100px'
    }">
      <MFormItem :name="item.name" :label="item.label" v-for="item in form.formItems">
        <MInput v-if="item.component == 'Input'" v-model:value="formState[item.name]" v-bind="{...item.componentProps}"></MInput>
        <MSelect v-else-if="item.component == 'Select'" v-model:value="formState[item.name]" v-bind="{...item.componentProps}"></MSelect>
        <component v-else :is="item.render?item.render(currentData): undefined" v-model:value="formState[item.name]" v-model="formState[item.name]"   />
      </MFormItem>
    </MMorm>
  </MDrawer>
  <MDrawer v-else  v-model="visible" :title="title" :size="width">
    {{ formState }}
    <MMorm :model="formState" v-if="form.formItems?.length" :label-width="form.labelWidth || '100px'">
      <MFormItem :prop="item.name" :label="item.label" v-for="item in form.formItems">
        <MInput v-if="item.component == 'Input'" v-model="formState[item.name]" v-bind="{...item.componentProps}"></MInput>
        <MSelect v-else-if="item.component == 'Select'" v-model="formState[item.name]" v-bind="{...item.componentProps}">
          <MOption v-for="(itemm,index) in item.componentProps?.options || []" :key="index" :label="itemm.label" :value="itemm.value" />
        </MSelect>
        <component v-else :is="item.render?item.render(currentData): undefined" v-model:value="formState[item.name]" v-model="formState[item.name]"/>
      </MFormItem>
    </MMorm>
  </MDrawer>
</template>
<script setup lang="ts">
import { computed, PropType, reactive, ref, watch } from 'vue';
import UIAdapter from '../UIAdapter';
import { FDFormType } from '../../types';
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
const formState = reactive<any>({})
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
const MSelect = uiAdapter.createSelect();
const MOption = uiAdapter.createOption();
const form = ref<FDFormType>({} as any)
const currentData = ref()
defineExpose({
  show(e: any){
    currentData.value = e;
    Object.keys(formState).forEach(key=>{
      formState[key] = undefined
    })
    form.value = e.patternItem?.form || {}
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
    visible.value = true
  }
})
</script>
<style lang="less" scoped>

</style>