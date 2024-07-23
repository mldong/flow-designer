<template>
  <MModal v-if="isAntd" v-model:open="visible" :title="mTitle">
    <div style="height:600px;overflow-y: scroll;">
      <vue-json-pretty :showLineNumber="true" :data="graphModel" />
    </div>
    <template #footer>
      <MButton type="primary" @click="handleCopy">复制</MButton>
    </template>
  </MModal>
  <MModal v-else v-model="visible" :title="mTitle">
    <div style="height:600px;overflow-y: scroll;">
      <vue-json-pretty :showLineNumber="true" :data="graphModel" />
    </div>
    <template #footer>
      <MButton type="primary" @click="handleCopy">复制</MButton>
    </template>
  </MModal>
</template>
<script setup lang="ts">
import { computed, ref, PropType, watch } from 'vue';
import UIAdapter from '../UIAdapter';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import MButton from '../button'
const visible = ref(false)
const props = defineProps({
  title: { // 标题
    type: String as PropType<string>
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
let MMessage: any;
uiAdapter.createMessage()?.then((res)=>{
  MMessage = res.default
})
const MModal = uiAdapter.createModal();
const handleCopy = () =>{
  navigator.clipboard.writeText(JSON.stringify(graphModel.value, null, 2)).then(()=>{
    MMessage.success('复制成功')
  }).catch((err)=>{
    MMessage.error('复制失败', err);
  })
}
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