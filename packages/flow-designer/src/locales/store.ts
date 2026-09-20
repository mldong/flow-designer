import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue'
import type { FDLocale, FDMessages, FDTranslateParams } from './types'
import zhCN from './messages/zh-CN'
import enUS from './messages/en-US'
import { FD_RAW } from './messages/raw'

export const FD_DEFAULT_LOCALE: FDLocale = 'zh-CN'
export const FD_KEY_PREFIX = 'fd.'

interface FDLocaleState {
  locale: ShallowRef<FDLocale>
  /** 消息表整体替换（不深递归），extendMessages 也要能触发已渲染表单重算 */
  messages: ShallowRef<Record<string, FDMessages>>
}

/**
 * 单例挂在 globalThis：`files` 白名单含 packages 目录，集成方可能同时从
 * 源码入口与 lib 产物（或 UMD + ESM）各引一份，两份模块作用域会各自建 store，
 * 导致 setLocale 只作用于其中一份。
 */
const GLOBAL_KEY = '__MLDONG_FLOW_DESIGNER_LOCALE__'

function createState(): FDLocaleState {
  return {
    locale: shallowRef<FDLocale>(FD_DEFAULT_LOCALE),
    messages: shallowRef<Record<string, FDMessages>>({ 'zh-CN': { ...zhCN }, 'en-US': { ...enUS } }),
  }
}

const g = globalThis as Record<string, any>
let state: FDLocaleState = g[GLOBAL_KEY]
if (!state) {
  state = createState()
  g[GLOBAL_KEY] = state
}

export function setLocale(locale: FDLocale): void {
  if (typeof locale !== 'string' || !locale) return
  state.locale.value = locale
}

export function getLocale(): FDLocale {
  return state.locale.value
}

/** 整体覆盖/追加词条，供集成方改术语（如「参与人」→「办理人」）或补语种 */
export function extendMessages(locale: FDLocale, messages: FDMessages): void {
  state.messages.value = {
    ...state.messages.value,
    [locale]: { ...(state.messages.value[locale] || {}), ...messages },
  }
}

export function getMessages(locale: FDLocale = state.locale.value): FDMessages {
  return { ...(state.messages.value[locale] || {}) }
}

function interpolate(text: string, params?: FDTranslateParams): string {
  return text.replace(/\{(\w+)\}/g, (match, token: string) => {
    const value = params?.[token]
    if (value === undefined || value === null) return FD_RAW[token] ?? match
    return typeof value === 'string' ? value : String(value)
  })
}

const warned = new Set<string>()

/** 取当前语种文案；缺译回落 zh-CN；zh-CN 也没有则返回 key 本身 */
export function t(key: string, params?: FDTranslateParams): string {
  if (!key) return key
  const messages = state.messages.value
  const current = state.locale.value
  const text = messages[current]?.[key] ?? messages[FD_DEFAULT_LOCALE]?.[key]
  if (text === undefined) {
    if (!warned.has(key)) {
      warned.add(key)
      console.warn(`[mldong-flow-designer] missing message: ${key}`)
    }
    return key
  }
  return interpolate(text, params)
}

/** 只有 `fd.` 前缀的串才当 key 解引用，其余（含集成方自定义文案）原样输出 */
export function resolveText<T>(value: T, params?: FDTranslateParams): T {
  if (typeof value === 'string' && value.startsWith(FD_KEY_PREFIX)) {
    return t(value, params) as unknown as T
  }
  return value
}

export interface FDLocaleStore {
  locale: ComputedRef<FDLocale>
  t: typeof t
  setLocale: typeof setLocale
  resolve: typeof resolveText
}

export function useFDLocale(): FDLocaleStore {
  return {
    locale: computed(() => state.locale.value),
    t,
    setLocale,
    resolve: resolveText,
  }
}

export { zhCN as FD_MESSAGES_ZH, enUS as FD_MESSAGES_EN }
export type { FDLocale, FDMessages, FDTranslateParams } from './types'
