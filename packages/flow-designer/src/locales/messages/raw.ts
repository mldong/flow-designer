/**
 * 引擎字面量：这些串属于流程定义数据/引擎契约，任何语种下都不得翻译，
 * 由 t() 作为默认插值参数注入，消息文本里以 {TOKEN} 占位引用。
 */
export const FD_RAW: Record<string, string> = {
  ARCHIVE: 'ARCHIVE',
  SYNC: 'SYNC',
  PersistPostInterceptor: 'PersistPostInterceptor',
  AGREE: 'AGREE',
  REJECT: 'REJECT',
  ROLLBACK: 'ROLLBACK',
  ROLLBACK_TO_OPERATOR: 'ROLLBACK_TO_OPERATOR',
  JUMP: 'JUMP',
  COUNTERSIGN_DISAGREE: 'COUNTERSIGN_DISAGREE',
  ADD_CANDIDATE: 'ADD_CANDIDATE',
  nrOfCompletedInstances: 'nrOfCompletedInstances',
  nrOfInstances: 'nrOfInstances',
  biz_leave: 'biz_leave',
}

export default FD_RAW
