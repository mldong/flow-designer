/**
 * 颜色枚举
 */
export enum ColorEnum {
  primaryColor = '#3068EC', // 主题色
  edgePrimaryColor = '#C9CCD4', // 边主题色
  activeColor = '#FA7E55', // 进行时节点颜色
  historyColor = '#28C7A3', // 历史节点/边颜色
  backgroundColor = '#FFFFFF' // 画布背景颜色
}
/**
 * 节点状态枚举
 */
export enum NodeStateEnum {
  history = 'history',
  active = 'active',
  normal = 'normal'
}
/**
 * 退回发起人后的重提方式（任务节点 properties.reapplyMode）
 * NORMAL = 按流程重新审批（缺省/空值同此）；RETURN_TO_SOURCE = 直接返回本节点
 * 引擎只认这两个值，其他值属配置错误
 */
export enum ReapplyModeEnum {
  normal = 'NORMAL',
  returnToSource = 'RETURN_TO_SOURCE'
}
/**
 * 节点类型枚举
 */
export enum NodeTypeEnum {
  start = 'start',
  end = 'end',
  task = 'task',
  process = 'process',
  subProcess = 'subProcess',
  decision = 'decision',
  fork = 'fork',
  join = 'join',
  custom = 'custom'
}