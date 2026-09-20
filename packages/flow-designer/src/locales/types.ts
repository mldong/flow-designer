export type FDBuiltinLocale = 'zh-CN' | 'en-US'

/** 内置 zh-CN / en-US，同时允许集成方自定义语种码 */
export type FDLocale = FDBuiltinLocale | (string & {})

/** 扁平消息表：key 为 `fd.` 点分路径，value 为含 `{name}` 占位符的文案 */
export type FDMessages = Record<string, string>

export type FDTranslateParams = Record<string, unknown>
