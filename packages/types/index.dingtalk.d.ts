import type { DefineComponent, ExtractPropTypes } from "vue";
import type { FDLocale, FDMessages, FDTranslateParams } from '../flow-designer/src/locales';
import { MldongFlowDesignerProps } from '../flow-designer/src/types/props.ts'
type mProps = Partial<ExtractPropTypes<typeof MldongFlowDesignerProps>>

declare module 'mldong-flow-designer-dingtalk' {
  const _default: DefineComponent<mProps>
  export default _default
  export function setLocale(locale: FDLocale): void
  export function getLocale(): FDLocale
  export function t(key: string, params?: FDTranslateParams): string
  export function extendMessages(locale: FDLocale, messages: FDMessages): void
  export function getMessages(locale?: FDLocale): FDMessages
  export function fdLabelWidth(kind: 'narrow' | 'wide'): string
  export const FD_MESSAGES_ZH: FDMessages;
  export const FD_MESSAGES_EN: FDMessages;
  export const FD_DEFAULT_LOCALE: FDLocale;
  export type { FDLocale, FDMessages, FDTranslateParams };
}
// 导出所有的类型（自包含，不依赖 @logicflow/core）
export * from '../flow-designer/src/types'
// 钉钉设计器 API 类型（与画布模式 lf 实例兼容命名）
export type { FDDesignerAPI, FDEventCenter, FDEventName, FDNodeData } from '../flow-designer/src/dingtalk/types/api'
