<template>
  <div class="ding-designer" :style="containerStyle" @contextmenu.prevent="handleContextmenu">
    <!-- 控制面板 -->
    <ControlPanel
      :init-control="initControl"
      :control="control"
      :viewer="viewer"
      @save="handleControlSave"
      @clear="handleControlClear"
      @view-data="handleControlViewData"
      @import-data="handleControlImportData"
      @fullscreen="handleControlFullscreen"
    />
    <div class="ding-designer__canvas">
      <NodeChain
        v-if="treeData"
        :node="treeData"
        :type-prefix="typePrefix"
        :viewer="viewer"
        :high-light="highLight"
        :theme="theme"
        :dnd-panel="computedDndPanel"
        :protected-ids="protectedIds"
        @edit="handleEditNode"
        @delete="handleDeleteNode"
        @add="handleAddNode"
        @add-branch="handleAddBranch"
        @edit-branch="handleEditBranch"
        @add-to-branch="handleAddToBranch"
      />
    </div>
    <!-- 编辑面板 -->
    <div class="ding-edit-panel" v-if="editingNode || editingBranch">
      <div class="ding-edit-panel__header">
        <span>{{ editPanelTitle }}</span>
        <button class="ding-edit-panel__close" @click="closeEditPanel">&times;</button>
      </div>
      <div class="ding-edit-panel__body">
        <div class="ding-form-item" v-for="field in editFormFields" :key="field.name">
          <label class="ding-form-item__label">{{ field.label }}</label>
          <template v-if="field.component === 'Select'">
            <select class="ding-form-item__select" v-model="editFormData[field.name]">
              <option value="">{{ field.componentProps?.placeholder || '请选择' }}</option>
              <option
                v-for="opt in (field.componentProps?.options || [])"
                :key="opt.value"
                :value="opt.value"
              >{{ opt.label }}</option>
            </select>
          </template>
          <template v-else>
            <input
              class="ding-form-item__input"
              v-model="editFormData[field.name]"
              :placeholder="field.componentProps?.placeholder || ''"
            />
          </template>
        </div>
      </div>
      <div class="ding-edit-panel__footer">
        <button class="ding-edit-panel__btn ding-edit-panel__btn--primary" @click="saveEdit">保存</button>
        <button class="ding-edit-panel__btn" @click="closeEditPanel">取消</button>
      </div>
    </div>
    <!-- 查看数据弹窗 -->
    <div class="ding-modal-overlay" v-if="showDataModal" @click="showDataModal = false">
      <div class="ding-modal" @click.stop>
        <div class="ding-modal__header">
          <span>流程数据</span>
          <button class="ding-edit-panel__close" @click="showDataModal = false">&times;</button>
        </div>
        <div class="ding-modal__body">
          <textarea class="ding-modal__textarea" readonly :value="viewDataJson"></textarea>
        </div>
        <div class="ding-modal__footer">
          <button class="ding-edit-panel__btn" @click="copyData">复制</button>
          <button class="ding-edit-panel__btn" @click="showDataModal = false">关闭</button>
        </div>
      </div>
    </div>
    <!-- 导入数据弹窗 -->
    <div class="ding-modal-overlay" v-if="showImportModal" @click="showImportModal = false">
      <div class="ding-modal" @click.stop>
        <div class="ding-modal__header">
          <span>导入流程数据</span>
          <button class="ding-edit-panel__close" @click="showImportModal = false">&times;</button>
        </div>
        <div class="ding-modal__body">
          <textarea class="ding-modal__textarea" v-model="importDataJson" placeholder="请粘贴 JSON 数据"></textarea>
          <div v-if="importError" class="ding-modal__error">{{ importError }}</div>
        </div>
        <div class="ding-modal__footer">
          <button class="ding-edit-panel__btn ding-edit-panel__btn--primary" @click="doImport">导入</button>
          <button class="ding-edit-panel__btn" @click="showImportModal = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, PropType } from 'vue'
import type { FDConfigData, FDThemeConfig, FDHighLightType, FDPatternItem, FDControlItem, FDFormType, FDFormItemType } from '../../types'
import type { DingNode, DingConditionNode, DingBranch, DingForkNode } from '../types'
import { isConditionNode, isForkNode } from '../types'
import { graphToTree, treeToGraph } from '../utils/converter'
import NodeChain from './NodeChain.vue'
import ControlPanel from './ControlPanel.vue'
import '../styles/dingtalk.scss'

const props = defineProps({
  value: {
    type: Object as PropType<FDConfigData>,
    default: () => ({})
  },
  theme: {
    type: Object as PropType<FDThemeConfig>,
    default: () => ({})
  },
  highLight: {
    type: Object as PropType<FDHighLightType>,
    default: () => ({})
  },
  viewer: {
    type: Boolean,
    default: false
  },
  dndPanel: {
    type: Array as PropType<FDPatternItem[]>,
    default: () => []
  },
  processForm: {
    type: Object as PropType<FDFormType>
  },
  edgeForm: {
    type: Object as PropType<FDFormType>
  },
  nodeClick: {
    type: Function
  },
  edgeClick: {
    type: Function
  },
  blankContextmenu: {
    type: Function
  },
  initControl: {
    type: Boolean,
    default: true
  },
  control: {
    type: Array as PropType<FDControlItem[]>
  },
  drawerWidth: {
    type: [String, Number] as PropType<string | number>,
    default: '600px'
  },
  modalWidth: {
    type: [String, Number] as PropType<string | number>,
    default: '60%'
  },
  typePrefix: {
    type: String,
    default: 'snaker:'
  },
  defaultEdgeType: {
    type: String,
    default: 'snaker:transition'
  }
})

const emit = defineEmits<{
  (e: 'update:value', data: FDConfigData): void
  (e: 'node-click', node: DingNode): void
  (e: 'edit-branch', branch: DingBranch): void
  (e: 'save', data: FDConfigData): void
}>()

// ─── 默认面板项 ─────────────────────────────────────────────────────────
const defaultDndPanelItems: FDPatternItem[] = [
  { type: 'task', text: '审批人', label: '审批人' },
  { type: 'custom', text: '自定义节点', label: '自定义节点' },
  { type: 'subProcess', text: '子流程', label: '子流程' },
]

const computedDndPanel = computed<FDPatternItem[]>(() => {
  if (props.dndPanel && props.dndPanel.length > 0) return props.dndPanel
  return defaultDndPanelItems
})

// 树形数据
const treeData = ref<DingNode | undefined>(undefined)

/**
 * 受保护节点 ID 集合（不允许删除）
 * - 开始节点（snaker:start）
 * - 结束节点（snaker:end）—— 渲染在顶层链末端
 * - 顶层第一个申请节点（start 的直接子节点）—— 钉钉模式默认链路的第一个节点
 */
const protectedIds = computed<Set<string>>(() => {
  const ids = new Set<string>()
  if (!treeData.value) return ids
  // 开始节点
  const baseType = treeData.value.type.replace(props.typePrefix, '')
  if (baseType === 'start') ids.add(treeData.value.id)
  // 顶层第一个子节点（第一个审批节点）
  const firstChild = treeData.value.children
  if (firstChild) ids.add(firstChild.id)
  // 找结束节点（递归找 snaker:end）
  const endId = findEndNodeId(treeData.value)
  if (endId) ids.add(endId)
  return ids
})

/** 在树中查找 snaker:end 节点 id */
function findEndNodeId(node: DingNode | undefined): string | null {
  if (!node) return null
  const baseType = node.type.replace(props.typePrefix, '')
  if (baseType === 'end') return node.id
  if (isConditionNode(node)) {
    for (const branch of node.branches) {
      if (branch.children) {
        const id = findEndNodeId(branch.children)
        if (id) return id
      }
    }
  }
  if (isForkNode(node)) {
    for (const branch of node.branches) {
      if (branch.children) {
        const id = findEndNodeId(branch.children)
        if (id) return id
      }
    }
    if (node.joinChildren) {
      const id = findEndNodeId(node.joinChildren)
      if (id) return id
    }
  }
  if (node.children) {
    return findEndNodeId(node.children)
  }
  return null
}

// 编辑分支时记录父节点类型（condition/fork）
const editingBranchType = ref<'condition' | 'fork' | null>(null)

// 内部标记，避免 watch 循环
let isInternalUpdate = false

/** 递归查找分支所属的父节点类型 */
function findBranchParentType(node: DingNode, branchId: string): 'condition' | 'fork' | null {
  if (isConditionNode(node)) {
    if (node.branches.some(b => b.id === branchId)) {
      return 'condition'
    }
    for (const branch of node.branches) {
      if (branch.children) {
        const found = findBranchParentType(branch.children, branchId)
        if (found) return found
      }
    }
  }
  if (isForkNode(node)) {
    if (node.branches.some(b => b.id === branchId)) {
      return 'fork'
    }
    for (const branch of node.branches) {
      if (branch.children) {
        const found = findBranchParentType(branch.children, branchId)
        if (found) return found
      }
    }
  }
  if (node.children) {
    return findBranchParentType(node.children, branchId)
  }
  return null
}

/** 从 graph 数据转为树 */
function convertToTree() {
  const nodes = props.value?.nodes || []
  const edges = props.value?.edges || []
  treeData.value = graphToTree(nodes, edges, props.typePrefix)
}

/** 从树转回 graph 数据并 emit */
function syncToGraph() {
  const graphData = treeToGraph(treeData.value, props.typePrefix)
  const newValue: FDConfigData = {
    ...props.value,
    nodes: graphData.nodes,
    edges: graphData.edges,
    mode: 'dingtalk',
  }
  isInternalUpdate = true
  emit('update:value', newValue)
}

// 初始转换
convertToTree()

// 监听外部数据变化
watch(() => props.value, () => {
  if (isInternalUpdate) {
    isInternalUpdate = false
    return
  }
  convertToTree()
}, { deep: true })

/** 容器样式（支持主题配置） */
const containerStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.theme?.backgroundColor) {
    style['--ding-bg-color'] = props.theme.backgroundColor
  }
  if (props.theme?.primaryColor) {
    style['--ding-primary-color'] = props.theme.primaryColor
  }
  if (props.theme?.activeColor) {
    style['--ding-active-color'] = props.theme.activeColor
  }
  if (props.theme?.historyColor) {
    style['--ding-history-color'] = props.theme.historyColor
  }
  return style
})

// ─── 节点操作 ─────────────────────────────────────────────────────────

let idCounter = 0

function generateId(): string {
  // 优先用 crypto.randomUUID 避免快速点击/嵌套条件下 ID 重复
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `ding_${crypto.randomUUID()}`
  }
  return `ding_${Date.now()}_${++idCounter}`
}

/**
 * 确保节点类型有正确前缀
 */
function ensureTypePrefix(type: string): string {
  if (!type) return type
  if (type.startsWith(props.typePrefix)) return type
  return `${props.typePrefix}${type}`
}

/**
 * 在指定节点后面添加新节点
 */
function handleAddNode(nodeType: string, afterNode: DingNode | null) {
  if (!treeData.value) return

  // 特殊类型：条件分支 / 并行分支
  if (nodeType === '__condition__') {
    insertConditionNode(afterNode)
    syncToGraph()
    return
  }
  if (nodeType === '__parallel__') {
    insertForkJoinPair(afterNode)
    syncToGraph()
    return
  }

  const fullType = ensureTypePrefix(nodeType)
  const newNode: DingNode = {
    id: generateId(),
    type: fullType,
    name: getDefaultName(fullType),
    properties: {},
  }

  if (afterNode) {
    // 在 afterNode 后插入 newNode
    insertAfter(treeData.value, afterNode.id, newNode)
  } else {
    // afterNode 为 null，需要在空分支中插入 — 由 BranchColumn 处理
    // 此场景由 DingTalkDesigner 外部逻辑覆盖
  }

  syncToGraph()
}

/**
 * 删除节点（start/end 不允许删除）
 * - 普通节点：调用 removeNode 把 children 接到父节点
 * - 条件容器：调用 removeConditionContainerById 把容器的 children 接续到所在位置
 * - 并行容器：调用 removeForkContainerById 把 joinChildren 接续到所在位置
 */
function handleDeleteNode(node: DingNode) {
  if (!treeData.value) return
  const baseType = node.type.replace(props.typePrefix, '')
  // 保护节点不允许删除：start / end / 顶层第一个申请节点
  if (protectedIds.value.has(node.id)) {
    // eslint-disable-next-line no-console
    console.warn('[DingTalkDesigner] 受保护节点不允许删除：', node.id)
    return
  }
  if (baseType === 'start' || baseType === 'end') return
  if (isConditionNode(node)) {
    removeConditionContainerById(treeData.value, node.id)
  } else if (isForkNode(node)) {
    removeForkContainerById(treeData.value, node.id)
  } else {
    removeNode(treeData.value, node.id)
  }
  syncToGraph()
}

/**
 * 编辑节点 - 事件优先级: dndPanel.nodeClick > 全局 nodeClick > 默认编辑面板
 */
function handleEditNode(node: DingNode) {
  if (props.viewer) return

  const baseType = node.type.replace(props.typePrefix, '')
  // 从 dndPanel 匹配对应类型的配置项
  const matchedPatternItem = computedDndPanel.value.find(
    (item: FDPatternItem) => item.type === baseType
  )

  const eventParams = {
    data: {
      id: node.id,
      type: node.type,
      text: node.name,
      properties: node.properties
    },
    patternItem: matchedPatternItem
  }

  // 优先级1: dndPanel 中该类型的 nodeClick
  if (matchedPatternItem?.nodeClick && typeof matchedPatternItem.nodeClick === 'function') {
    matchedPatternItem.nodeClick(eventParams)
    return
  }

  // 优先级2: 全局 nodeClick prop
  if (props.nodeClick && typeof props.nodeClick === 'function') {
    props.nodeClick(eventParams)
    return
  }

  // 优先级3: 打开内置编辑面板
  editingBranch.value = null
  editingNode.value = node
  editFormData.name = node.properties?.name || node.id
  editFormData.displayName = node.name || ''
  editFormData.assignee = node.properties?.assignee || ''
  editFormData.taskType = node.properties?.taskType || ''
  editFormData.performType = node.properties?.performType || ''
  editFormData.callback = node.properties?.callback || ''
  editFormData.clazz = node.properties?.clazz || ''
  editFormData.methodName = node.properties?.methodName || ''
  editFormData.args = node.properties?.args || ''
  editFormData.form = node.properties?.form || ''
  editFormData.version = node.properties?.version || ''
  editFormData.preInterceptors = node.properties?.preInterceptors || ''
  editFormData.postInterceptors = node.properties?.postInterceptors || ''
  editFormData.expr = node.properties?.expr || ''
  editFormData.handleClass = node.properties?.handleClass || ''

  emit('node-click', node)
}

/**
 * 编辑分支条件 - 事件优先级: 全局 edgeClick > 默认编辑面板
 */
function handleEditBranch(branch: DingBranch) {
  if (props.viewer) return

  const eventParams = {
    data: {
      id: branch.id,
      type: 'transition',
      text: branch.name,
      properties: branch.properties
    },
    patternItem: { form: props.edgeForm }
  }

  // 优先级1: 全局 edgeClick prop
  if (props.edgeClick && typeof props.edgeClick === 'function') {
    props.edgeClick(eventParams)
    return
  }

  // 优先级2: 打开内置编辑面板
  editingNode.value = null
  editingBranch.value = branch
  // 查找分支父节点类型
  editingBranchType.value = treeData.value ? findBranchParentType(treeData.value, branch.id) : null
  editFormData.displayName = branch.name || ''
  editFormData.expr = branch.properties?.expr || ''
  editFormData.name = branch.properties?.name || branch.id
}

/**
 * 添加条件/并行分支
 * - condition：向 DingConditionNode.branches 追加 DingBranch
 * - fork：向 DingForkNode.branches 追加 DingBranch（children 留空，用户可继续填入任务）
 */
function handleAddBranch(node: DingNode) {
  if (isConditionNode(node)) {
    const condNode = node as DingConditionNode
    const newBranch: DingBranch = {
      id: generateId(),
      name: `条件${condNode.branches.length + 1}`,
      properties: {},
    }
    condNode.branches.push(newBranch)
    syncToGraph()
    return
  }
  if (isForkNode(node)) {
    const forkNode = node as DingForkNode
    const newBranch: DingBranch = {
      id: generateId(),
      name: `分支${forkNode.branches.length + 1}`,
      properties: {},
    }
    forkNode.branches.push(newBranch)
    syncToGraph()
  }
}

/**
 * 向空分支中添加节点
 */
function handleAddToBranch(nodeType: string, branch: DingBranch) {
  if (!treeData.value) return

  // 特殊类型：条件分支
  if (nodeType === '__condition__') {
    const condNode: DingConditionNode = {
      id: generateId(),
      type: 'condition',
      name: '',
      properties: {},
      branches: [
        { id: generateId(), name: '条件1', properties: {} },
        { id: generateId(), name: '条件2', properties: {} },
      ],
    }
    branch.children = condNode as unknown as DingNode
    syncToGraph()
    return
  }

  const fullType = ensureTypePrefix(nodeType)
  const newNode: DingNode = {
    id: generateId(),
    type: fullType,
    name: getDefaultName(fullType),
    properties: {},
  }
  branch.children = newNode
  syncToGraph()
}

// ─── 树操作工具函数 ────────────────────────────────────────────────────

/**
 * 在目标节点后面插入新节点
 */
function insertAfter(root: DingNode, targetId: string, newNode: DingNode): boolean {
  if (root.id === targetId) {
    // 将新节点插入：root -> newNode -> root.children
    newNode.children = root.children
    root.children = newNode
    return true
  }

  if (isConditionNode(root)) {
    const condNode = root as DingConditionNode
    for (const branch of condNode.branches) {
      if (branch.children && insertAfter(branch.children, targetId, newNode)) {
        return true
      }
    }
  }

  // 关键：fork 容器的 joinChildren 链也需要递归（join 节点也在此链中）
  if (isForkNode(root)) {
    const forkNode = root as DingForkNode
    // 1) fork 的每个分支的 children 链
    for (const branch of forkNode.branches) {
      if (branch.children && insertAfter(branch.children, targetId, newNode)) {
        return true
      }
    }
    // 2) fork 后的 joinChildren 链
    if (forkNode.joinChildren && insertAfter(forkNode.joinChildren, targetId, newNode)) {
      return true
    }
  }

  if (root.children) {
    return insertAfter(root.children, targetId, newNode)
  }

  return false
}

/**
 * 从树中移除指定节点（将其 children 接到父节点）
 * 关键边界：若 target 本身是条件/并行容器（嵌套），不能简单丢弃其 children，
 * 否则会丢失该容器内部的 branches 信息；改为把容器的 children（汇聚后的下一节点）接续上去。
 */
function removeNode(root: DingNode, targetId: string): boolean {
  // 场景 1：root.children 就是要删除的节点
  if (root.children && root.children.id === targetId) {
    const target = root.children
    // 条件容器或普通节点统一处理：把它的 children 接续到 root（条件容器时为汇聚后的下一节点）
    root.children = target.children
    return true
  }

  // 场景 2：条件容器的某个分支中
  if (isConditionNode(root)) {
    const condNode = root as DingConditionNode
    for (const branch of condNode.branches) {
      if (branch.children) {
        if (branch.children.id === targetId) {
          const target = branch.children
          // 嵌套条件容器：把容器的 children（汇聚后的下一节点）接续到分支
          // 普通节点：原逻辑接续其 children
          branch.children = target.children
          return true
        }
        if (removeNode(branch.children, targetId)) {
          return true
        }
      }
    }
  }

  // 场景 2b：fork 容器的某个分支或 joinChildren 链中
  if (isForkNode(root)) {
    const forkNode = root as DingForkNode
    for (const branch of forkNode.branches) {
      if (branch.children) {
        if (branch.children.id === targetId) {
          branch.children = branch.children.children
          return true
        }
        if (removeNode(branch.children, targetId)) {
          return true
        }
      }
    }
    if (forkNode.joinChildren) {
      // join 节点本身（joinChildren 的第一节点）允许被删除：把 join 的 children 接到 fork
      if (forkNode.joinChildren.id === targetId) {
        forkNode.joinChildren = forkNode.joinChildren.children || undefined
        return true
      }
      if (removeNode(forkNode.joinChildren, targetId)) {
        return true
      }
    }
  }

  // 场景 3：继续递归到 root.children
  if (root.children) {
    return removeNode(root.children, targetId)
  }

  return false
}

/**
 * 删除整个条件容器：把容器的 children（汇聚后的下一节点）接续到所在位置
 * 适用于 root.children 是条件容器、或分支的 children 是条件容器的两种位置
 */
function removeConditionContainerById(root: DingNode, containerId: string): boolean {
  // 位置 1：root.children 是要删除的条件容器
  if (root.children && root.children.id === containerId && isConditionNode(root.children)) {
    root.children = (root.children as DingConditionNode).children
    return true
  }
  // 位置 2：条件容器的某个分支的 children 是要删除的条件容器
  if (isConditionNode(root)) {
    const condNode = root as DingConditionNode
    for (const branch of condNode.branches) {
      if (
        branch.children &&
        branch.children.id === containerId &&
        isConditionNode(branch.children)
      ) {
        branch.children = (branch.children as DingConditionNode).children
        return true
      }
      if (branch.children && removeConditionContainerById(branch.children, containerId)) {
        return true
      }
    }
  }
  // 位置 2b：fork 容器的某个分支或 joinChildren 中
  if (isForkNode(root)) {
    const forkNode = root as DingForkNode
    for (const branch of forkNode.branches) {
      if (branch.children && removeConditionContainerById(branch.children, containerId)) {
        return true
      }
    }
    if (forkNode.joinChildren && removeConditionContainerById(forkNode.joinChildren, containerId)) {
      return true
    }
  }
  // 位置 3：继续递归到 root.children
  if (root.children) {
    return removeConditionContainerById(root.children, containerId)
  }
  return false
}

/**
 * 删除整个 fork 容器：把 joinChildren 接续到所在位置
 */
function removeForkContainerById(root: DingNode, containerId: string): boolean {
  // 位置 1：root.children 是要删除的 fork 容器
  if (root.children && root.children.id === containerId && isForkNode(root.children)) {
    root.children = (root.children as DingForkNode).joinChildren?.children
    return true
  }
  // 位置 2：fork 内部递归（分支链 + joinChildren 链）
  if (isForkNode(root)) {
    const forkNode = root as DingForkNode
    for (const branch of forkNode.branches) {
      if (branch.children && removeForkContainerById(branch.children, containerId)) {
        return true
      }
    }
    if (forkNode.joinChildren && removeForkContainerById(forkNode.joinChildren, containerId)) {
      return true
    }
  }
  // 位置 3：继续递归到 root.children
  if (root.children) {
    return removeForkContainerById(root.children, containerId)
  }
  return false
}

/**
 * 在指定节点位置插入条件/并发分支节点
 * 默认带两个"审批人"任务节点（与合并分支保持一致，"生而有用"）
 */
function insertConditionNode(afterNode: DingNode | null) {
  if (!treeData.value || !afterNode) return

  const taskType = ensureTypePrefix('task')
  const branch1Task: DingNode = {
    id: generateId(),
    type: taskType,
    name: getDefaultName(taskType),
    properties: {},
  }
  const branch2Task: DingNode = {
    id: generateId(),
    type: taskType,
    name: getDefaultName(taskType),
    properties: {},
  }

  const condNode: DingConditionNode = {
    id: generateId(),
    type: 'condition',
    name: '',
    properties: {},
    branches: [
      { id: generateId(), name: '条件1', properties: {}, children: branch1Task },
      { id: generateId(), name: '条件2', properties: {}, children: branch2Task },
    ],
  }

  // 在 afterNode 后插入 condNode
  insertAfter(treeData.value, afterNode.id, condNode as unknown as DingNode)
}

/**
 * 在 afterNode 后插入 fork+join 对（含两个空分支 + join 节点 + joinChildren）
 * 语义：afterNode → fork → [branch1, branch2] → join → joinChildren(原 afterNode.children)
 *
 * 注：join 节点作为独立 DingNode 包装在 joinChildren 链中，确保渲染和回写 graph 时 join 节点能正确显示与还原
 */
function insertForkJoinPair(afterNode: DingNode | null) {
  if (!treeData.value || !afterNode) return

  const joinId = generateId()
  // 创建 join 节点（作为 joinChildren 链的第一节点）
  const joinNode: DingNode = {
    id: joinId,
    type: ensureTypePrefix('join'),
    name: '合并节点',
    properties: {},
    children: afterNode.children, // 接管原 afterNode.children
  }
  const taskType = ensureTypePrefix('task')
  // 默认给每个分支塞一个"审批人"任务节点，确保分支"生而有用"
  const branch1Task: DingNode = {
    id: generateId(),
    type: taskType,
    name: getDefaultName(taskType),
    properties: {},
  }
  const branch2Task: DingNode = {
    id: generateId(),
    type: taskType,
    name: getDefaultName(taskType),
    properties: {},
  }
  const forkNode: DingForkNode = {
    id: generateId(),
    type: 'fork',
    name: '',
    properties: {},
    branches: [
      { id: generateId(), name: '分支1', properties: {}, children: branch1Task },
      { id: generateId(), name: '分支2', properties: {}, children: branch2Task },
    ],
    joinId,
    joinChildren: joinNode,
  }
  // afterNode 原本的 children 转交给 join 节点
  afterNode.children = forkNode as unknown as DingNode
}

/**
 * 获取节点默认名称
 */
function getDefaultName(nodeType: string): string {
  const baseType = nodeType.replace(props.typePrefix, '')
  switch (baseType) {
    case 'task': return '审批人'
    case 'custom': return '自定义节点'
    case 'subProcess': return '子流程'
    default: return '新节点'
  }
}

// ─── 编辑面板 ─────────────────────────────────────────────────────────

const editingNode = ref<DingNode | null>(null)
const editingBranch = ref<DingBranch | null>(null)
const editFormData = reactive<Record<string, string>>({
  name: '',
  displayName: '',
  assignee: '',
  taskType: '',
  performType: '',
  callback: '',
  clazz: '',
  methodName: '',
  args: '',
  form: '',
  version: '',
  preInterceptors: '',
  postInterceptors: '',
  expr: '',
  handleClass: '',
})

const editPanelTitle = computed(() => {
  if (editingBranch.value) return '编辑分支条件'
  if (!editingNode.value) return ''
  const baseType = editingNode.value.type.replace(props.typePrefix, '')
  switch (baseType) {
    case 'start': return '编辑开始节点'
    case 'end': return '编辑结束节点'
    case 'task': return '编辑审批节点'
    case 'custom': return '编辑自定义节点'
    case 'subProcess': return '编辑子流程'
    case 'condition': return '编辑条件分支（决策配置）'
    case 'fork': return '编辑并行分支'
    default: return '编辑节点'
  }
})

const editFormFields = computed<FDFormItemType[]>(() => {
  if (editingBranch.value) {
    const fields: FDFormItemType[] = [
      { name: 'displayName', label: '分支名称', component: 'Input', componentProps: { placeholder: '请输入分支名称' } },
    ]
    // 只有条件分支（condition）才显示条件表达式，并行分支（parallel）不显示
    if (editingBranchType.value === 'condition') {
      fields.push({ name: 'expr', label: '条件表达式', component: 'Input', componentProps: { placeholder: '请输入条件表达式' } })
    }
    return fields
  }
  if (!editingNode.value) return []
  const baseType = editingNode.value.type.replace(props.typePrefix, '')
  const common: FDFormItemType[] = [
    { name: 'name', label: '唯一编码', component: 'Input', componentProps: { placeholder: '请输入唯一编码' } },
    { name: 'displayName', label: '显示名称', component: 'Input', componentProps: { placeholder: '请输入显示名称' } },
  ]
  switch (baseType) {
    case 'condition':
      // 条件分支容器（decision 节点）：决策表达式 / 处理类 / 决策类 / 方法名 / 参数 / 拦截器
      return [
        ...common,
        { name: 'expr', label: '决策表达式', component: 'Input', componentProps: { placeholder: '请输入决策表达式' } },
        { name: 'handleClass', label: '处理类', component: 'Input', componentProps: { placeholder: '请输入处理类' } },
        { name: 'clazz', label: '决策类路径', component: 'Input', componentProps: { placeholder: '请输入决策类路径' } },
        { name: 'methodName', label: '方法名', component: 'Input', componentProps: { placeholder: '请输入方法名' } },
        { name: 'args', label: '参数变量', component: 'Input', componentProps: { placeholder: '请输入参数变量' } },
        { name: 'preInterceptors', label: '前置拦截器', component: 'Input', componentProps: { placeholder: '请输入前置拦截器' } },
        { name: 'postInterceptors', label: '后置拦截器', component: 'Input', componentProps: { placeholder: '请输入后置拦截器' } },
      ]
    case 'task':
      return [
        ...common,
        { name: 'assignee', label: '参与人', component: 'Input', componentProps: { placeholder: '请输入参与人' } },
        { name: 'taskType', label: '任务类型', component: 'Select', componentProps: { placeholder: '请选择任务类型', options: [{ label: '主办', value: 'Major' }, { label: '协办', value: 'Aidant' }] } },
        { name: 'performType', label: '参与类型', component: 'Select', componentProps: { placeholder: '请选择参与类型', options: [{ label: '普通参与', value: 'ANY' }, { label: '会签参与', value: 'ALL' }] } },
        { name: 'form', label: '表单', component: 'Input', componentProps: { placeholder: '请输入表单' } },
        { name: 'preInterceptors', label: '前置拦截器', component: 'Input', componentProps: { placeholder: '请输入前置拦截器' } },
        { name: 'postInterceptors', label: '后置拦截器', component: 'Input', componentProps: { placeholder: '请输入后置拦截器' } },
      ]
    case 'custom':
      return [
        ...common,
        { name: 'clazz', label: '类路径', component: 'Input', componentProps: { placeholder: '请输入类路径' } },
        { name: 'methodName', label: '方法名', component: 'Input', componentProps: { placeholder: '请输入方法名' } },
        { name: 'args', label: '参数变量', component: 'Input', componentProps: { placeholder: '请输入参数变量' } },
        { name: 'preInterceptors', label: '前置拦截器', component: 'Input', componentProps: { placeholder: '请输入前置拦截器' } },
        { name: 'postInterceptors', label: '后置拦截器', component: 'Input', componentProps: { placeholder: '请输入后置拦截器' } },
      ]
    case 'subProcess':
      return [
        ...common,
        { name: 'form', label: '表单', component: 'Input', componentProps: { placeholder: '请输入表单' } },
        { name: 'version', label: '版本号', component: 'Input', componentProps: { placeholder: '请输入版本号' } },
      ]
    case 'start':
    case 'end':
      return [
        { name: 'name', label: '唯一编码', component: 'Input', componentProps: { placeholder: '请输入唯一编码' } },
        { name: 'preInterceptors', label: '前置拦截器', component: 'Input', componentProps: { placeholder: '请输入前置拦截器' } },
        { name: 'postInterceptors', label: '后置拦截器', component: 'Input', componentProps: { placeholder: '请输入后置拦截器' } },
      ]
    default:
      return common
  }
})

function closeEditPanel() {
  editingNode.value = null
  editingBranch.value = null
}

function saveEdit() {
  if (editingBranch.value) {
    // 保存分支编辑
    editingBranch.value.name = editFormData.displayName
    editingBranch.value.properties = {
      ...editingBranch.value.properties,
      expr: editFormData.expr,
      name: editFormData.name,
    }
    editingBranch.value = null
    syncToGraph()
    return
  }
  if (editingNode.value) {
    // 保存节点编辑
    editingNode.value.name = editFormData.displayName
    const baseType = editingNode.value.type.replace(props.typePrefix, '')
    editingNode.value.properties = {
      ...editingNode.value.properties,
      name: editFormData.name,
    }
    if (baseType === 'task') {
      editingNode.value.properties.assignee = editFormData.assignee
      editingNode.value.properties.taskType = editFormData.taskType
      editingNode.value.properties.performType = editFormData.performType
      editingNode.value.properties.form = editFormData.form
      editingNode.value.properties.preInterceptors = editFormData.preInterceptors
      editingNode.value.properties.postInterceptors = editFormData.postInterceptors
    } else if (baseType === 'condition') {
      // 条件分支容器（decision 节点）属性：决策表达式 / 处理类 / 决策类 / 方法名 / 参数 / 拦截器
      editingNode.value.properties.expr = editFormData.expr
      editingNode.value.properties.handleClass = editFormData.handleClass
      editingNode.value.properties.clazz = editFormData.clazz
      editingNode.value.properties.methodName = editFormData.methodName
      editingNode.value.properties.args = editFormData.args
      editingNode.value.properties.preInterceptors = editFormData.preInterceptors
      editingNode.value.properties.postInterceptors = editFormData.postInterceptors
    } else if (baseType === 'custom') {
      editingNode.value.properties.clazz = editFormData.clazz
      editingNode.value.properties.methodName = editFormData.methodName
      editingNode.value.properties.args = editFormData.args
      editingNode.value.properties.preInterceptors = editFormData.preInterceptors
      editingNode.value.properties.postInterceptors = editFormData.postInterceptors
    } else if (baseType === 'subProcess') {
      editingNode.value.properties.form = editFormData.form
      editingNode.value.properties.version = editFormData.version
    } else if (baseType === 'start' || baseType === 'end') {
      editingNode.value.properties.preInterceptors = editFormData.preInterceptors
      editingNode.value.properties.postInterceptors = editFormData.postInterceptors
    }
    editingNode.value = null
    syncToGraph()
  }
}

// ─── 右键菜单事件 ─────────────────────────────────────────────

function handleContextmenu(_e: MouseEvent) {
  if (props.viewer) return

  // 获取当前流程属性
  const processProperties: Record<string, any> = {}
  if (props.processForm?.formItems) {
    for (const item of props.processForm.formItems) {
      if (props.value && Object.prototype.hasOwnProperty.call(props.value, item.name)) {
        processProperties[item.name] = (props.value as any)[item.name]
      }
    }
  }

  const eventParams = {
    data: {
      type: 'process',
      properties: processProperties
    },
    patternItem: { form: props.processForm }
  }

  if (props.blankContextmenu && typeof props.blankContextmenu === 'function') {
    props.blankContextmenu(eventParams)
  }
  // 没有回调则不做任何事
}

// ─── 控制面板事件 ─────────────────────────────────────────────

const showDataModal = ref(false)
const viewDataJson = ref('')
const showImportModal = ref(false)
const importDataJson = ref('')
const importError = ref('')

function handleControlSave() {
  const graphData = treeToGraph(treeData.value, props.typePrefix)
  const saveData: FDConfigData = {
    ...props.value,
    nodes: graphData.nodes,
    edges: graphData.edges,
    mode: 'dingtalk',
  }
  emit('save', saveData)
}

function handleControlClear() {
  // 清空树形数据，只保留 start → end
  const startNode: DingNode = {
    id: generateId(),
    type: `${props.typePrefix}start`,
    name: '开始',
    properties: {},
    children: {
      id: generateId(),
      type: `${props.typePrefix}end`,
      name: '结束',
      properties: {},
    }
  }
  treeData.value = startNode
  syncToGraph()
}

function handleControlViewData() {
  const graphData = treeToGraph(treeData.value, props.typePrefix)
  const data: FDConfigData = {
    ...props.value,
    nodes: graphData.nodes,
    edges: graphData.edges,
    mode: 'dingtalk',
  }
  viewDataJson.value = JSON.stringify(data, null, 2)
  showDataModal.value = true
}

function handleControlImportData() {
  importDataJson.value = ''
  showImportModal.value = true
}

/**
 * 导入数据：解析 + 结构校验；失败时不关闭弹窗、不破坏 treeData
 * 成功时保留外部 mode 字段（缺省时填 'dingtalk'）
 */
function doImport() {
  importError.value = ''
  const snapshot = JSON.stringify(treeData.value)
  try {
    const data = JSON.parse(importDataJson.value)
    if (!data || typeof data !== 'object') {
      importError.value = '导入失败：数据格式不正确'
      return
    }
    if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      importError.value = '导入失败：缺少 nodes 或 edges 数组'
      return
    }
    for (const n of data.nodes) {
      if (!n || typeof n.id !== 'string' || typeof n.type !== 'string') {
        importError.value = '导入失败：节点缺少 id 或 type 字段'
        return
      }
    }
    for (const e of data.edges) {
      if (
        !e ||
        typeof e.id !== 'string' ||
        typeof e.sourceNodeId !== 'string' ||
        typeof e.targetNodeId !== 'string'
      ) {
        importError.value = '导入失败：边缺少 id / sourceNodeId / targetNodeId 字段'
        return
      }
    }
    isInternalUpdate = true
    // 仅覆盖 nodes/edges/mode，保留 props.value 其他字段（name/displayName 等）
    const newValue: FDConfigData = {
      ...props.value,
      nodes: data.nodes,
      edges: data.edges,
      mode: data.mode === 'canvas' ? 'canvas' : 'dingtalk',
    }
    emit('update:value', newValue)
    treeData.value = graphToTree(newValue.nodes, newValue.edges, props.typePrefix)
    showImportModal.value = false
  } catch (err) {
    importError.value = '导入失败：JSON 格式不正确'
    // 恢复 treeData 避免脏数据
    try {
      treeData.value = JSON.parse(snapshot)
    } catch {
      /* snapshot 异常时不做恢复 */
    }
  }
}

function copyData() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(viewDataJson.value)
  }
}

function handleControlFullscreen() {
  const el = document.querySelector('.ding-designer') as HTMLElement
  if (!el) return
  if (!document.fullscreenElement) {
    el.requestFullscreen?.().catch(() => {})
  } else {
    document.exitFullscreen?.().catch(() => {})
  }
}
</script>
