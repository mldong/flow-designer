<template>
  <MModal v-if="isAntd" v-model:open="visible" :title="mTitle">
    <div style="height:600px;overflow-y: scroll;">
      <vue-json-pretty :data="graphModel" />
    </div>
  </MModal>
  <MModal v-else v-model="visible" :title="mTitle">
    <div style="height:600px;overflow-y: scroll;">
      <vue-json-pretty :data="graphModel" />
    </div>
  </MModal>
</template>
<script setup lang="ts">
import { computed, ref, PropType, watch } from 'vue';
import UIAdapter from '../UIAdapter';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
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
const graphModel = ref({})
const mTitle = ref(props.title)
watch(()=>props.title,()=>{
  mTitle.value = props.title
})
const uiAdapter = new UIAdapter();
const isAntd = computed(()=>{
  return uiAdapter.isAntd()
})
const MModal = uiAdapter.createModal();
defineExpose({
  show(e: any) {
    mTitle.value = "查看流程数据"
    graphModel.value = e.graphModel
    visible.value = true
  },
})
</script>
<style lang="less" scoped>

</style>