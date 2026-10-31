import { ReapplyModeEnum } from '../types/enums'

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
