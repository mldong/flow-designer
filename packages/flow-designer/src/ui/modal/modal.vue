<template>
  <MModal v-if="isAntd" v-model:open="visible" :title="mTitle">
    <div style="height:600px;overflow-y: scroll;">
      <MTextarea style="height:100%;" v-model:value="graphData" v-if="['import', 'highlight'].includes(type)"></MTextarea>
      <vue-json-pretty v-else :showLineNumber="true" :data="graphData" />
    </div>
    <template #footer>
      <div v-if="['import', 'highlight'].includes(type)">
        <MButton  @click="visible=false">取消</MButton>
        <MButton type="primary" @click="handleSumit">确定</MButton>
      </div>
      <MButton v-else type="primary" @click="handleCopy">复制</MButton>
    </template>
  </MModal>
  <MModal v-else v-model="visible" :title="mTitle">
    <div style="height:600px;overflow-y: scroll;">
      <MTextarea style="height:100%;" v-model:value="graphData" v-if="['import', 'highlight'].includes(type)"></MTextarea>
      <vue-json-pretty v-else :showLineNumber="true" :data="graphData" />
    </div>
    <template #footer>
      <div v-if="['import', 'highlight'].includes(type)">
        <MButton  @click="visible=false">取消</MButton>
        <MButton type="primary" @click="handleSumit">确定</MButton>
      </div>
      <MButton v-else type="primary" @click="handleCopy">复制</MButton>
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
const graphData = ref()
const mTitle = ref(props.title)
const type = ref('see')
const lf = ref()
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
const MTextarea = uiAdapter.createTextarea();
const handleCopy = () =>{
  // 处理复制
  navigator.clipboard.writeText(JSON.stringify(graphData.value, null, 2)).then(()=>{
    MMessage.success('复制成功')
  }).catch((err)=>{
    MMessage.error('复制失败', err);
  })
}
const handleSumit = () =>{
  // 处理导入
  const jsonObj = JSON.parse(graphData.value || '{}')
  const { eventCenter } = lf.value.graphModel;
  // 触发自定义的update:graphData
  if(type.value == 'import') {
    eventCenter.emit("update:graphData", jsonObj);
  } else if(type.value == 'highlight') {
    eventCenter.emit("update:highlight", jsonObj);
  }
  visible.value = false
}
defineExpose({
  show(e: any) {
    type.value = e.type
    lf.value = e.lf
    if(e.type == 'import') {
      mTitle.value = "导入流程数据"
    } else if (e.type == 'highlight') {
      mTitle.value = "设置高亮数据"
    } else {
      mTitle.value = "查看流程数据"
    }
    graphData.value = e.graphData
    visible.value = true
  },
})
</script>
<style lang="less" scoped>

</style>