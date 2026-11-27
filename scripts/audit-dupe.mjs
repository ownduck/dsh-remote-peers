// 一次性重复块检测：报连续 ≥6 行完全相同的块（忽略行首缩进），用来找可抽取的重复实现。
import { readFileSync } from 'node:fs'

const target = process.argv[2]
const lines = readFileSync(target, 'utf8').split('\n').map((line) => line.trim())
const WINDOW = 6
const seen = new Map()
const hits = []
for (let i = 0; i + WINDOW <= lines.length; i += 1) {
  const block = lines.slice(i, i + WINDOW).join('\n')
  if (block.replace(/\s/g, '').length < 40) continue
  const first = seen.get(block)
  if (first === undefined) seen.set(block, i + 1)
  else hits.push({ first, again: i + 1, head: lines[i].slice(0, 78) })
}
console.log(`${target}: duplicate blocks=${hits.length}`)
for (const hit of hits) console.log(`  L${hit.first} ≡ L${hit.again}  ${hit.head}`)
