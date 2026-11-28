// 冒烟：按宿主的 ModuleLoader 外壳执行 lib/client.js，确认导出与内嵌的 pdfjs / SheetJS。
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const code = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

const reactStub = {
  Component: class { constructor(props) { this.props = props } },
  createElement: () => ({ type: 'div' }),
  Fragment: 'fragment',
  useState: (value) => [typeof value === 'function' ? value() : value, () => {}],
  useEffect: () => {},
  useRef: (value) => ({ current: value }),
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
  createContext: () => ({ Provider: null }),
}

let captured = null
const sandbox = {
  window: {
    __ModuleLoader__: {
      load: (entry) => {
        captured = entry
      },
    },
  },
  console,
  setTimeout,
  clearTimeout,
  Promise,
  URL,
  TextEncoder,
  TextDecoder,
  fetch: () => Promise.reject(new Error('no network in probe')),
  document: undefined,
  require: (name) => (name === 'react' ? reactStub : undefined),
}
vm.createContext(sandbox)
vm.runInContext(code, sandbox, { filename: 'lib/client.js' })

console.log('loader id:', captured?.id, '| has factory:', typeof captured?.factory)
const exportsObject = captured?.factory((name) => {
  if (name === 'react') return reactStub
  throw new Error(`unexpected require: ${name}`)
})
console.log('exports keys:', Object.keys(exportsObject ?? {}).join(','))
console.log('name:', exportsObject?.name, '| inject:', exportsObject?.inject?.join(',') ?? '')
console.log('apply:', typeof exportsObject?.apply, '| PANEL_ID:', exportsObject?.PANEL_ID)

// 内嵌库的痕迹
const pdfMarker = code.includes('PDFDocumentLoadingTask') && code.includes('GlobalWorkerOptions')
const sheetMarker = code.includes('SheetJS') || code.includes('sheet_to_json')
console.log('pdfjs bundled:', pdfMarker, '| SheetJS bundled:', sheetMarker)
const versionHit = code.match(/6\.3\.289|0\.20\.3/gu)
console.log('version hits:', versionHit?.join(',') ?? 'none')
