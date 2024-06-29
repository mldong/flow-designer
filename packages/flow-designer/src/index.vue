<template>
  <button @click="handleClick">打印数据</button>
  <div ref="container" style="width: 100%;height:100%"></div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';

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
const lfInstance = ref();
onMounted(()=>{
  if(!container.value) return;
  lfInstance.value = new LogicFlow({
    container: container.value,
    grid: true,
    style: { // 配置默认主题
      circle: {
        stroke: "red",
        fill: "yellow"
      },
      baseEdge: {
        stroke: 'red'
      }
    }
  });
  const lf = lfInstance.value;
  // 控制面板-移除下一步
  lf.extension.control.removeItem('redo')
  // 控制面板-重新追加下一步
  lf.extension.control.addItem({
      key: 'redo',
      iconClass: 'lf-control-redo',
      title: '移到下一步',
      text: '下一步',
      onClick: () => {
        lf.redo();
      },
    },)
  // 控制面板-清空画布
  lf.extension.control.addItem({
    iconClass: 'lf-control-redo',
    title: 'clear',
    text: '清空',
    onClick: () => {
      lf.clearData()
    }
  })
  // 设置默认主题
  lf.setTheme({
    circle: {
      stroke: "red",
      fill: "yellow"
    },
    edgeText: {
      fontSize: 30
    }
  });
  // 事件中心
  const { eventCenter } = lf.graphModel;
  // 节点点击事件
  eventCenter.on('node:click',(e: any) =>{
    if(e.data.type === 'custom-vue') return;
    alert(e.data.type)
    console.log('node:click', e)
  })
  // 边点击事件
  eventCenter.on('edge:click', (e: any) => {
    alert(e.data.type)
    console.log('edge:click', e)

  })
  // 画布右键事件
  eventCenter.on('blank:contextmenu', (e: any) => {
    alert('blank:contextmenu')
    console.log('blank:contextmenu', e)
  })
  // 监听自定义事件node-vue:click
  eventCenter.on('node-vue:click', (e: any) => {
    alert(e.data.type)
    console.log('node-vue:click', e)
  })
  lf.adapterIn = (userData: any) =>{
    console.log('adapterIn', userData)
    // 绑定name和displayName到graphModel
    lf.graphModel.name = userData.name
    lf.graphModel.displayName = userData.displayName
    return userData;
  }
  lf.adapterOut = (userData: any) =>{
    // console.log('adapterOut', userData)
    // 从graphModel取出name和displayName
    return {
      ...userData,
      name: lf.graphModel.name,
      displayName: lf.graphModel.displayName
    };
  }
  lf.render({
    name: 'leave',
    displayName: '请假流程',
    nodes: [
    ],
    edges: [],
  });
})
const handleClick = () =>{
  console.log(lfInstance.value.getGraphData())
}
</script>