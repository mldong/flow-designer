<template>
  <button @click="handleClick">设置高亮</button>
  <FlowDesigner v-model:value="graphData" :theme="theme" :highLight="highLightData"/>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { FDHighLightType } from '../../packages/flow-designer/src/types';
const theme = {
  activeColor: 'red'
}
const highLightData = ref<FDHighLightType>()
const graphData = ref({
    nodes: [
      {
        id: "1",
        type: "custom-rect",
        x: 100,
        y: 100,
        text: "节点1",
        properties: {
          // state: 'history'
        }
      },
      {
        id: "2",
        type: "custom-rect",
        x: 300,
        y: 200,
        text: "节点2",
        properties: {
          // state: 'active'
        }
      },
      {
        id: "3",
        type: "custom-rect",
        x: 500,
        y: 600,
        text: "节点2",
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
