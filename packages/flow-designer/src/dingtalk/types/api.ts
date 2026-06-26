/**
 * 钉钉模式对外暴露的"lf 等价 API"类型
 *
 * 设计目标：
 * - 与画布模式 LogicFlow 实例的 API 命名保持一致
 *   （业务方在 vben5 中习惯调用 `lf.updateText / changeNodeId / setProperties / getNodeDataById`）
 * - 让原有的二次开发代码（task-drawer / process-drawer 等）几乎无修改即可在钉钉模式下复用
 * - 配合 eventCenter.emit 让业务方自定义表单能反向更新画布
 *
 * 关键约定：
 * - 所有"按 id 操作"的方法，id 接受 DingNode.id 或 node.properties.name（vben5 base-form 习惯用 name 作为 key）
 * - 所有更新方法都会自动触发 v-model 同步（emit update:value）
 * - viewer 模式下，update 类方法为只读（不报错但不生效）
 */

import type { DingNode, DingBranch, DingConditionNode, DingForkNode } from '../types'
import type { FDConfigData, FDHighLightType } from '../../types'

/**
 * 业务方在 nodeClick / edgeClick 回调中拿到的"节点数据"（与画布模式一致）
 * - id: DingNode.id
 * - type: 完整 type（含 prefix）
 * - text.value: 显示名称
 * - properties: 业务字段集合
 */
export interface FDNodeData {
  id: string
  type: string
  text: { value: string }
  properties: Record<string, any>
}

/** eventCenter 支持的事件名 */
export type FDEventName =
  | 'update:graphModel'   // 流程属性变化（v-model.value 同步）
  | 'update:graphData'    // 节点/边数据变化（重渲染画布）
  | 'update:highlight'    // 高亮数据变化

/**
 * 事件总线（简化版，自实现，避免引入外部库）
 * 业务方用法：
 * ```ts
 * const api = ref.getDesignerApi()
 * api.eventCenter.on('update:graphModel', () => { ... })
 * api.eventCenter.emit('update:graphModel', { name: 'leave' })
 * ```
 */
export interface FDEventCenter {
  emit(event: FDEventName, data?: any): void
  on(event: FDEventName, handler: (data?: any) => void): void
  off(event: FDEventName, handler: (data?: any) => void): void
}

/**
 * 钉钉模式对外暴露的 API（与 LogicFlow 兼容命名）
 *
 * 典型用法（与画布模式对照）：
 * ```ts
 * // 画布模式
 * const lf = ref.getLfInstance()
 * lf.updateText('apply', '请假申请-改')
 *
 * // 钉钉模式
 * const api = ref.getDesignerApi()
 * api.updateText('apply', '请假申请-改')
 * ```
 */
export interface FDDesignerAPI {
  // ─── 节点查询 ───────────────────────────────────────────
  /** 按 id 查找节点（含 start/end/task/custom/subProcess/condition/fork/join） */
  getNodeDataById(id: string): FDNodeData | null
  /** 按 properties.name 查找节点（vben5 base-form 习惯） */
  getNodeDataByName(name: string): FDNodeData | null
  /** 获取所有节点数据（扁平） */
  getAllNodes(): FDNodeData[]

  // ─── 节点更新（实时同步 props.value） ─────────────────────
  /**
   * 更新节点显示文本（对应 lf.updateText）
   * @param id 节点 id 或 properties.name
   * @param text 新的显示名称
   */
  updateText(id: string, text: string): void

  /**
   * 修改节点 ID（对应 lf.changeNodeId）
   * 同步更新 node.id 和 properties.name
   */
  changeNodeId(oldId: string, newId: string): boolean

  /**
   * 设置节点 properties（合并语义；对应 lf.setProperties）
   * @param id 节点 id 或 properties.name
   * @param props 要合并的属性
   */
  setProperties(id: string, props: Record<string, any>): void

  /**
   * 删除节点单个 property（对应 lf.deleteProperty）
   */
  deleteProperty(id: string, key: string): void

  // ─── 流程属性（v-model.value） ──────────────────────────
  /**
   * 设置流程属性（v-model.value 的字段）
   * 等同于修改 props.value 但会触发 emit('update:value')
   */
  setProcessProperty(key: string, value: any): void

  // ─── 导出/重渲染 ──────────────────────────────────────
  /** 获取当前 graph data（导出保存） */
  getGraphData(): FDConfigData

  /**
   * 重新渲染（传入完整 graph data）
   * 与画布模式 lf.render(data) 一致
   */
  render(data: FDConfigData): void

  // ─── 高亮 ───────────────────────────────────────────
  /** 设置高亮数据（同时触发重渲染） */
  setHighlight(data: FDHighLightType): void

  // ─── 事件总线（业务方表单主动通知画布） ────────────────
  eventCenter: FDEventCenter
}

/**
 * 内部辅助：递归查找节点（按 id 或按 name）
 */
export function findNode(
  root: DingNode | DingConditionNode | DingForkNode | null | undefined,
  predicate: (n: DingNode) => boolean
): DingNode | null {
  if (!root) return null
  if (predicate(root as DingNode)) return root as DingNode
  if ((root as DingConditionNode).branches) {
    const cond = root as DingConditionNode
    for (const b of cond.branches) {
      if (b.children) {
        const found = findNode(b.children, predicate)
        if (found) return found
      }
    }
  }
  if ((root as DingForkNode).branches) {
    const fork = root as DingForkNode
    for (const b of fork.branches) {
      if (b.children) {
        const found = findNode(b.children, predicate)
        if (found) return found
      }
    }
    if (fork.joinChildren) {
      const found = findNode(fork.joinChildren, predicate)
      if (found) return found
    }
  }
  if (root.children) {
    return findNode(root.children, predicate)
  }
  return null
}

/**
 * 内部辅助：扁平化所有节点
 */
export function flattenNodes(
  root: DingNode | DingConditionNode | DingForkNode | null | undefined,
  acc: DingNode[] = []
): DingNode[] {
  if (!root) return acc
  acc.push(root as DingNode)
  const cond = root as DingConditionNode
  if (cond.branches) {
    for (const b of cond.branches) {
      if (b.children) flattenNodes(b.children, acc)
    }
  }
  const fork = root as DingForkNode
  if (fork.branches) {
    for (const b of fork.branches) {
      if (b.children) flattenNodes(b.children, acc)
    }
    if (fork.joinChildren) flattenNodes(fork.joinChildren, acc)
  }
  if (root.children) flattenNodes(root.children, acc)
  return acc
}
