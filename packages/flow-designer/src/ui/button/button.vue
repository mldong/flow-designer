<template>
  <MButton>
    <slot></slot>
  </MButton>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
const props = defineProps({
  uiLibrary: {
    type: String,
    default: 'antd',
  },
});
const createButton = (uiLibrary: string) => {
  if (uiLibrary === 'ant-design-vue' || uiLibrary === 'antd') {
    return defineAsyncComponent(() => import('ant-design-vue/es/button').then(mod => mod.default));
  } else if (uiLibrary === 'element-plus') {
    return defineAsyncComponent(() => import('element-plus/es/components/button/index').then(mod => mod.default));
  }
  throw new Error('Unsupported UI library');
};

const MButton = createButton(props.uiLibrary);
</script>