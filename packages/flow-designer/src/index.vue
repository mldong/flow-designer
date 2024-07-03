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
import { NodeStateEnum } from './types/enums';
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
const highLightNodeId = "1";
const highLightEdgeId = "1-2"
LogicFlow.use(Flow, props);
const emits = defineEmits(['update:value'])
const lfInstance = ref();
/**
 * 自定义渲染
 * 1.默认渲染
 * 2.设置高亮属性
 * @param data 
 */
const myRender = (data: any) =>{
  const lf = lfInstance.value;
  if(!lf) return;
  lf.render(data);
  lf.getNodeModelById(highLightNodeId)?.setProperties({
    state: NodeStateEnum.history,
  });
  lf.getEdgeModelById(highLightEdgeId)?.setProperties({
    state: NodeStateEnum.history,
  });
}
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
  myRender(props.value)
})
watch(()=>props.value, (newVal)=>{
  myRender(newVal);
}, {
  deep: true
})
</script>