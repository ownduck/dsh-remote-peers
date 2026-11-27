// 探针：用插件里同一套 stripVendorEsm / evalVendorModule 编译 pdf.min.mjs、xlsx.mjs、worker 源。
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../vendor', import.meta.url))

function stripVendorEsm(source) {
  let body = source.replaceAll('import.meta.url', '"about:blank"')
  const fields = []
  const hasDefault = /export\s+default\s*/u.test(body)
  body = body.replace(/export\s+default\s*/u, 'const __rpDefault = ')
  body = body.replace(/export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gu, (whole, name) => {
    fields.push([name, name])
    return whole.replace(/^export\s+/u, '')
  })
  body = body.replace(/export\s*\{([^}]*)\}\s*;?/gu, (whole, list) => {
    for (const item of list.split(',')) {
      const parts = item.split(/\s+as\s+/u)
      const local = parts[0].trim()
      if (local === '') continue
      fields.push([(parts[1] ?? parts[0]).trim(), local])
    }
    return ''
  })
  return { body, fields, hasDefault }
}

function evalVendorModule(source) {
  const { body, fields, hasDefault } = stripVendorEsm(source)
  const pairs = fields.map(([exported, local]) => (exported === local ? local : `${JSON.stringify(exported)}:${local}`))
  if (hasDefault) pairs.push('default:__rpDefault')
  return new Function(`"use strict";${body}\nreturn {${pairs.join(',')}};`)()
}

const pdf = evalVendorModule(readFileSync(`${root}/pdfjs/pdf.min.mjs`, 'utf8'))
console.log('pdf keys:', Object.keys(pdf).length, '| getDocument', typeof pdf.getDocument, '| PDFWorker.create', typeof pdf.PDFWorker?.create, '| version', pdf.version)

const xlsx = evalVendorModule(readFileSync(`${root}/xlsx/xlsx.mjs`, 'utf8'))
const sheet = typeof xlsx.read === 'function' ? xlsx : xlsx.default
console.log('xlsx read:', typeof sheet?.read, '| utils:', typeof sheet?.utils, '| version:', sheet?.version)

const workerBody = stripVendorEsm(readFileSync(`${root}/pdfjs/pdf.worker.min.mjs`, 'utf8')).body
try {
  new Function(`"use strict";${workerBody}`)
  console.log('worker parses: ok | tail =', JSON.stringify(workerBody.slice(-70)))
} catch (failure) {
  console.log('worker parse failed:', failure.message)
}
