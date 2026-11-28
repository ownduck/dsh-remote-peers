// 冒烟：把每个图标字形都真正执行一遍。拆分模块后出现过「函数体里用了没 import 的令牌（T）」
// 这类只在运行时才炸的错误，静态检查（node --check / esbuild）都看不见，所以这里逐个调用。
import { build } from 'esbuild'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const outdir = mkdtempSync(join(tmpdir(), 'rp-glyphs-'))
const outfile = join(outdir, 'icons.mjs')
await build({
  entryPoints: [new URL('../src/icons.js', import.meta.url).pathname.replace(/^\/([A-Z]:)/u, '$1')],
  outfile,
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  alias: { react: new URL('./react-shim.mjs', import.meta.url).pathname.replace(/^\/([A-Z]:)/u, '$1') },
  logLevel: 'silent',
})

const icons = await import(pathToFileURL(outfile).href)
let checked = 0
const failures = []
for (const [name, value] of Object.entries(icons)) {
  if (typeof value !== 'function') continue
  checked += 1
  // 字形签名要么 (size)，要么 (state, size)，两参都给一遍即可覆盖分支
  for (const args of [[14], [true, 14], [42, 14]]) {
    try {
      value(...args)
    } catch (failure) {
      failures.push(`${name}(${args.join(',')}): ${String(failure?.message ?? failure)}`)
    }
  }
}

rmSync(outdir, { recursive: true, force: true })
console.log('执行字形数:', checked, '| 失败:', failures.length)
for (const line of failures) console.log('  ' + line)
if (failures.length > 0) process.exitCode = 1
