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
 * 后加签（可重复）两键，与 reapplyMode 同层平铺在 properties，不进 ext / field：
 *   allowAddSign     布尔，缺省＝不写键＝false
 *   addSignMaxRounds 整数 ≥0，缺省＝不写键＝0＝不限轮次；仅在 allowAddSign 开启时可配
 * 首任务节点与会签节点配了由引擎解析期报错，设计器不复制这条判据（避免双源）。
 */
export function omitAllowAddSign(value: unknown): boolean {
  return value !== true
}

export function showAddSignRounds(model: Record<string, any>): boolean {
  return model.allowAddSign === true
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

/**
 * 一次表单改动落到节点属性该怎么走：
 * set=写值、remove=删键、skip=非法值保持属性原样（error 为待提示的词条 key）。
 * 画布抽屉与钉钉编辑面板共用这一个出口，两种模式的行为不允许分叉。
 */
export function decidePropertyWrite(
  item: FDFormItemType,
  value: any,
  model: Record<string, any>,
): { kind: 'set'; value: any } | { kind: 'remove' } | { kind: 'skip'; error?: string } {
  const error = item.validate?.(value, model)
  if (error) return { kind: 'skip', error }
  if (item.show && !item.show(model)) return { kind: 'remove' }
  if (item.omit?.(value, model)) return { kind: 'remove' }
  return { kind: 'set', value: item.cast ? item.cast(value) : value }
}
