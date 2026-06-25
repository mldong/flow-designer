<template>
  <!-- <button @click="handleClick">设置高亮</button> -->
  <!-- <pre>
    {{ graphData }}
  </pre> -->
  <div class="mode-switcher">
    <button :class="{ active: designerMode === 'canvas' }" @click="designerMode = 'canvas'">画布模式</button>
    <button :class="{ active: designerMode === 'dingtalk' }" @click="designerMode = 'dingtalk'">钉钉模式</button>
  </div>
  <FlowDesigner
  
  v-model:value="graphData" 
  :mode="designerMode"
  :theme="theme"
  :highLight="highLightData"
  @on-init="handleInit"
  @on-save="handleSave"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue';
const designerMode = ref<'canvas' | 'dingtalk'>('canvas')
//import FlowDesigner from 'mldong-flow-designer-plus'
//import 'mldong-flow-designer-plus/lib/style.css'
import FlowDesigner from '../../packages/index'
import type { FDHighLightType } from '../../packages/flow-designer/src/types';
import CustomHtml from './CustomHtml';
import LeaveJson from '../assets/wf-leave.json'
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
.mode-switcher {
  position: fixed;
  left: 50%;
  top: 24px;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.mode-switcher button {
  padding: 5px 14px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: #606266;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
}
.mode-switcher button.active {
  background: #3068EC;
  color: #fff;
  box-shadow: 0 1px 4px rgba(48, 104, 236, 0.3);
}
.mode-switcher button:hover:not(.active) {
  background: rgba(48, 104, 236, 0.08);
  color: #3068EC;
}

.lf-control-myicon {
  background: url('../../packages/flow-designer/src/assets/start.svg');
}

</style>
