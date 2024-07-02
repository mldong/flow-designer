<template>
  <FlowDesigner v-model:value="graphData"/>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const graphData = ref({
    nodes: [
      {
        id: "1",
        type: "custom-rect",
        x: 100,
        y: 100,
        text: "节点1",
        properties: {
          state: 'history'
        }
      },
      {
        id: "2",
        type: "custom-rect",
        x: 300,
        y: 200,
        text: "节点2",
        properties: {
          state: 'active'
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
        sourceNodeId: "1",
        targetNodeId: "2",
        type: "polyline",
        text: "连线",
      },
    ],
  });
</script>
<style scoped>


</style>
