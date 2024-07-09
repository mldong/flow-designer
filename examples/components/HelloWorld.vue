<template>
  <button @click="handleClick">设置高亮</button>
  <FlowDesigner 
  v-model:value="graphData" 
  :theme="theme" 
  :highLight="highLightData"
  :nodeClick="handleNodeClick"
  :edgeClick="handleEdgeClick"
  :dndPanel="dndPanel"/>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { FDHighLightType } from '../../packages/flow-designer/src/types';
import StartSvg from '../../packages/flow-designer/src/assets/start.svg';
const theme = {
  activeColor: 'red'
}
const handleNodeClick = (event: any) => {
  console.log('handleNodeClick', event)
}
const handleEdgeClick = (event: any) => {
  console.log('handleEdgeClick', event)
}
const highLightData = ref<FDHighLightType>()
const dndPanel = [{
      type: 'start',
      text: '开始1',
      label: '开始节点1',
      icon: StartSvg,
      hide: false,
      nodeClick(event: any){
        console.log('start', event)
      }
    },]
const graphData = ref({
    nodes: [
      {
        id: "1",
        type: "start",
        x: 100,
        y: 100,
        properties: {
          // state: 'history'
        }
      },
      {
        id: "2",
        type: "task",
        x: 300,
        y: 200,
        text: "节点2",
        properties: {
          // state: 'active'
        }
      },
      {
        id: "3",
        type: "end",
        x: 500,
        y: 600,
        text: "结束",
        properties: {
          
        }
      },
    ],
    edges: [
      {
        id: "1-2",
        sourceNodeId: "1",
        targetNodeId: "2",
        type: "custom-edge",
        text: "连线",
        properties: {
          // state: 'history'
        }
      },
      {
        id: "2-3",
        sourceNodeId: "2",
        targetNodeId: "3",
        type: "custom-edge",
        text: "连线2",
      },
    ],
  });
  const handleClick = () =>{
    highLightData.value = {
      historyNodeNames: ['1'],
      historyEdgeNames: ['1-2'],
      activeNodeNames: ['2']
    }
  }
</script>
<style scoped>


</style>
