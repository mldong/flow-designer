<template>
  <div ref="container" style="width: 100%;height:100%"></div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

const container = ref<HTMLElement>()
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/style/index.css";
import {Control } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'
import Flow from './plugins/Flow';
LogicFlow.use(Control);
LogicFlow.use(Flow, {
  // defaultEdgeType: 'polyline',
  // 是否初始拖拽面板
  // initDndPanel: false
});
const props = defineProps({
  value: {
    type: Object,
    default() {
      return {}
    }
  }
})
const emits = defineEmits(['update:value'])
const lfInstance = ref();
onMounted(()=>{
  if(!container.value) return;
  lfInstance.value = new LogicFlow({
    container: container.value,
    grid: true,
  });
  const lf = lfInstance.value;
  const { eventCenter } = lf.graphModel;
  eventCenter.on('history:change', ()=>{
    emits('update:value', lf.getGraphData())
  })
  lf.render(props.value);
})
watch(()=>props.value, (newVal)=>{
  lfInstance.value.render(newVal);
}, {
  deep: true
})
</script>