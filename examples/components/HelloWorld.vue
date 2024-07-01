<template>
  <button @click="handleClick">切换数据</button>
  <pre>
    {{ graphData }}
  </pre>
  <FlowDesigner v-model:value="graphData"/>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const graphData = ref({
    nodes: [
      {
        id: "1",
        type: "rect",
        x: 100,
        y: 100,
        text: "节点1",
      },
      {
        id: "2",
        type: "circle",
        x: 300,
        y: 200,
        text: "节点2",
      },
    ],
    edges: [
      {
        sourceNodeId: "1",
        targetNodeId: "2",
        type: "polyline",
        text: "连线",
      },
    ],
  });
  const handleClick = () =>{
    graphData.value = {
    nodes: [
      {
        id: "1",
        type: "custom-vue",
        x: 100,
        y: 100,
        text: "节点1",
      },
      {
        id: "2",
        type: "circle",
        x: 300,
        y: 200,
        text: "节点2",
      },
    ],
    edges: [
      {
        sourceNodeId: "1",
        targetNodeId: "2",
        type: "polyline",
        text: "连线",
      },
    ],
  }
  }
</script>
<style scoped>


</style>
