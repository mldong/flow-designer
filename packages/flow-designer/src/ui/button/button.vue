<template>
  <MButton :type="type" :size="size" v-if="isAntd" :shape="circle?'circle': 'default'">
    <slot></slot>
  </MButton>
  <MButton :type="type" :size="size=='middle'?'default':size" :circle="circle" v-else>
    <slot></slot>
  </MButton>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import UIAdapter from '../UIAdapter';
defineProps({
  type: { // 按钮类型
    type: String as PropType<any>
  },
  size: { // 按钮大小
    // antd: large | middle | small	
    // element-plus： 'large'| 'default'| 'small'
    type: String as PropType<'large'| 'middle'| 'small'>
  },
  circle: { // 是否为圆角按钮
    type: Boolean as PropType<boolean>
  }
})
const uiAdapter = new UIAdapter();
const isAntd = computed(()=>{
  return uiAdapter.isAntd()
})

const MButton = uiAdapter.createButton();
/**
 * 注意事项
 * 1. 明确一点，我们这里按钮组件其实是自定义组件，但是又不是完全地自定义组件
 * 因为他有antd特性，也有element-plus特性，所以这里需要做一下适配
 * 2. 我们不会完全适配所有的组件和属性，而是只适配常用的（只适配我们流程设计器中需要到的）
 */
</script>