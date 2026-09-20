/**
 * i18n 残留与键一致性扫描（只读，不改文件）
 *
 *   node scripts/scan-i18n.mjs
 *
 * 四项判定：
 *  1. 代码引用的 fd.* key 在 zh-CN 表里不存在（会回落显示成 key 本身）
 *  2. zh-CN 表里存在但全仓无引用的死键
 *  3. 未被 en-US 覆盖的 key（分层译文的有意缺口，只报数量与清单）
 *  4. 源码里残留的中文字面量（排除注释/样式块/语言包/声明文件/显式豁免）
 *  5. 反向防误译：数据字段（name/value/defaultValue/text）被 t() 赋值
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..', 'packages')
const LOCALE_DIR = path.join(ROOT, 'flow-designer/src/locales')

/** 属流程定义数据、写入图数据的中文默认名，允许保留中文且不参与翻译 */
const DATA_ALLOWLIST = [
  /\btext:\s*'[^']*[\u4e00-\u9fff]/,
  /\bvalue:\s*'[^']*[\u4e00-\u9fff]/,
  /return '(审批人|自定义节点|子流程|新节点)'/,
  /plugins\/Flow\.ts:/,
  /src\/node\//,
  /data\/default-flow\.ts:/,
  /\.vue:.*name: '(条件|分支)\d/,
  /\.vue:.*name: '(开始|申请|结束|合并节点)'/,
  /edge\/Transition\.ts:/,
]

/** 开发者日志与示例注释不是界面文案 */
const LOG_ALLOWLIST = [/console\.\w+\(/, /^\s*messages:\s*\{/]

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.(vue|ts)$/.test(entry.name)) out.push(full)
  }
  return out
}

/** 剥掉块注释、行注释与 style 块，避免把注释里的中文算成待译文案 */
function stripNonCode(source, isVue) {
  let text = source.replace(/\/\*[\s\S]*?\*\//g, '')
  text = text.replace(/<!--[\s\S]*?-->/g, '')
  if (isVue) text = text.replace(/<style[\s\S]*?<\/style>/g, '')
  return text
    .split('\n')
    .filter(line => !/^\s*(\/\/|#)\s*/.test(line) && !/^\s*\*/.test(line))
    .map(dropTrailingComment)
    .join('\n')
}

/** 行尾注释：只在注释符之前引号成对时截断，避免误伤字符串里的 // */
function dropTrailingComment(line) {
  const idx = line.search(/\s\/\//)
  if (idx < 0) return line
  const before = line.slice(0, idx)
  const quotes = (before.match(/'/g) || []).length + (before.match(/"/g) || []).length
  return quotes % 2 === 0 ? before : line
}

const files = walk(ROOT).filter(f => !f.startsWith(LOCALE_DIR) && !/\.d\.ts$/.test(f))
const zh = fs.readFileSync(path.join(LOCALE_DIR, 'messages/zh-CN.ts'), 'utf8')
const en = fs.readFileSync(path.join(LOCALE_DIR, 'messages/en-US.ts'), 'utf8')
const keyOf = line => line.match(/'(fd\.[\w.]+)'\s*:/)?.[1]
const zhKeys = new Set(zh.split('\n').map(keyOf).filter(Boolean))
const enKeys = new Set(en.split('\n').map(keyOf).filter(Boolean))

const referenced = new Map()
const residual = []
const mistranslated = []

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const raw = fs.readFileSync(file, 'utf8')
  const code = stripNonCode(raw, file.endsWith('.vue'))
  code.split('\n').forEach((raw2, i) => {
    const line = `${rel}:${raw2}`
    for (const key of raw2.match(/(['"])(fd\.[\w.]+)\1/g) || []) {
      const name = key.slice(1, -1)
      if (!referenced.has(name)) referenced.set(name, `${rel}:${i + 1}`)
    }
    if (/[\u4e00-\u9fff]/.test(raw2) && /'[^']*[\u4e00-\u9fff][^']*'|"[^"]*[\u4e00-\u9fff][^"]*"/.test(raw2)) {
      if (LOG_ALLOWLIST.some(re => re.test(raw2))) return
      if (!DATA_ALLOWLIST.some(re => re.test(line))) {
        residual.push(`${rel}:${i + 1}  ${raw2.trim().slice(0, 90)}`)
      }
    }
    // 控制面板项的 text 是按钮标题（UI），只有 dndPanel 的 text 落图数据，由 DATA_ALLOWLIST 兜住
    if (/\b(name|value|defaultValue)\s*:\s*t\(/.test(raw2)) {
      mistranslated.push(`${rel}:${i + 1}  ${raw2.trim().slice(0, 90)}`)
    }
  })
}

const missing = [...referenced.keys()].filter(k => !zhKeys.has(k))
const dead = [...zhKeys].filter(k => !referenced.has(k))
const untranslated = [...zhKeys].filter(k => !enKeys.has(k))

console.log(`引用 key ${referenced.size} / zh ${zhKeys.size} / en ${enKeys.size}`)
console.log(`\n[1] zh-CN 缺失（会显示成 key 本身）: ${missing.length}`)
missing.forEach(k => console.log(`  ${k}  ← ${referenced.get(k)}`))
console.log(`\n[2] zh-CN 死键（无引用）: ${dead.length}`)
dead.forEach(k => console.log(`  ${k}`))
console.log(`\n[3] en-US 未覆盖（有意回落中文）: ${untranslated.length}`)
untranslated.forEach(k => console.log(`  ${k}`))
console.log(`\n[4] 残留中文字面量: ${residual.length}`)
residual.forEach(l => console.log(`  ${l}`))
console.log(`\n[5] 数据字段被翻译: ${mistranslated.length}`)
mistranslated.forEach(l => console.log(`  ${l}`))

process.exit(missing.length + mistranslated.length > 0 ? 1 : 0)
