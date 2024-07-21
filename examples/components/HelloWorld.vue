<template>
  <button @click="handleClick">设置高亮</button>
  <pre>
    {{ graphData?.edges }}
  </pre>
  <FlowDesigner 
  v-model:value="graphData" 
  :theme="theme" 
  :highLight="highLightData"
  :dndPanel="dndPanel"
  @on-init="handleInit"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import FlowDesigner from '../../packages/index'
import { FDHighLightType } from '../../packages/flow-designer/src/types';
import StartSvg from '../../packages/flow-designer/src/assets/start.svg';
import CustomHtml from './CustomHtml';
// import MyInput from './MyInput.vue'
const theme = {
  activeColor: 'red'
}
// const processForm = ref({
//   labelWidth: '130px',
//   formItems: [{
//     name: "name1",
//     label: "流程定义唯一编码1",
//     component: "Input",
//     componentProps: {
//       placeholder: '请输入流程定义唯一编码1'
//     }
//   }, {
//     name: "name",
//     label: "流程定义唯一编码",
//     component: 'Input',
//     componentProps: {
//       placeholder: '请输入流程定义唯一编码'
//     }
//   },]
// })
const highLightData = ref<FDHighLightType>()
const dndPanel = [{
      sort: 1,
      type: 'custom-html-test',
      text: '测试',
      label: '测试',
      icon: StartSvg,
      hide: false,
      nodeClick(event: any){
        console.log('start', event)
      }
    },{
      type: 'subProcess',
      sort: 100,
      drawerTitle: '自定义子流程节点属性',
      form: {
        labelWidth: '130px',
        formItems: [{
          name: "name1",
          label: "流程定义唯一编码1",
          component: 'Input',
          componentProps: {
            placeholder: '请输入流程定义唯一编码1'
          }
        }, ]
      }
    }]
const graphData = ref({
    name: 'leave1',
    displayName: '请假流程',
    postInterceptors: "leave_postInterceptors",
    nodes: [
      {
        id: "1",
        type: "start",
        x: 100,
        y: 100,
        properties: {
          // state: 'history'
          postInterceptors: "start_postInterceptors"
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
          form: 'leaveForm',
          postInterceptors: "task_postInterceptors"
        }
      },
      {
        id: "3",
        type: "end",
        x: 500,
        y: 600,
        text: "结束",
        properties: {
          postInterceptors: "end_postInterceptors"
        }
      },
    ],
    edges: [
      {
        id: "1-2",
        sourceNodeId: "1",
        targetNodeId: "2",
        type: "transition",
        text: "连线",
        properties: {
          // state: 'history'
          expr: "${a} == 1"
        }
      },
      {
        id: "2-3",
        sourceNodeId: "2",
        targetNodeId: "3",
        type: "transition",
        text: "连线2",
        properties: {
          // state: 'history'
          expr: "${a} == 2"
        }
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
  const handleInit = (lf: any) => {
    lf.register(CustomHtml);
  }
</script>
<style scoped>


</style>
