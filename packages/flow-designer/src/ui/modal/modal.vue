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
      <MTextarea input-style="height:600px;" type="textarea" v-model="graphData" v-if="['import', 'highlight'].includes(type)"></MTextarea>
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
const handleCopy = async () => {
  try {
    const text = JSON.stringify(graphData.value, null, 2)
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // 使用兼容方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    MMessage.success('复制成功')
  } catch (err) {
    MMessage.error(`复制失败: ${err instanceof Error ? err.message : String(err)}`)
  }
}
const handleSumit = () =>{
  // 处理导入
  try {
    const jsonObj = JSON.parse(graphData.value || '{}')
    const { eventCenter } = lf.value.graphModel;
    // 触发自定义的update:graphData
    if(type.value == 'import') {
      eventCenter.emit("update:graphData", jsonObj);
      MMessage.success('导入成功')
    } else if(type.value == 'highlight') {
      eventCenter.emit("update:highlight", jsonObj);
      MMessage.success('设置高亮成功')
    }
    visible.value = false
  } catch(err) {
    MMessage.error('数据格式错误')
    return
  }
  
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