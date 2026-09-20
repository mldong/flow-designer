/**
 * mldong-flow-designer-dingtalk 精简包入口
 *
 * 仅包含钉钉风格树形设计器，不引入 @logicflow/* 依赖。
 * 与双模式包（mldong-flow-designer-plus）的组件注册名、props/events 契约一致，
 * 集成方可在两个包之间无缝切换。
 */
import type { App, Plugin } from 'vue'
import FlowDesigner from './flow-designer/src/index.dingtalk.vue'
const MFlowDesigner: any = FlowDesigner
MFlowDesigner.install = function (app: App, options: any) {
  app.component('MldongFlowDesignerPlus', MFlowDesigner)
  // 4.0.0 起 UI 全部自研（FD 组件族），options.uiLibrary 仅保留接收不再生效
  void options
}
export default MFlowDesigner as typeof MFlowDesigner &
  Plugin

// 钉钉设计器 API 类型（与画布模式 lf 实例兼容命名）
export type { FDDesignerAPI, FDEventCenter, FDEventName, FDNodeData } from './flow-designer/src/dingtalk/types/api'

// 内置文案语种 API（命令式；组件上也有同名 locale / messages prop）
export {
  setLocale,
  getLocale,
  t,
  extendMessages,
  getMessages,
  useFDLocale,
  fdLabelWidth,
  FD_MESSAGES_ZH,
  FD_MESSAGES_EN,
  FD_DEFAULT_LOCALE,
} from './flow-designer/src/locales'
export type { FDLocale, FDMessages, FDTranslateParams } from './flow-designer/src/locales'
