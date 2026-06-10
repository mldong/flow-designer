import type {
  DingNode,
  DingConditionNode,
  DingBranch,
  GraphNode,
  GraphEdge,
  GraphData,
} from '../types'

const DEFAULT_PREFIX = 'snaker:'

// ─── graphToTree ────────────────────────────────────────────────────────────────

/**
 * 将 LogicFlow 的图数据（nodes + edges）转换为钉钉风格的树形结构
 */
export function graphToTree(
  nodes: GraphNode[],
  edges: GraphEdge[],
  typePrefix: string = DEFAULT_PREFIX
): DingNode | undefined {
  if (!nodes.length) return undefined

  const nodeMap = new Map<string, GraphNode>(nodes.map(n => [n.id, n]))
  const outEdgesMap = buildOutEdgesMap(edges)

  // 找到 start 节点
  const startNode = nodes.find(n => n.type === `${typePrefix}start`)
  if (!startNode) return undefined

  return buildChain(startNode.id, new Set(), nodeMap, outEdgesMap, edges, typePrefix)
}

/**
 * 递归构建节点链表
 * @param nodeId 当前要处理的节点 ID
 * @param stopIds 汇聚点集合（遇到时停止，不包含在当前链中）
 */
function buildChain(
  nodeId: string,
  stopIds: Set<string>,
  nodeMap: Map<string, GraphNode>,
  outEdgesMap: Map<string, GraphEdge[]>,
  allEdges: GraphEdge[],
  prefix: string
): DingNode | undefined {
  if (stopIds.has(nodeId)) return undefined

  const graphNode = nodeMap.get(nodeId)
  if (!graphNode) return undefined

  const outEdges = outEdgesMap.get(nodeId) || []
  const baseType = graphNode.type.replace(prefix, '')

  // 判断是否为分支节点（decision 或 fork，且有多条出边）
  if ((baseType === 'decision' || baseType === 'fork') && outEdges.length > 1) {
    return buildConditionNode(graphNode, baseType, outEdges, stopIds, nodeMap, outEdgesMap, allEdges, prefix)
  }

  // 普通节点
  const dingNode: DingNode = {
    id: graphNode.id,
    type: graphNode.type,
    name: graphNode.text?.value || '',
    properties: { ...graphNode.properties },
  }

  // end 节点无后续
  if (baseType === 'end') return dingNode

  // 单出边，继续构建链表
  if (outEdges.length === 1) {
    const next = buildChain(outEdges[0].targetNodeId, stopIds, nodeMap, outEdgesMap, allEdges, prefix)
    if (next) dingNode.children = next
  }

  return dingNode
}

/**
 * 构建条件/并发分支容器节点
 */
function buildConditionNode(
  graphNode: GraphNode,
  baseType: string,
  outEdges: GraphEdge[],
  parentStopIds: Set<string>,
  nodeMap: Map<string, GraphNode>,
  outEdgesMap: Map<string, GraphEdge[]>,
  allEdges: GraphEdge[],
  prefix: string
): DingConditionNode {
  const condType: 'condition' | 'parallel' = baseType === 'decision' ? 'condition' : 'parallel'

  // 找到汇聚点
  const convergence = findConvergence(graphNode.id, outEdges, allEdges, nodeMap, prefix, baseType)

  // 构建各分支
  const branchStopIds = new Set(parentStopIds)
  if (convergence) branchStopIds.add(convergence)

  const branches: DingBranch[] = outEdges.map(edge => {
    const branchChildren = buildChain(
      edge.targetNodeId,
      branchStopIds,
      nodeMap,
      outEdgesMap,
      allEdges,
      prefix
    )
    return {
      id: edge.id,
      name: edge.text?.value || '',
      properties: { ...edge.properties },
      children: branchChildren,
    }
  })

  const condNode: DingConditionNode = {
    id: graphNode.id,
    type: condType,
    name: graphNode.text?.value || '',
    properties: { ...graphNode.properties },
    branches,
  }


  // 并行分支：存储 join 节点的 ID
  if (condType === 'parallel' && convergence) {
    condNode.joinId = convergence
  }

  // 汇聚点作为 children 继续（对于 parallel，children 是 join 之后的后续节点）
  if (convergence) {
    const convergenceNode = nodeMap.get(convergence)
    // 如果汇聚点是 join，跳过 join 本身，直接取其后续节点
    if (convergenceNode && convergenceNode.type === `${prefix}join`) {
      const joinOutEdges = outEdgesMap.get(convergence) || []
      if (joinOutEdges.length === 1) {
        const next = buildChain(joinOutEdges[0].targetNodeId, parentStopIds, nodeMap, outEdgesMap, allEdges, prefix)
        if (next) condNode.children = next
      } else {
        // join 没有出边或有多条出边，将 join 作为普通节点处理
        const joinNode: DingNode = {
          id: convergenceNode.id,
          type: convergenceNode.type,
          name: convergenceNode.text?.value || '',
          properties: { ...convergenceNode.properties },
        }
        const joinOutEdges = outEdgesMap.get(convergence) || []
        if (joinOutEdges.length === 1) {
          const next = buildChain(joinOutEdges[0].targetNodeId, parentStopIds, nodeMap, outEdgesMap, allEdges, prefix)
          if (next) joinNode.children = next
        }
        condNode.children = joinNode
      }
    } else {
      const next = buildChain(convergence, parentStopIds, nodeMap, outEdgesMap, allEdges, prefix)
      if (next) condNode.children = next
    }
  }

  return condNode
}

/**
 * 寻找分支的汇聚点
 * - fork: 找对应的 join 节点
 * - decision: 找所有分支的公共可达节点（最近的）
 */
function findConvergence(
  sourceId: string,
  outEdges: GraphEdge[],
  allEdges: GraphEdge[],
  nodeMap: Map<string, GraphNode>,
  prefix: string,
  baseType: string
): string | null {
  const branchTargets = outEdges.map(e => e.targetNodeId)

  if (baseType === 'fork') {
    // fork 的汇聚点就是 join 节点，BFS 查找
    return findJoinNode(branchTargets, allEdges, nodeMap, prefix)
  }

  // decision: 找所有分支的公共可达节点
  return findCommonConvergence(branchTargets, allEdges, sourceId)
}

/**
 * BFS 查找 join 节点
 */
function findJoinNode(
  startIds: string[],
  allEdges: GraphEdge[],
  nodeMap: Map<string, GraphNode>,
  prefix: string
): string | null {
  const outMap = buildOutEdgesMap(allEdges)
  const visited = new Set<string>()
  const queue = [...startIds]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)

    const node = nodeMap.get(current)
    if (node && node.type === `${prefix}join`) return current

    const nextEdges = outMap.get(current) || []
    for (const e of nextEdges) {
      if (!visited.has(e.targetNodeId)) queue.push(e.targetNodeId)
    }
  }

  return null
}

/**
 * 查找所有分支的公共可达节点（最近的汇聚点）
 * 算法：对每个分支做 BFS，统计每个节点被多少分支可达，
 * 然后按拓扑序找第一个被所有分支可达的节点
 */
function findCommonConvergence(
  branchTargets: string[],
  allEdges: GraphEdge[],
  excludeId: string
): string | null {
  const outMap = buildOutEdgesMap(allEdges)
  const totalBranches = branchTargets.length
  const reachCount = new Map<string, number>()

  // 统计每个节点被多少分支可达
  for (const target of branchTargets) {
    const visited = new Set<string>()
    const queue = [target]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)
      reachCount.set(current, (reachCount.get(current) || 0) + 1)
      const nextEdges = outMap.get(current) || []
      for (const e of nextEdges) {
        if (!visited.has(e.targetNodeId)) queue.push(e.targetNodeId)
      }
    }
  }

  // BFS 从各分支起点开始，找第一个被所有分支可达的节点
  const visited = new Set<string>([excludeId])
  const queue = [...branchTargets]

  while (queue.length > 0) {
    const current = queue.shift()!
    if (visited.has(current)) continue
    visited.add(current)

    if (reachCount.get(current) === totalBranches) {
      return current
    }

    const nextEdges = outMap.get(current) || []
    for (const e of nextEdges) {
      if (!visited.has(e.targetNodeId)) queue.push(e.targetNodeId)
    }
  }

  return null
}

// ─── treeToGraph ────────────────────────────────────────────────────────────────

/**
 * 将钉钉风格的树形结构转换回 LogicFlow 的图数据
 */
export function treeToGraph(
  tree: DingNode | undefined,
  typePrefix: string = DEFAULT_PREFIX
): GraphData {
  if (!tree) return { nodes: [], edges: [] }

  const ctx: ConvertContext = {
    nodes: [],
    edges: [],
    edgeCounter: 0,
    prefix: typePrefix,
    layoutY: 200,
    layoutX: 480,
  }

  processNodeToGraph(tree, ctx)

  return { nodes: ctx.nodes, edges: ctx.edges }
}

interface ConvertContext {
  nodes: GraphNode[]
  edges: GraphEdge[]
  edgeCounter: number
  prefix: string
  layoutY: number
  layoutX: number
}

/**
 * 递归处理树节点，生成图节点和边
 * 返回当前节点的 id（用于父节点连接边）
 */
function processNodeToGraph(dingNode: DingNode, ctx: ConvertContext): string {
  if (isConditionLike(dingNode)) {
    return processConditionToGraph(dingNode as DingConditionNode, ctx)
  }

  // 普通节点
  const graphNode = createGraphNode(dingNode, ctx)
  ctx.nodes.push(graphNode)

  if (dingNode.children) {
    const childId = processNodeToGraph(dingNode.children, ctx)
    addEdge(ctx, dingNode.id, childId)
  }

  return dingNode.id
}

/**
 * 处理条件/并发节点的图转换
 */
function processConditionToGraph(condNode: DingConditionNode, ctx: ConvertContext): string {
  // 确定图节点类型
  const graphType = condNode.type === 'condition'
    ? `${ctx.prefix}decision`
    : `${ctx.prefix}fork`
  const isParallel = condNode.type === 'parallel'

  // 生成分支源节点（decision / fork）
  const sourceNode = createGraphNode(
    { ...condNode, type: graphType } as unknown as DingNode,
    ctx
  )
  ctx.nodes.push(sourceNode)

  const savedY = ctx.layoutY
  const branchCount = condNode.branches.length
  const startX = ctx.layoutX - ((branchCount - 1) * 200) / 2

  // ── 并行分支：使用存储的 joinId 或生成新的 ──
  let joinNodeId: string | null = null
  if (isParallel) {
    // 优先使用存储的 joinId
    if (condNode.joinId) {
      joinNodeId = condNode.joinId
      // 如果 nodes 中还没有这个 join 节点，添加它
      if (!ctx.nodes.find(n => n.id === joinNodeId)) {
        const joinGraphNode: GraphNode = {
          id: joinNodeId,
          type: `${ctx.prefix}join`,
          x: sourceNode.x,
          y: savedY + 150 * 2,
          properties: {},
        }
        ctx.nodes.push(joinGraphNode)
      }
    } else {
      // 没有存储的 joinId，生成新的
      joinNodeId = `join_${condNode.id}`
      ctx.layoutX = sourceNode.x
      ctx.layoutY = savedY + 150 * 2
      const joinNode: GraphNode = {
        id: joinNodeId,
        type: `${ctx.prefix}join`,
        x: ctx.layoutX,
        y: ctx.layoutY,
        properties: {},
      }
      ctx.nodes.push(joinNode)
    }
  }

  // 处理各分支
  for (let i = 0; i < branchCount; i++) {
    const branch = condNode.branches[i]
    const branchX = startX + i * 200

    if (branch.children) {
      ctx.layoutX = branchX
      ctx.layoutY = savedY + 150
      const firstChildId = processNodeToGraph(branch.children, ctx)

      // 从 decision/fork 到分支第一个节点的 edge（携带分支属性）
      addEdge(ctx, condNode.id, firstChildId, branch.id, branch.name, branch.properties)

      // 从分支最后节点到汇聚点的 edge
      if (isParallel && joinNodeId) {
        // 并行：分支 -> join
        const lastId = findLastNodeId(branch.children)
        addEdge(ctx, lastId, joinNodeId)
      } else if (condNode.children) {
        // 条件：分支 -> 后续节点
        const lastId = findLastNodeId(branch.children)
        addEdge(ctx, lastId, condNode.children.id)
      }
    } else {
      // 空分支：直接从 decision/fork 到汇聚点
      if (isParallel && joinNodeId) {
        addEdge(ctx, condNode.id, joinNodeId, branch.id, branch.name, branch.properties)
      } else if (condNode.children) {
        addEdge(ctx, condNode.id, condNode.children.id, branch.id, branch.name, branch.properties)
      }
    }
  }

  // 恢复布局位置，处理汇聚点及后续
  if (isParallel && joinNodeId) {
    // 并行：join -> 后续节点
    ctx.layoutX = sourceNode.x
    ctx.layoutY = savedY + 150 * 3
    if (condNode.children) {
      // 如果 children 是 join 节点本身
      if (condNode.children.type === `${ctx.prefix}join`) {
        // join -> join.children (如果有的话)
        if (condNode.children.children) {
          addEdge(ctx, joinNodeId, condNode.children.children.id)
          processNodeToGraph(condNode.children.children, ctx)
        }
      } else {
        // children 是 join 之后的后续节点
        addEdge(ctx, joinNodeId, condNode.children.id)
        processNodeToGraph(condNode.children, ctx)
      }
    }
  } else {
    // 条件：直接处理后续节点
    ctx.layoutX = sourceNode.x
    ctx.layoutY = savedY + 150 * 2
    if (condNode.children) {
      processNodeToGraph(condNode.children, ctx)
    }
  }

  return condNode.id
}

// ─── 工具函数 ───────────────────────────────────────────────────────────────────

function buildOutEdgesMap(edges: GraphEdge[]): Map<string, GraphEdge[]> {
  const map = new Map<string, GraphEdge[]>()
  for (const edge of edges) {
    const list = map.get(edge.sourceNodeId)
    if (list) list.push(edge)
    else map.set(edge.sourceNodeId, [edge])
  }
  return map
}

function isConditionLike(node: DingNode): boolean {
  return node.type === 'condition' || node.type === 'parallel'
}

function createGraphNode(dingNode: DingNode, ctx: ConvertContext): GraphNode {
  const x = ctx.layoutX
  const y = ctx.layoutY
  ctx.layoutY += 150

  return {
    id: dingNode.id,
    type: dingNode.type,
    x,
    y,
    text: dingNode.name ? { x, y, value: dingNode.name } : undefined,
    properties: { ...dingNode.properties },
  }
}

function addEdge(
  ctx: ConvertContext,
  sourceId: string,
  targetId: string,
  edgeId?: string,
  name?: string,
  properties?: Record<string, any>
): void {
  const id = edgeId || `edge_${++ctx.edgeCounter}`
  const edge: GraphEdge = {
    id,
    type: `${ctx.prefix}transition`,
    sourceNodeId: sourceId,
    targetNodeId: targetId,
    properties: properties ? { ...properties } : {},
  }
  if (name) edge.text = { value: name }
  ctx.edges.push(edge)
}

/**
 * 递归查找链表中最后一个节点的 id
 */
function findLastNodeId(node: DingNode): string {
  if (isConditionLike(node)) {
    const cond = node as DingConditionNode
    if (cond.children) return findLastNodeId(cond.children)
    return cond.id
  }
  if (node.children) return findLastNodeId(node.children)
  return node.id
}
