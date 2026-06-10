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
import type { DingNode, DingConditionNode, DingBranch } from '../types'
import { isConditionNode } from '../types'
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

// 编辑分支时记录父节点类型（condition/parallel）
const editingBranchType = ref<'condition' | 'parallel' | null>(null)

// 内部标记，避免 watch 循环
let isInternalUpdate = false

/** 递归查找分支所属的父节点类型 */
function findBranchParentType(node: DingNode, branchId: string): 'condition' | 'parallel' | null {
  if (isConditionNode(node)) {
    if (node.branches.some(b => b.id === branchId)) {
      return node.type
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

  // 特殊类型：条件分支
  if (nodeType === '__condition__' || nodeType === '__parallel__') {
    insertConditionNode(afterNode, nodeType === '__parallel__' ? 'parallel' : 'condition')
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
 */
function handleDeleteNode(node: DingNode) {
  if (!treeData.value) return
  const baseType = node.type.replace(props.typePrefix, '')
  if (baseType === 'start' || baseType === 'end') return
  removeNode(treeData.value, node.id)
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
  editFormData.expr = ''

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
 * 添加条件分支
 */
function handleAddBranch(node: DingNode) {
  if (!isConditionNode(node)) return
  const condNode = node as DingConditionNode
  const newBranch: DingBranch = {
    id: generateId(),
    name: `条件${condNode.branches.length + 1}`,
    properties: {},
  }
  condNode.branches.push(newBranch)
  syncToGraph()
}

/**
 * 向空分支中添加节点
 */
function handleAddToBranch(nodeType: string, branch: DingBranch) {
  if (!treeData.value) return

  // 特殊类型：条件分支
  if (nodeType === '__condition__' || nodeType === '__parallel__') {
    const condNode: DingConditionNode = {
      id: generateId(),
      type: nodeType === '__parallel__' ? 'parallel' : 'condition',
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

  if (root.children) {
    return insertAfter(root.children, targetId, newNode)
  }

  return false
}

/**
 * 从树中移除指定节点（将其 children 接到父节点）
 */
function removeNode(root: DingNode, targetId: string): boolean {
  // 检查 root.children 是否为要删除的
  if (root.children && root.children.id === targetId) {
    const target = root.children
    root.children = target.children
    return true
  }

  if (isConditionNode(root)) {
    const condNode = root as DingConditionNode
    for (const branch of condNode.branches) {
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
  }

  if (root.children) {
    return removeNode(root.children, targetId)
  }

  return false
}

/**
 * 在指定节点位置插入条件/并发分支节点
 */
function insertConditionNode(afterNode: DingNode | null, type: 'condition' | 'parallel') {
  if (!treeData.value || !afterNode) return

  const condNode: DingConditionNode = {
    id: generateId(),
    type,
    name: '',
    properties: {},
    branches: [
      { id: generateId(), name: '条件1', properties: {} },
      { id: generateId(), name: '条件2', properties: {} },
    ],
  }

  // 在 afterNode 后插入 condNode
  insertAfter(treeData.value, afterNode.id, condNode as unknown as DingNode)
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

function handleContextmenu(e: MouseEvent) {
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

function handleControlSave() {
  const graphData = treeToGraph(treeData.value, props.typePrefix)
  const saveData: FDConfigData = {
    ...props.value,
    nodes: graphData.nodes,
    edges: graphData.edges,
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
  }
  viewDataJson.value = JSON.stringify(data, null, 2)
  showDataModal.value = true
}

function handleControlImportData() {
  importDataJson.value = ''
  showImportModal.value = true
}

function doImport() {
  try {
    const data = JSON.parse(importDataJson.value)
    if (data && (data.nodes || data.edges)) {
      isInternalUpdate = true
      emit('update:value', data)
      // 重新转换树
      const nodes = data.nodes || []
      const edges = data.edges || []
      treeData.value = graphToTree(nodes, edges, props.typePrefix)
    }
    showImportModal.value = false
  } catch (err) {
    alert('导入失败：JSON 格式不正确')
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
