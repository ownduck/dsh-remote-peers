// 探针：把插件 vendor 的 pdf.min.mjs 当模块导入，看命名空间里到底有没有 getDocument。
import { readFileSync } from 'node:fs'

const file = new URL('../vendor/pdfjs/pdf.min.mjs', import.meta.url)
const source = readFileSync(file, 'utf8')
const url = 'data:text/javascript;base64,' + Buffer.from(source, 'utf8').toString('base64')
try {
  const namespace = await import(url)
  console.log('keys:', Object.keys(namespace).length, Object.keys(namespace).slice(0, 30).join(','))
  console.log('has getDocument:', typeof namespace.getDocument)
  console.log('has default:', typeof namespace.default, namespace.default === undefined ? '' : Object.keys(namespace.default).slice(0, 10).join(','))
  console.log('has GlobalWorkerOptions:', typeof namespace.GlobalWorkerOptions)
} catch (failure) {
  console.log('import failed:', failure?.constructor?.name, failure?.message)
}
