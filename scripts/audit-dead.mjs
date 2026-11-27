// 一次性静态审计：报「声明后只出现一次」的标识符（疑似死代码）与未被使用的样式/函数。
// 只做候选列表，删除由人工确认；动态访问（字符串取键）也算候选需人工核。
import { readFileSync } from 'node:fs'

const target = process.argv[2]
const source = readFileSync(target, 'utf8')
const lines = source.split('\n')

const decls = []
for (let i = 0; i < lines.length; i += 1) {
  const m = /^\s*(?:export\s+)?(?:async\s+)?(?:const|let|var|function|class)\s+(\w+)/u.exec(lines[i])
  if (m !== null) decls.push({ name: m[1], line: i + 1, text: lines[i].trim().slice(0, 70) })
}

const counts = new Map()
for (const d of decls) {
  const re = new RegExp(`\\b${d.name}\\b`, 'gu')
  counts.set(d.name, (source.match(re)?.length ?? 0) + (counts.get(d.name) ?? 0))
}

const dead = decls.filter((d) => (source.match(new RegExp(`\\b${d.name}\\b`, 'gu'))?.length ?? 0) <= 1)
console.log(`${target}: lines=${lines.length} decls=${decls.length} dead=${dead.length}`)
for (const d of dead) console.log(`  L${d.line} ${d.text}`)
