<template>
  <!-- <button @click="handleClick">设置高亮</button> -->
  <!-- <pre>
    {{ graphData }}
  </pre> -->
  <FlowDesigner
  v-model:value="graphData" 
  :theme="theme"
  :highLight="highLightData"
  @on-init="handleInit"
  @on-save="handleSave"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import FlowDesigner from '../../packages/index'
// import FlowDesigner from 'mldong-flow-designer-plus'
// import 'mldong-flow-designer-plus/lib/style.css'
import type { FDHighLightType } from '../../packages/flow-designer/src/types';
import CustomHtml from './CustomHtml';
import LeaveJson from '../assets/leave.json'
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
// const dndPanel :Array<FDPatternItem>= [{
//       sort: 1,
//       type: 'custom-html-test',
//       text: '测试',
//       label: '测试',
//       icon: StartSvg,
//       hide: false,
//       nodeClick(event: any){
//         console.log('start', event)
//       }
//     },{
//       type: 'subProcess',
//       sort: 100,
//       drawerTitle: '自定义子流程节点属性',
//       form: {
//         labelWidth: '130px',
//         formItems: [{
//           name: "name1",
//           label: "流程定义唯一编码1",
//           component: 'Input',
//           componentProps: {
//             placeholder: '请输入流程定义唯一编码1'
//           }
//         }, ]
//       }
//     }]
// const control = [{
//   key: 'save',
//   // hide: true
// }, {
//       key: 'my-zoom-out',
//       iconClass: 'lf-control-save',
//       title: '自定义保存',
//       text: '自定义保存',
//       // sort: 45,
//       onClick: (lf: any) => {
        
//         console.log(lf.getGraphData())
//       },
//     },]
const graphData = ref(LeaveJson);
  // const handleClick = () =>{
  //   highLightData.value = {
  //     "historyNodeNames": ["1"],
  //     "historyEdgeNames": ["1-2"],
  //     "activeNodeNames": ["2"]
  //   }
  // }
  const handleInit = (lf: any) => {
    lf.register(CustomHtml);
  }
  const handleSave = (data: any) => {
    console.log('save', data)
  } 
</script>
<style>

.lf-control-myicon {
  background: url('../../packages/flow-designer/src/assets/start.svg');
}

</style>
