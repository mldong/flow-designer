<template>
  <div ref="container" style="width: 100%;height:100%"></div>
</template>
<script lang="ts" setup>
import { PropType, onMounted, ref, watch } from 'vue';

const container = ref<HTMLElement>()
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/style/index.css";
import { Control } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css'
import Flow from './plugins/Flow';
import { FDConfigData, FDThemeConfig } from './types';
LogicFlow.use(Control);
const props = defineProps({
  value: {
    type: Object as PropType<FDConfigData>,
    default() {
      return {}
    }
  },
  theme: {
    type: Object as PropType<FDThemeConfig>,
    default() {
      return {
        
      }
    }
  }
})
LogicFlow.use(Flow, props);
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