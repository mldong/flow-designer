import type { DefineComponent, ExtractPropTypes } from "vue";
import type * as LogicFlowCore from '@logicflow/core';
import type * as LogicFlowExtension from '@logicflow/extension';
import type { FDLocale, FDMessages, FDTranslateParams } from '../flow-designer/src/locales';
import { MldongFlowDesignerProps } from '../flow-designer/src/types/props.ts'
type mProps = Partial<ExtractPropTypes<typeof MldongFlowDesignerProps>>

declare module 'mldong-flow-designer-plus' {
  const _default: DefineComponent<mProps>
  export default _default
  export const LogicFlowCore: typeof LogicFlowCore;
  export const LogicFlowExtension: typeof LogicFlowExtension;
  export function setLocale(locale: FDLocale): void
  export function getLocale(): FDLocale
  export function t(key: string, params?: FDTranslateParams): string
  export function extendMessages(locale: FDLocale, messages: FDMessages): void
  export function getMessages(locale?: FDLocale): FDMessages
  export function fdLabelWidth(kind: 'narrow' | 'wide'): string
  export function useFDLocale(): {
    locale: { value: FDLocale };
    t: typeof t;
    setLocale: typeof setLocale;
    resolve<T>(value: T, params?: FDTranslateParams): T;
  }
  export const FD_MESSAGES_ZH: FDMessages;
  export const FD_MESSAGES_EN: FDMessages;
  export const FD_DEFAULT_LOCALE: FDLocale;
  export type { FDLocale, FDMessages, FDTranslateParams };
}
// 导出所有的类型
export * from '../flow-designer/src/types'