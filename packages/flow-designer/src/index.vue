<template>
  <MDrawer ref="drawerRef" title="我是抽屉" :width="drawerWidth"></MDrawer>
  <MModal ref="modalRef" title="我是弹窗" :width="modalWidth"></MModal>
  <div ref="container" style="width: 100%;height:100%"></div>
</template>
<script lang="ts" setup>
import { PropType, onMounted, ref, watch } from 'vue';

const container = ref<HTMLElement>()
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/style/index.css";
import '@logicflow/extension/lib/style/index.css'
import Flow from './plugins/Flow';
import './plugins/flow.css'
import { FDConfigData, FDControlItem, FDFormType, FDHighLightType, FDPatternItem, FDThemeConfig } from './types';
import { NodeStateEnum } from './types/enums';
import MDrawer from './ui/drawer';
import MModal from './ui/modal';

const drawerRef = ref()
const modalRef = ref()
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
  initDndPanel: { // 是否初始化拖拽面板
    type: Boolean,
    default: true
  },
  dndPanel: { // 拖拽面板
    type: Array as PropType<Array<FDPatternItem>>,
  },
  initControl: { // 是否初始化控制面板
    type: Boolean,
    default: true
  },
  control: { // 控制面板
    type: Array as PropType<Array<FDControlItem>>,
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
  modalWidth: { // 弹窗宽度
    type: [String,Number] as PropType<string | number>,
    default: '60%'
  },
  processForm: { // 流程表单配置
    type: Object as PropType<FDFormType>
  },
  edgeForm: { // 边表单配置
    type: Object as PropType<FDFormType>
  }
})
LogicFlow.use(Flow, {
  ...props,
  drawerRef,
  modalRef,
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
const isHistoryChange = ref(false)
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
  // 监听画布变化事件
  eventCenter.on('history:change', ()=>{
    isHistoryChange.value = true
    emits('update:value', lf.getGraphData())
  })
  // 监听自定义的update:graphModel事件
  eventCenter.on('update:graphModel',()=>{
    isHistoryChange.value = true
    emits('update:value', lf.getGraphData())
  })
  // 监听自定义的update:graphData事件
  eventCenter.on('update:graphData',(data: any) =>{
    // emits('update:value', data)
    myRender(data)
  })
  myRender(props.value)
})
watch(()=>props.value, (newVal)=>{
  if(!isHistoryChange.value) {
    myRender(newVal);
  }
  isHistoryChange.value = false
}, {
  deep: true
})
watch(()=>props.highLight, (newVal)=>{
  setHighLight(newVal)
}, {
  deep: true
})
</script>