<template>
  <MButton>
    <slot></slot>
  </MButton>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue';
const instance = getCurrentInstance()
const uiAdapter = instance?.appContext.config.globalProperties.$uiAdapter;

const MButton = uiAdapter.createButton();
</script>