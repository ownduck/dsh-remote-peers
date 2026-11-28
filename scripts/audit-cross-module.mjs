/**
 * 跨模块符号守卫：某个模块用到了兄弟模块导出的名字却没 import，运行时才会炸 `X is not defined`。
 * 这条检查补的正是「删 import 时顺手删掉仍在用的名字」这类回归（例如 `diagNote`）。
 * 用法：node scripts/audit-cross-module.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const files = ['client.js', 'preview.js', 'conversation.js', 'icons.js', 'theme.js']

/** 收集 `export function|const|class NAME` 与 `export { a, b }` 两种导出形态。 */
function exportsOf(code) {
  const names = new Set()
  for (const match of code.matchAll(/export (?:async )?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(match[1])
  for (const match of code.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim()
      if (name !== undefined && name !== '') names.add(name)
    }
  }
  return names
}

/** 该文件从兄弟模块 import 进来的名字。 */
function importsOf(code) {
  const names = new Set()
  for (const match of code.matchAll(/import\s*\{([^}]*)\}\s*from\s*'\.\/[^']+'/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim()
      if (name !== undefined && name !== '') names.add(name)
    }
  }
  return names
}

let failures = 0
/** 去掉注释与字符串字面量：常量名守卫只看真代码里的标识符。 */
function stripLiterals(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/`(?:\\.|[^`\\])*`/g, '``')
}

/** 文件里声明的顶层名字（含 import）。 */
function declaredOf(code) {
  const names = new Set(importsOf(code))
  for (const match of code.matchAll(/(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g)) names.add(match[1])
  for (const match of code.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim()
      if (name !== undefined && name !== '') names.add(name)
    }
  }
  return names
}

for (const file of files) {
  const code = readFileSync(join(root, file), 'utf8')
  const imported = importsOf(code)
  // import 语句本身要排除，否则名字出现一次就算「用到了」。
  const body = code.replace(/^import[\s\S]*?from\s*'\.\/[^']+'\s*$/gm, '')
  for (const sibling of files) {
    if (sibling === file) continue
    for (const name of exportsOf(readFileSync(join(root, sibling), 'utf8'))) {
      if (imported.has(name)) continue
      const uses = body.match(new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\b`, 'g'))?.length ?? 0
      if (uses === 0) continue
      console.log(`${file}: 用了 ${name}（来自 ${sibling}）但没 import`)
      failures += 1
    }
  }
  // 全大写常量：本文件没声明也没 import，却出现在代码里 —— 拆分模块时最常漏的一类（`LANGUAGE_BY_EXT`）。
  const declared = declaredOf(code)
  const identifiers = stripLiterals(body).match(/(?<![.\w$])[A-Z][A-Z0-9_]{2,}\b/g) ?? []
  for (const name of new Set(identifiers)) {
    if (declared.has(name)) continue
    // 只报「本仓库另有同名声明」的：纯外来的全大写词（例如协议字面量）不算。
    const known = files.some((other) => declaredOf(readFileSync(join(root, other), 'utf8')).has(name))
    if (!known) continue
    console.log(`${file}: 用了常量 ${name}，但本文件没声明也没 import`)
    failures += 1
  }
}
console.log(failures === 0 ? '跨模块符号: 全部已 import' : `跨模块符号: ${failures} 处缺失`)
process.exit(failures === 0 ? 0 : 1)
