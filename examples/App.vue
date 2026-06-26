<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import Example from './components/Example.vue'
import VbenProcessCase from './cases/VbenProcessCase.vue'
import NodeApiCase from './cases/NodeApiCase.vue'

interface CaseItem {
  key: string
  label: string
  desc: string
  component: any
}

const cases: CaseItem[] = [
  { key: 'home', label: '首页演示', desc: '画布/钉钉模式基础演示', component: Example },
  { key: 'vben-process', label: '案例1: vben5 process-drawer 风格', desc: '业务方真实写法移植测试', component: VbenProcessCase },
  { key: 'node-api', label: '案例2: 节点 API 操作', desc: 'updateText / setProperties / deleteProperty', component: NodeApiCase },
]

const activeKey = ref<string>('home')
const activeCase = shallowRef<any>(Example)

// 监听 hash 变化支持直接访问指定案例
const syncFromHash = () => {
  const hash = window.location.hash.replace('#/', '').replace('#', '')
  const found = cases.find(c => c.key === hash)
  if (found) {
    activeKey.value = found.key
    activeCase.value = found.component
  }
}

const handleSelect = (item: CaseItem) => {
  activeKey.value = item.key
  activeCase.value = item.component
  window.location.hash = `#/${item.key}`
}

window.addEventListener('hashchange', syncFromHash)
syncFromHash()
</script>

<template>
  <div class="app-shell">
    <nav class="case-nav">
      <div class="case-nav__brand">
        <span class="brand-icon">⚙️</span>
        <span class="brand-text">flow-designer-plus · 演示与验证</span>
      </div>
      <div class="case-nav__tabs">
        <button
          v-for="item in cases"
          :key="item.key"
          :class="['case-tab', { active: activeKey === item.key }]"
          :title="item.desc"
          @click="handleSelect(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </nav>
    <main class="app-main">
      <component :is="activeCase" />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.case-nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 10;
}

.case-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.brand-icon {
  font-size: 22px;
}

.case-nav__tabs {
  display: flex;
  gap: 6px;
}

.case-tab {
  padding: 7px 16px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: #606266;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.18s;
  white-space: nowrap;
}

.case-tab:hover:not(.active) {
  background: rgba(48, 104, 236, 0.08);
  color: #3068EC;
}

.case-tab.active {
  background: #3068EC;
  color: #fff;
  box-shadow: 0 2px 6px rgba(48, 104, 236, 0.3);
}

.app-main {
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
}
</style>
