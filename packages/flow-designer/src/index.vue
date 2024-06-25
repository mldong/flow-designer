<template>
  <div ref="container" style="width: 100%;height:100%"></div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const container = ref<HTMLElement>()
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/style/index.css";
import CustomHtml  from './node/CustomHtml'
onMounted(()=>{
  if(!container.value) return;
  const lf = new LogicFlow({
    container: container.value,
    grid: true,
  });
  lf.register(CustomHtml)
  lf.render({
    nodes: [
      {
        id: "1",
        type: "custom-html",
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
})
</script>