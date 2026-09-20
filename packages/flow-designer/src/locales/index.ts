export {
  setLocale,
  getLocale,
  t,
  extendMessages,
  getMessages,
  resolveText,
  useFDLocale,
  FD_DEFAULT_LOCALE,
  FD_KEY_PREFIX,
  FD_MESSAGES_ZH,
  FD_MESSAGES_EN,
} from './store'
export type { FDLocale, FDMessages, FDTranslateParams } from './types'
export type { FDLocaleStore } from './store'

import { watch } from 'vue'
import { extendMessages, setLocale, t } from './store'
import type { FDLocale, FDMessages } from './types'

/**
 * 表单标签列宽：FDFormItem 的 label 是 nowrap，英文串更长需更宽的列，
 * 宽度值本身放在消息表里，随语种一起回落。
 */
export function fdLabelWidth(kind: 'narrow' | 'wide'): string {
  return t(`fd.labelWidth.${kind}`)
}

/**
 * 组件入口用：把 locale / messages prop 落到单例 store。
 * prop 不传时不覆盖，宿主命令式 setLocale 的全局值保持生效。
 */
export function bindFDLocaleProps(props: {
  locale?: FDLocale
  messages?: Record<string, FDMessages>
}): void {
  watch(
    () => props.locale,
    (locale) => {
      if (locale) setLocale(locale)
    },
    { immediate: true }
  )
  watch(
    () => props.messages,
    (messages) => {
      if (!messages) return
      Object.keys(messages).forEach((locale) => extendMessages(locale, messages[locale] || {}))
    },
    { immediate: true, deep: true }
  )
}
