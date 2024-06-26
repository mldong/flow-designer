<template>
  <div ref="container" style="width: 100%;height:100%"></div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const container = ref<HTMLElement>()
import LogicFlow from "@logicflow/core";
import "@logicflow/core/dist/style/index.css";
import CustomVue  from './node/CustomVue'
import CustomEdge from './edge/CustomEdge'
onMounted(()=>{
  if(!container.value) return;
  const lf = new LogicFlow({
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
  lf.register(CustomVue)
  lf.register(CustomEdge)
  lf.setDefaultEdgeType("custom-edge")
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
  lf.render({
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
        type: "custom-edge",
        text: "连线",
      },
    ],
  });
})
</script>