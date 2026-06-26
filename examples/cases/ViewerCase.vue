<!--
  案例3：预览模式（viewer）演示

  对齐画布模式（LogicFlow isSilentMode）的预览/查看场景：
  - :viewer="true" 进入预览模式
  - 编辑相关 UI 全部隐藏：节点 ✎/× 按钮、+ 添加按钮、+ 添加条件按钮
  - 工具栏只保留：缩小 / 放大 / 适应 / 查看数据 / 全屏（移除 save/clear/import）
  - 节点点击不再打开编辑面板
  - 画布右键菜单不再弹出
  - 仍可响应 :node-click / :edge-click 事件（业务流程审批/审计场景常用）

  业务方用法（与画布模式完全一致）：
  ```vue
  <FlowDesigner
    v-model:value="graphData"
    :mode="'dingtalk'"
    :viewer="true"
    :high-light="highLightData"
    @node-click="onNodeClick"
    @edge-click="onEdgeClick"
  />
  ```

  移动端预览场景下同样适用（FAB 展开后只剩缩放/适应/查看/全屏）。
-->
<template>
  <div class="viewer-case">
    <!--
      顶部说明栏（演示站额外加的 UI）
      移动端预览时同样隐藏（与 VbenProcessCase / NodeApiCase 保持一致）。
    -->
    <div v-if="!isMobilePreview" class="case-toolbar">
      <div class="case-info">
        <div class="case-title">钉钉模式 · 预览模式（viewer）</div>
        <div class="case-desc">
          与画布模式 LogicFlow <code>isSilentMode: true</code> 等价：
          所有编辑 UI 已禁用（节点 ✎/×、+ 添加、+ 添加条件、画布右键菜单），
          工具栏仅保留 缩小/放大/适应/查看数据/全屏。
          仍可响应 <code>@node-click</code> / <code>@edge-click</code> 事件。
        </div>
      </div>
      <div class="case-actions">
        <el-button type="primary" size="small" @click="viewer = !viewer">
          {{ viewer ? '切换到编辑模式' : '切换到预览模式' }}
        </el-button>
        <el-button size="small" @click="simulateApprove" :disabled="!lastClickedNode">
          模拟审批 {{ lastClickedNode?.data?.text?.value ? `（${lastClickedNode.data.text.value}）` : '' }}
        </el-button>
      </div>
    </div>

    <!--
      设计器（移动端预览时是页面上唯一展示的元素）。
      :viewer 决定编辑/预览模式，业务方入参风格与画布模式完全一致。
    -->
    <FlowDesigner
      ref="designerRef"
      v-model:value="graphData"
      :mode="mode"
      :viewer="viewer"
      :high-light="highLightData"
      @on-init="handleInit"
      @node-click="onNodeClick"
      @edge-click="onEdgeClick"
    />

    <!--
      底部事件日志（演示站额外加的 UI）
      移动端预览时隐藏。
    -->
    <div v-if="!isMobilePreview" class="event-log">
      <div class="log-header">
        节点点击事件（preview 场景下业务方通常监听这个触发审批/审计）
        <el-button size="small" text @click="logs = []">清空</el-button>
      </div>
      <div class="log-body">
        <div v-for="(log, i) in logs" :key="i" :class="['log-item', log.type]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-msg">{{ log.msg }}</span>
        </div>
        <div v-if="!logs.length" class="log-empty">
          点击流程图任意节点，会触发 node-click 事件
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FlowDesigner from '../../packages/index'
import LeaveJson from '../assets/wf-leave.json'
import { useIsMobilePreview } from '../composables/useIsMobilePreview'

// 强制钉钉模式（这个案例专注于钉钉模式的 viewer 行为）
const mode = ref<'canvas' | 'dingtalk'>('dingtalk')

// 预览模式开关：业务方用 :viewer 入参与画布模式保持一致
const viewer = ref(true)

const isMobilePreview = useIsMobilePreview()

const designerRef = ref<any>(null)
const graphData = ref<any>(structuredClone(LeaveJson))

// 当前点击的节点（用于演示"模拟审批"按钮）
interface LastClickedNode {
  data: { id: string; type: string; text: { value: string }; properties: Record<string, any> }
  node: any
  patternItem: any
  lf: any
}
const lastClickedNode = ref<LastClickedNode | null>(null)

// 高亮（演示节点点击后高亮，模拟"已审批"效果）
const highLightData = ref<any>({
  historyNodeNames: [],
  historyEdgeNames: [],
  activeNodeNames: [],
})

const handleInit = (api: any) => {
  // 钉钉模式返回 designerApi
  console.log('designerApi 已就绪（钉钉模式 viewer 演示）', api)
}

const onNodeClick = (params: any) => {
  lastClickedNode.value = params
  log('event',
    `node-click: id=${params?.data?.id}, ` +
    `type=${params?.data?.type}, ` +
    `text=${params?.data?.text?.value}`
  )
}

const onEdgeClick = (params: any) => {
  log('event',
    `edge-click: id=${params?.data?.id}, ` +
    `type=${params?.data?.type}`
  )
}

/**
 * 模拟审批：业务方在 preview 场景下典型的反馈逻辑
 * 1. 把点击的节点加入 active 高亮
 * 2. 写一条日志
 *
 * 真实业务里会调后端接口，这里只是 UI 演示。
 */
const simulateApprove = () => {
  if (!lastClickedNode.value) return
  const id = lastClickedNode.value.data.id
  highLightData.value = {
    ...highLightData.value,
    activeNodeNames: [...(highLightData.value.activeNodeNames || []), id],
    historyNodeNames: [...(highLightData.value.historyNodeNames || []), id],
  }
  log('ok', `已模拟审批节点 ${id}`)
}

// ─── 事件日志 ───
interface LogItem { time: string; msg: string; type: string }
const logs = ref<LogItem[]>([])
const log = (type: string, msg: string) => {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  logs.value.unshift({ time, msg, type })
  if (logs.value.length > 30) logs.value.pop()
}
</script>

<style scoped>
.viewer-case {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.case-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  z-index: 5;
  gap: 16px;
}

.case-info {
  flex: 1;
  min-width: 0;
}

.case-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.case-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
}

.case-desc code {
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  color: #d63384;
  font-family: 'Consolas', 'Monaco', monospace;
}

.case-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.event-log {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 420px;
  max-height: 260px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 4;
  display: flex;
  flex-direction: column;
}

.log-header {
  flex-shrink: 0;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-body {
  flex: 1;
  overflow-y: auto;
  padding: 6px 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
}

.log-item {
  display: flex;
  gap: 6px;
  padding: 3px 0;
  line-height: 1.4;
  border-bottom: 1px dashed #f0f2f5;
}

.log-time {
  color: #909399;
  flex-shrink: 0;
}

.log-msg {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

.log-item.event .log-msg { color: #3068EC; }
.log-item.ok .log-msg { color: #67c23a; }

.log-empty {
  text-align: center;
  padding: 20px;
  color: #c0c4cc;
  font-size: 12px;
}
</style>
