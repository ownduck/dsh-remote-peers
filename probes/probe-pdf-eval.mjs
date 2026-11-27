// 探针：按插件里同一套「去 ESM 化」把 pdf.min.mjs 编译成对象，验证导出是否完整。
import { readFileSync } from 'node:fs'

const file = new URL('../vendor/pdfjs/pdf.min.mjs', import.meta.url)
const source = readFileSync(file, 'utf8')

function evalVendorModule(text) {
  const patched = text.replaceAll('import.meta.url', '"about:blank"')
  const defaultAt = patched.lastIndexOf('export default')
  if (defaultAt >= 0) {
    const body = `${patched.slice(0, defaultAt)}return ${patched.slice(defaultAt + 'export default'.length)}`
    return { default: new Function(`"use strict";${body}`)() }
  }
  const exportAt = patched.lastIndexOf('export{')
  if (exportAt < 0) throw new Error('不是预期的 ESM 结构')
  const list = patched.slice(exportAt + 'export{'.length, patched.lastIndexOf('}'))
  const fields = list.split(',').map((item) => {
    const parts = item.split(/\s+as\s+/u)
    const local = parts[0].trim()
    const exported = (parts[1] ?? parts[0]).trim()
    return exported === local ? local : `${JSON.stringify(exported)}:${local}`
  })
  const body = `${patched.slice(0, exportAt)}return {${fields.join(',')}};`
  return new Function(`"use strict";${body}`)()
}

const lib = evalVendorModule(source)
console.log('keys:', Object.keys(lib).length)
console.log('getDocument:', typeof lib.getDocument)
console.log('PDFWorker.create:', typeof lib.PDFWorker?.create)
console.log('GlobalWorkerOptions:', typeof lib.GlobalWorkerOptions)
console.log('version:', lib.version)
