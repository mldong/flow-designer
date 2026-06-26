<template>
  <!-- <button @click="handleClick">设置高亮</button> -->
  <!-- <pre>
    {{ graphData }}
  </pre> -->
  <!--
    模式切换按钮：仅 dev 环境（演示站）可见。
    线上环境业务方只有一个模式（钉钉），不需要切换。
    演示站为了对比画布/钉钉两种渲染效果才增加这个开关。
    import.meta.env.DEV: vite dev 模式为 true，build 后为 false。
  -->
  <div v-if="showModeSwitch" class="mode-switcher" :class="{ 'is-mobile': isMobile }">
    <button :class="{ active: designerMode === 'canvas' }" @click="designerMode = 'canvas'">画布模式</button>
    <button :class="{ active: designerMode === 'dingtalk' }" @click="designerMode = 'dingtalk'">钉钉模式</button>
  </div>
  <FlowDesigner

  v-model:value="graphData"
  :mode="designerMode"
  :theme="theme"
  :highLight="highLightData"
  :process-form="processForm"
  @on-init="handleInit"
  @on-save="handleSave"
  />
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
const designerMode = ref<'canvas' | 'dingtalk'>('canvas')

/**
 * 是否显示模式切换按钮（画布/钉钉）
 * - dev 环境（pnpm dev / 演示站）：显示
 * - build 后（线上环境）：自动隐藏（import.meta.env.DEV === false）
 * 线上环境业务方只有一个模式（钉钉），不需要切换控件。
 */
const showModeSwitch = computed(() => import.meta.env.DEV)

// 响应式状态 - 监听窗口尺寸
const isMobile = ref(window.innerWidth < 768)

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
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
// 流程属性表单（钉钉模式右键无回调时 fallback 自动打开内置抽屉）
const processForm = {
  labelWidth: '130px',
  formItems: [
    {
      name: 'name',
      label: '流程编码',
      component: 'Input',
      componentProps: { placeholder: '请输入流程定义唯一编码' }
    },
    {
      name: 'displayName',
      label: '流程名称',
      component: 'Input',
      componentProps: { placeholder: '请输入流程显示名称' }
    },
    {
      name: 'type',
      label: '流程类型',
      component: 'Select',
      defaultValue: 'snaker',
      componentProps: {
        placeholder: '请选择流程类型',
        options: [
          { label: '主流程', value: 'snaker' },
          { label: '子流程', value: 'sub' }
        ]
      }
    }
  ]
}
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
    // 钉钉模式 emit 的 api 实例没有 register 方法（只在画布模式的 lf 上存在）
    if (typeof lf?.register === 'function') {
      lf.register(CustomHtml);
    }
  }
  const handleSave = (data: any) => {
    console.log('save', data)
  } 
</script>
<style>
.mode-switcher {
  position: fixed;
  top: 24px;
  left: 320px;
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

/* 移动端响应式适配 (< 768px) */
@media (max-width: 768px) {
  .mode-switcher {
    top: 16px;
    left: 16px;
    padding: 2px;
    gap: 2px;
  }
  .mode-switcher button {
    padding: 4px 10px;
    font-size: 11px;
  }
}

.lf-control-myicon {
  background: url('../../packages/flow-designer/src/assets/start.svg');
}

</style>
