<template>
  <MDrawer ref="drawerRef" title="我是抽屉" :width="drawerWidth"></MDrawer>
  <MModal ref="modalRef" title="我是弹窗" :width="modalWidth"></MModal>
  <div ref="container" :class="{ fullscreen: isFullscreen }" style="width: 100%;height:100%"></div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

const container = ref<HTMLElement>()
import LogicFlow from "@logicflow/core";
import "@logicflow/core/lib/style/index.css";
import '@logicflow/extension/lib/style/index.css'
import Flow from './plugins/Flow';
import './plugins/flow.css'
import type {  FDHighLightType } from './types';
import { MldongFlowDesignerProps } from './types/props'
import { NodeStateEnum } from './types/enums';
import MDrawer from './ui/drawer';
import MModal from './ui/modal';
// 添加全屏状态
const isFullscreen = ref(false);
const drawerRef = ref()
const modalRef = ref()
const props = defineProps(MldongFlowDesignerProps)
/**
 * 更新全屏控制按钮的文本和图标
 */
const updateFullscreenControl = () => {
  // 通过更具体的选择器定位全屏按钮
  const fullscreenControlItem = document.querySelector('.lf-control-item .lf-control-fullscreen');
  if (fullscreenControlItem) {
    const parentItem = fullscreenControlItem.closest('.lf-control-item');
    if (parentItem) {
      // 只修改全屏按钮的文本
      const textElement = parentItem.querySelector('.lf-control-text');
      if (textElement) {
        textElement.textContent = isFullscreen.value ? '退出全屏' : '全屏';
      }
      
      // 更新图标类名
      fullscreenControlItem.className = `lf-control-fullscreen ${isFullscreen.value ? 'exit' : 'enter'}`;
    }
  }
};
/**
 * 切换全屏状态
 */
 const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    enterFullscreen();
  } else {
    exitFullscreen();
  }
  updateFullscreenControl();
};
LogicFlow.use(Flow, {
  ...props,
  drawerRef,
  modalRef,
  toggleFullscreen,
});
const emits = defineEmits(['update:value', 'on-init', 'on-render', 'on-save'])
const lfInstance = ref();


/**
 * 进入全屏
 */
const enterFullscreen = () => {
  if (container.value) {
    container.value.requestFullscreen?.().catch(err => {
      console.warn('无法进入全屏模式:', err);
    });
  }
};

/**
 * 退出全屏
 */
const exitFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(err => {
      console.warn('无法退出全屏模式:', err);
    });
  }
};

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
    isSilentMode: props.viewer,
    allowResize: true
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
  // 监听自定义的update:highlight事件
  eventCenter.on('update:highlight',(data: any) =>{
    setHighLight(data)
  })
  // 监听自定义的save事件
  eventCenter.on('custom:save', (data: any) =>{
    emits('on-save', data)
  })
  myRender(props.value)
  // 监听键盘ESC事件退出全屏
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen.value) {
      isFullscreen.value = false;
    }
  });
  
  // 监听全屏变化事件
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      isFullscreen.value = false;
    }
  });
  updateFullscreenControl()
})
// 暴露 lf 实例给 Playwright/测试用：
//   浏览器 console: __vue_app__.config.globalProperties 或组件 ref.__vueParentComponent.exposed.lf
//   Playwright evaluate: const el = document.querySelector('...'); el.__vueParentComponent.exposed.lf
defineExpose({
  lf: lfInstance,
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
<style scoped>
.flow-container {
  width: 100%;
  height: 100%;
}

.flow-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.fullscreen-control {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.fullscreen-btn {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.fullscreen-btn:hover {
  background-color: #40a9ff;
}
</style>