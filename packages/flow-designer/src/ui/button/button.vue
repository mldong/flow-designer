<template>
  <MButton>
    <slot></slot>
  </MButton>
</template>

<script setup lang="ts">
import UIAdapter from '../UIAdapter';
const uiAdapter = new UIAdapter();

const MButton = uiAdapter.createButton();
</script>