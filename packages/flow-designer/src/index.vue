<template>
  <MDrawer ref="drawerRef" title="我是抽屉" :width="drawerWidth"></MDrawer>
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
import { FDConfigData, FDFormType, FDHighLightType, FDPatternItem, FDThemeConfig } from './types';
import { NodeStateEnum } from './types/enums';
import MDrawer from './ui/drawer';
const drawerRef = ref()
LogicFlow.use(Control);
const props = defineProps({
  value: {
    type: Object as PropType<FDConfigData>,
    default() {
      return {}
    }
  },
  theme: { // 高亮主题配置
    type: Object as PropType<FDThemeConfig>,
    default() {
      return {
        
      }
    }
  },
  highLight: { // 高亮数据
    type: Object as PropType<FDHighLightType>,
      default() {
      return {
        
      }
    }
  },
  dndPanel: { // 拖拽面板
    type: Array as PropType<Array<FDPatternItem>>,
  },
  nodeClick: { // 节点点击事件
    type: Function,
  },
  edgeClick: { // 边点击事件
    type: Function,
  },
  drawerWidth: { // 抽屉宽度
    type: [String,Number] as PropType<string | number>,
    default: '600px'
  },
  processForm: { // 流程表单配置
    type: Object as PropType<FDFormType>
  }
})
LogicFlow.use(Flow, {
  ...props,
  drawerRef,
});
const emits = defineEmits(['update:value', 'on-init', 'on-render'])
const lfInstance = ref();
/**
 * 设置高亮数据
 * @param data 
 */
const setHighLight = (data: FDHighLightType) =>{
  if(!data) return;
  const lf = lfInstance.value;
  if(!lf) return;
  // 设置历史节点state属性为history
  if(Array.isArray(data.historyNodeNames) && data.historyNodeNames.length) {
    data.historyNodeNames.forEach(nodeId=>{
      lf.getNodeModelById(nodeId)?.setProperties({
        state: NodeStateEnum.history,
      });
    })
  }
  // 设置历史边state属性为history
  if(Array.isArray(data.historyEdgeNames) &&data.historyEdgeNames.length) {
    data.historyEdgeNames.forEach(edgeId=>{
      lf.getEdgeModelById(edgeId)?.setProperties({
      state: NodeStateEnum.history,
    });
    })
  }
  // 设置活跃节点state属性为active
  if(Array.isArray(data.activeNodeNames) && data.activeNodeNames.length) {
    data.activeNodeNames.forEach(nodeId=>{
      lf.getNodeModelById(nodeId)?.setProperties({
        state: NodeStateEnum.active,
      });
    })
  }
}
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
  // 设置亮亮数据
  setHighLight(props.highLight)
  // emits render事件
  emits('on-render', lf)
}
onMounted(()=>{
  if(!container.value) return;
  lfInstance.value = new LogicFlow({
    container: container.value,
    grid: true,
  });
  const lf = lfInstance.value;
  // emits初始化事件
  emits('on-init', lf)
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
watch(()=>props.highLight, (newVal)=>{
  setHighLight(newVal)
}, {
  deep: true
})
</script>