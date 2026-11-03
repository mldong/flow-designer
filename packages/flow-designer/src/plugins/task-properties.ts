import { ReapplyModeEnum } from '../types/enums'
import type { FDFormItemType } from '../types'

/**
 * 审批任务节点属性契约（与后端引擎对齐）
 *
 * reapplyMode「退回发起人后的重提方式」与 performType / countersignType 同级，
 * 平铺写在 properties 里（不是 properties.ext）。
 * 引擎只认 NORMAL / RETURN_TO_SOURCE；缺省、空串与其他值一律按 NORMAL 处理，
 * 设计器侧同口径归一，保证不会把空值/非法值写回流程定义。
 */
export function normalizeReapplyMode(value: unknown): ReapplyModeEnum | string {
  // 缺省/空串按 NORMAL；合法值原样返回；非空非法值必须保留原值交给上层报错，不得静默改写
  if (value === undefined || value === null || value === '') return ReapplyModeEnum.normal
  return value as ReapplyModeEnum | string
}

/** 非空且不是 NORMAL/RETURN_TO_SOURCE：配置错误，调用方应提示并保留原值 */
export function isInvalidReapplyMode(value: unknown): boolean {
  return value !== undefined && value !== null && value !== ''
    && value !== ReapplyModeEnum.normal && value !== ReapplyModeEnum.returnToSource
}

/**
 * 办理协同三档（issues/247）与已办撤回开关（issues/246），与 reapplyMode 同层平铺在 properties，
 * 不进 ext / field：
 *   collabMode          三档单选虚键（none/afterSign/dynamicCountersign），只活在表单模型，
 *                       落盘翻译成 allowAddSign / dynamicCountersign 两枚引擎键（见 collabModeWrites）
 *   allowAddSign        布尔，缺省＝不写键＝false（后加签档）
 *   dynamicCountersign  布尔，缺省＝不写键＝false（动态会签档；与 allowAddSign 互斥）
 *   addSignMaxRounds    整数 ≥0，缺省＝不写键＝0＝不限轮次；两协同档共用
 *   allowRecall         布尔，缺省＝不写键＝false（已办撤回）
 * 会签节点／申请节点配了由引擎解析期报错；设计器侧整组隐藏（showCollabGroup——
 * 抽屉注入伪键 __collabHidden，伪键永不写回定义）。
 */
export function showAddSignRounds(model: Record<string, any>): boolean {
  return model.collabMode === 'afterSign' || model.collabMode === 'dynamicCountersign'
}

/** 空值与 0 都等于「不限轮次」的缺省语义，一律删键 */
export function omitAddSignMaxRounds(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  return Number(value) === 0
}

/** 只收非负整数的字面量；负数、小数、非数字都返回错误词条 key，交调用方提示且不写回 */
export function validateAddSignMaxRounds(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return /^\d+$/.test(String(value).trim()) ? undefined : 'fd.err.addSignMaxRounds'
}

/** 引擎侧是整数，文本框里拿到的是字符串，写回前换算 */
export function castAddSignMaxRounds(value: unknown): number | undefined {
  const raw = String(value ?? '').trim()
  return raw === '' ? undefined : Number(raw)
}

/** 办理协同三档取值 */
export type FDCollabMode = 'none' | 'afterSign' | 'dynamicCountersign'

/**
 * 回显派生：两键同 true＝互斥脏态（手写 JSON 才配得出来）⇒ 返回 ''。
 * Select 无此选项，validate 把它变红错，择一修好之前该字段不落盘。
 */
export function deriveCollabMode(model: Record<string, any>): FDCollabMode | '' {
  const addSign = model.allowAddSign === true
  const dynamic = model.dynamicCountersign === true
  if (addSign && dynamic) return ''
  if (addSign) return 'afterSign'
  if (dynamic) return 'dynamicCountersign'
  return 'none'
}

/** 三档到引擎键的写集；''＝互斥脏态，返回空集（本次不写回） */
export function collabModeWrites(
  value: unknown,
): Array<{ key: string; value?: any; remove?: boolean }> {
  if (value === 'afterSign') {
    return [
      { key: 'allowAddSign', value: true },
      { key: 'dynamicCountersign', remove: true },
    ]
  }
  if (value === 'dynamicCountersign') {
    return [
      { key: 'dynamicCountersign', value: true },
      { key: 'allowAddSign', remove: true },
    ]
  }
  if (value === 'none') {
    return [
      { key: 'allowAddSign', remove: true },
      { key: 'dynamicCountersign', remove: true },
    ]
  }
  return []
}

export function validateCollabMode(value: unknown): string | undefined {
  return value === '' || value === null || value === undefined
    ? 'fd.err.collabMutex'
    : undefined
}

/** allowRecall 布尔，缺省＝不写键＝false */
export function omitAllowRecall(value: unknown): boolean {
  return value !== true
}

/** 协同/撤回组显隐：抽屉对会签节点与申请节点注入 __collabHidden＝true（伪键，永不写回定义） */
export function showCollabGroup(model: Record<string, any>): boolean {
  return model.__collabHidden !== true
}

/**
 * 会签节点判据：performType 双形都收（引擎侧数字 1、本设计器历史写法字符串 'ALL'），
 * countersignType 在场等同会签。
 */
export function isCountersignNode(
  properties: Record<string, any> | undefined | null,
): boolean {
  if (!properties) return false
  const pt = properties.performType
  return pt === 1 || pt === 'ALL'
    || (properties.countersignType !== undefined && properties.countersignType !== null)
}

/**
 * 申请节点判据：start（typePrefix+start）直接后继，graphModel 为 LogicFlow 实例模型。
 */
export function isApplyNode(
  nodeId: string,
  graphModel: any,
  typePrefix: string,
): boolean {
  const edges = graphModel?.edges || []
  const nodes = graphModel?.nodes || []
  const startType = `${typePrefix}start`
  return edges.some((edge: any) => {
    if (edge.targetNodeId !== nodeId) return false
    const src = nodes.find((n: any) => n.id === edge.sourceNodeId)
    return !!src && src.type === startType
  })
}

/**
 * 一次表单改动落到节点属性该怎么走：
 * set=写值、remove=删键、skip=非法值保持属性原样（error 为待提示的词条 key）、
 * writes=多键写集（办理协同三档：一值翻译成 allowAddSign/dynamicCountersign 两键的 set/删）。
 * 画布抽屉与钉钉编辑面板共用这一个出口，两种模式的行为不允许分叉。
 */
export function decidePropertyWrite(
  item: FDFormItemType,
  value: any,
  model: Record<string, any>,
): { kind: 'set'; value: any } | { kind: 'remove' } | { kind: 'skip'; error?: string }
  | { kind: 'writes'; writes: Array<{ key: string; value?: any; remove?: boolean }> } {
  const error = item.validate?.(value, model)
  if (error) return { kind: 'skip', error }
  if (item.show && !item.show(model)) return { kind: 'remove' }
  if (item.multiWrite) return { kind: 'writes', writes: item.multiWrite(value, model) }
  if (item.omit?.(value, model)) return { kind: 'remove' }
  return { kind: 'set', value: item.cast ? item.cast(value) : value }
}
