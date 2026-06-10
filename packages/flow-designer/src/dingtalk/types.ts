/**
 * 钉钉风格流程树形结构类型定义
 */

/** 基础节点（单链表形式） */
export interface DingNode {
  id: string
  type: string               // 原始 node.type (如 'snaker:task')
  name: string               // 显示文本（从 node.text.value 获取）
  properties: Record<string, any>  // 原始 node.properties
  children?: DingNode        // 下一个节点（单链表形式）
}

/** 条件/并发分支容器（DingNode 的特殊形态） */
export interface DingConditionNode extends Omit<DingNode, 'type'> {
  type: 'condition' | 'parallel'  // condition 对应 decision，parallel 对应 fork/join
  branches: DingBranch[]
  children?: DingNode        // 所有分支汇聚后的下一个节点（对于 parallel，即 join 节点的后续）
  joinId?: string            // 并行分支的汇聚点节点 ID（仅 parallel 类型有）
}

/** 分支 */
export interface DingBranch {
  id: string                 // 对应 edge 的 id
  name: string               // 分支名称（从 edge.text.value 获取）
  properties: Record<string, any>  // edge 的 properties（包含 expr 等）
  children?: DingNode        // 分支内的节点链
}

/** 联合类型（便于转换函数内部使用） */
export type DingTreeNode = DingNode | DingConditionNode

/** 类型守卫：判断节点是否为条件/并发容器 */
export function isConditionNode(node: DingNode): node is DingConditionNode {
  return node.type === 'condition' || node.type === 'parallel'
}

/** 图节点（对应 LogicFlow 的节点数据） */
export interface GraphNode {
  id: string
  type: string
  x: number
  y: number
  text?: { x?: number; y?: number; value?: string }
  properties: Record<string, any>
}

/** 图边（对应 LogicFlow 的边数据） */
export interface GraphEdge {
  id: string
  type: string
  sourceNodeId: string
  targetNodeId: string
  text?: { value?: string }
  properties: Record<string, any>
}

/** graphToTree / treeToGraph 的图数据结构 */
export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
