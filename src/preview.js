/** 预览层：PDF/图片/表格三种渲染器、pdfjs 与 xlsx 引擎、预览内的格式化与表格网格。 */
import { createElement, useEffect, useRef, useState } from 'react'
import pdfWorkerSource from '../vendor/pdfjs/pdf.worker.min.mjs'
import { styles } from './theme.js'

const PDFJS = require('pdfjs-dist')
const XLSX_LIB = require('xlsx')
const h = createElement

/** 能直接作为图片预览的扩展名（其余走文本/表格视图）。 */
const IMAGE_SUFFIXES = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg', 'ico'])
/** 右侧面板能内嵌渲染的类型：PDF 走 `<iframe>`、音视频走 `<video>/<audio>`，字节由转发路由直供。 */
const PDF_SUFFIXES = new Set(['pdf'])
const VIDEO_SUFFIXES = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv', 'mkv', 'avi'])
const AUDIO_SUFFIXES = new Set(['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'opus'])
/** Office 容器格式：对端 `officeKit/render` 转成 PDF 再看（与主体 office 同一批扩展名，表格另走 SheetJS）。 */
const OFFICE_SUFFIXES = new Set(['doc', 'docx', 'ppt', 'pptx'])
/** 纯文本系：只有这些扩展名才按行分页读取，其余（zip/docx/xlsx…）按二进制处理。 */
const TEXT_SUFFIXES = new Set([
  'txt', 'text', 'log', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonc', 'jsonl', 'ndjson',
  'js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'tsx', 'jsx', 'css', 'scss', 'less', 'html', 'htm',
  'xml', 'svgz', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env', 'properties', 'gitignore',
  'py', 'go', 'rs', 'java', 'kt', 'c', 'h', 'cc', 'cpp', 'hpp', 'cs', 'php', 'rb', 'lua', 'pl',
  'sh', 'bash', 'zsh', 'ps1', 'bat', 'cmd', 'sql', 'gradle', 'dockerfile', 'makefile', 'lock',
  'srt', 'vtt', 'diff', 'patch', 'tex', 'rtf',
])
/**
 * 扩展名 → 语法语言，逐条照抄主体 `packages/util/code-language/src/index.ts` 的
 * `LANGUAGE_EXTENSIONS`（`CODE_HIGHLIGHT_EXTENSIONS` 就是它的键集合）。
 * 命中的文件按 `code` 预览：交给原生 `MarkdownText` 的代码块渲染，拿到和高亮同一个引擎。
 */
const LANGUAGE_BY_EXT = new Map(Object.entries({
  typescript: ['ts', 'tsx', 'mts', 'cts'],
  javascript: ['js', 'jsx', 'mjs', 'cjs'],
  shellscript: ['sh', 'bash', 'zsh'],
  fish: ['fish'],
  json: ['json', 'jsonc', 'jsonl', 'ndjson', 'ipynb'],
  python: ['py', 'pyw', 'pyi'],
  ruby: ['rb', 'rake', 'gemspec'],
  go: ['go'],
  rust: ['rs'],
  java: ['java'],
  c: ['c', 'h'],
  cpp: ['cc', 'cpp', 'cxx', 'hh', 'hpp', 'hxx'],
  csharp: ['cs'],
  kotlin: ['kt', 'kts'],
  swift: ['swift'],
  php: ['php'],
  yaml: ['yaml', 'yml'],
  toml: ['toml'],
  ini: ['ini', 'conf', 'cfg', 'properties'],
  dotenv: ['env'],
  diff: ['diff', 'patch'],
  http: ['http'],
  mdx: ['mdx'],
  rst: ['rst'],
  latex: ['tex', 'sty', 'cls'],
  bibtex: ['bib'],
  asciidoc: ['adoc'],
  css: ['css'],
  scss: ['scss'],
  less: ['less'],
  sql: ['sql'],
  xml: ['xml', 'xsd', 'xsl', 'xslt', 'plist'],
  lua: ['lua'],
  bat: ['bat', 'cmd'],
  powershell: ['ps1', 'psm1', 'psd1'],
  r: ['r'],
  julia: ['jl'],
  dart: ['dart'],
  scala: ['scala'],
  clojure: ['clj', 'cljs', 'edn'],
  erlang: ['erl', 'hrl'],
  elixir: ['ex', 'exs'],
  haskell: ['hs'],
  fsharp: ['fs', 'fsi', 'fsx'],
  vb: ['vb'],
  perl: ['pl', 'pm'],
  verilog: ['v'],
  'system-verilog': ['sv', 'svh'],
  graphql: ['graphql', 'gql'],
  proto: ['proto'],
  hcl: ['tf', 'tfvars', 'hcl'],
  nix: ['nix'],
  vue: ['vue'],
  svelte: ['svelte'],
  make: ['makefile', 'mk'],
  cmake: ['cmake'],
  groovy: ['gradle', 'groovy'],
}).flatMap(([language, suffixes]) => suffixes.map((suffix) => [suffix, language])))

/** 扩展名（小写、不含点）。 */
export function extOf(name) {
  const clean = String(name ?? '').split(/[\\/]/).pop() ?? ''
  const at = clean.lastIndexOf('.')
  return at <= 0 ? '' : clean.slice(at + 1).toLowerCase()
}

/** CSV：支持引号、成对引号与内嵌逗号/换行，够读导出表。 */
function parseCsvRows(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  const source = String(text ?? '')
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
      continue
    }
    if (char === '"') { quoted = true; continue }
    if (char === ',') { row.push(field); field = ''; continue }
    if (char === '\r') continue
    if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue }
    field += char
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }
  return rows
}

/** 0→A、25→Z、26→AA。 */
function columnName(index) {
  let value = index
  let name = ''
  do {
    name = String.fromCharCode(65 + (value % 26)) + name
    value = Math.floor(value / 26) - 1
  } while (value >= 0)
  return name
}

/** 插件自带资源的取用路径：pdf.js 的 worker 与 cMap/字体/wasm 仍由宿主 asset 路由提供。 */
function assetUrlOf(name) {
  return `/api/remote-peers/asset?name=${encodeURIComponent(name)}`
}

/** TEMP-DIAG：渲染器没有控制台，用宿主的一条 GET 路由把排障信息写进 diag.log。 */
export function diagNote(note) {
  try {
    void fetch(`/api/remote-peers/diag?note=${encodeURIComponent(note)}`).catch(() => {
      // 排障通道自身不可用时不打扰预览主流程。
      return undefined
    })
  } catch (oops) {
    // 同上：诊断写入失败不影响渲染。
    void oops
  }
}

/**
 * pdfjs 引擎：构建期由 esbuild 直接打进 bundle（与主体同版本 6.3.289），运行时不再做动态导入。
 * 这里只留一条断言，避免再把「拿不到模块」的问题带进渲染层。
 */
function pdfjsEngine() {
  const lib = typeof PDFJS?.getDocument === 'function' ? PDFJS : PDFJS?.default
  if (typeof lib?.getDocument !== 'function' || typeof lib?.PDFWorker?.create !== 'function') {
    throw new Error(`pdfjs 未打进 bundle：keys=${Object.keys(PDFJS ?? {}).slice(0, 10).join(',')}`)
  }
  return lib
}

/** pdf.js 的 cMap / 标准字体 / wasm 资源按文件名取字节（原生是编译期 base64 内联的同一批资源）。 */
function pdfBinaryDataFactory() {
  return class PdfBinaryData {
    async fetch({ kind, filename }) {
      const directory = kind === 'cMapUrl'
        ? 'pdfjs/cmaps/'
        : kind === 'standardFontDataUrl'
          ? 'pdfjs/standard_fonts/'
          : 'pdfjs/wasm/'
      const response = await fetch(assetUrlOf(`${directory}${filename}`))
      if (!response.ok) throw new Error(`pdfjs 资源缺失：${kind}/${filename}`)
      return new Uint8Array(await response.arrayBuffer())
    }
  }
}

/**
 * 起一个普通 worker 并等它就绪。worker 源码在构建期已内联（同时去掉了 export 尾巴），
 * `WorkerMessageHandler` 的静态块会自己 `initializeFromPort(self)`。
 */
function startPdfWorker() {
  if (typeof pdfWorkerSource !== 'string' || pdfWorkerSource.length === 0) {
    return Promise.reject(new Error('pdf.worker 源码没有内联进 bundle'))
  }
  const url = URL.createObjectURL(new Blob([
    pdfWorkerSource,
    `\nself.postMessage({ type: 'rp-pdf-ready' });\n`,
  ], { type: 'text/javascript' }))
  const worker = new Worker(url)
  const ready = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('worker 启动超时'))
    }, 15000)
    const onMessage = (event) => {
      if (event?.data?.type !== 'rp-pdf-ready') return
      cleanup()
      resolve(undefined)
    }
    const onError = (event) => {
      cleanup()
      reject(new Error(`worker 启动失败：${event?.message ?? '未知错误'}`))
    }
    const cleanup = () => {
      clearTimeout(timer)
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
    }
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', onError)
  })
  return ready.then(() => ({ worker, url }))
}

/**
 * PDF 预览：与原生 `pdf/LazyPdfBody` 同一套 pdfjs 渲染（canvas + 连续滚动），
 * 工具条按主体外观自绘：页码、缩放、适应宽度、旋转、下载。
 * `url` 是本机的转发路由（对端字节流），组件自己去取字节。
 */
export function PdfPreview(input) {
  const url = input.url
  const name = input.name
  const [phase, setPhase] = useState('loading')
  const [message, setMessage] = useState('')
  const [doc, setDoc] = useState(null)
  const [zoom, setZoom] = useState(null)
  const [pageNo, setPageNo] = useState(1)
  const [width, setWidth] = useState(0)
  const [rotation, setRotation] = useState(0)
  const holderRef = useRef(null)
  const pagesRef = useRef([])
  const scrollRef = useRef(null)

  useEffect(() => {
    let alive = true
    let task = null
    let worker = null
    let workerUrl = null
    let stage = '取字节'
    diagNote(`pdf mount ${String(url).slice(0, 120)}`)
    setPhase('loading')
    setDoc(null)
    ;(async () => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`读取失败 ${response.status}`)
      const type = response.headers.get('content-type') ?? ''
      if (type.includes('json')) {
        const body = await response.json()
        throw new Error(body?.result?.error?.message ?? body?.error?.message ?? '对端没能转换这份文档')
      }
      const bytes = new Uint8Array(await response.arrayBuffer())
      stage = '装载 pdfjs'
      const lib = await pdfjsEngine()
      // 与原生 `openPdf` 一致：自己持有 worker、等它就绪，再用 PDFWorker.create({ port }) 交给 getDocument。
      stage = '启动 worker'
      const started = await startPdfWorker()
      worker = started.worker
      workerUrl = started.url
      stage = '解析文档'
      const bridge = lib.PDFWorker.create({ port: worker })
      task = lib.getDocument({
        data: bytes,
        worker: bridge,
        BinaryDataFactory: pdfBinaryDataFactory(),
        cMapPacked: true,
        useWorkerFetch: false,
        enableXfa: false,
        stopAtErrors: true,
      })
      const loaded = await task.promise
      if (!alive) return
      setDoc(loaded)
      setPhase('ready')
    })().catch((failure) => {
      if (!alive) return
      const text = String(failure?.message ?? failure)
      diagNote(`pdf preview failed at ${stage}: ${text}`)
      setMessage(`${stage}失败：${text}`)
      setPhase('error')
    })
    return () => {
      alive = false
      diagNote('pdf unmount')
      if (task !== null) void task.destroy()
      worker?.terminate()
      if (workerUrl !== null) URL.revokeObjectURL(workerUrl)
    }
  }, [url])

  // 适应宽度：以容器可用宽度对第 1 页取比例（缩放以百分比保存，切页不改比例）。
  useEffect(() => {
    if (doc === null) return
    let cancelled = false
    ;(async () => {
      const first = await doc.getPage(1)
      if (cancelled) return
      const base = first.getViewport({ scale: 1, rotation })
      const box = holderRef.current
      const available = (box?.clientWidth ?? 640) - 48
      setWidth(available)
      setZoom((current) => current ?? Math.round((available / base.width) * 100))
    })()
    return () => { cancelled = true }
  }, [doc, rotation])

  // 逐页渲染：每页一个 canvas，按当前缩放画；页容器先按比例占位，滚动不变形。
  useEffect(() => {
    if (doc === null || zoom === null) return
    let cancelled = false
    const targets = pagesRef.current
    ;(async () => {
      for (let index = 1; index <= doc.numPages; index += 1) {
        if (cancelled) return
        const page = await doc.getPage(index)
        if (cancelled) return
        const ratio = zoom / 100
        const viewport = page.getViewport({ scale: ratio, rotation })
        const canvas = targets[index - 1]
        if (canvas === undefined) continue
        const device = window.devicePixelRatio || 1
        canvas.width = Math.floor(viewport.width * device)
        canvas.height = Math.floor(viewport.height * device)
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        const context = canvas.getContext('2d')
        await page.render({
          canvasContext: context,
          viewport,
          transform: device === 1 ? undefined : [device, 0, 0, device, 0, 0],
        }).promise
      }
    })()
    return () => { cancelled = true }
  }, [doc, zoom, width, rotation])

  const total = doc === null ? 0 : doc.numPages
  const step = (delta) => setZoom((current) => Math.max(20, Math.min(400, (current ?? 100) + delta)))
  const fit = () => {
    if (doc === null) return
    void doc.getPage(1).then((page) => {
      const base = page.getViewport({ scale: 1, rotation })
      const available = (holderRef.current?.clientWidth ?? 640) - 48
      setZoom(Math.round((available / base.width) * 100))
    })
  }
  const scrollToPage = (next) => {
    const target = pagesRef.current[next - 1]
    if (target !== undefined) target.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
  const trackPage = () => {
    const scroll = scrollRef.current
    if (scroll === null) return
    const top = scroll.getBoundingClientRect().top + 12
    let current = 1
    pagesRef.current.forEach((canvas, at) => {
      if (canvas !== undefined && canvas.getBoundingClientRect().top <= top) current = at + 1
    })
    setPageNo(current)
  }

  const toolbar = h('div', { style: styles.pdfBar },
    h('button', { type: 'button', style: styles.pdfTool, title: '上一页', onClick: () => scrollToPage(Math.max(1, pageNo - 1)) }, '‹'),
    h('span', { style: styles.pdfPageNo }, total === 0 ? '—' : `${pageNo} / ${total}`),
    h('button', { type: 'button', style: styles.pdfTool, title: '下一页', onClick: () => scrollToPage(Math.min(total || 1, pageNo + 1)) }, '›'),
    h('span', { style: styles.pdfDivider }),
    h('button', { type: 'button', style: styles.pdfTool, title: '缩小', onClick: () => step(-10) }, '−'),
    h('span', { style: styles.pdfZoom }, zoom === null ? '—' : `${zoom}%`),
    h('button', { type: 'button', style: styles.pdfTool, title: '放大', onClick: () => step(10) }, '+'),
    h('span', { style: { flex: 1 } }),
    h('button', { type: 'button', style: styles.pdfTool, title: '旋转 90°', onClick: () => setRotation((current) => (current + 90) % 360) }, '⟳'),
    h('button', { type: 'button', style: styles.pdfTool, title: '适应宽度', onClick: fit }, '⇔'),
    h('a', { href: url, download: name, style: styles.pdfToolLink, title: '下载' }, '⤓'),
  )

  if (phase === 'error') {
    return h('div', { style: styles.pdfWrap },
      toolbar,
      h('div', { style: styles.pdfError }, message || '文档打开失败'),
    )
  }
  if (phase === 'loading' || doc === null) {
    return h('div', { style: styles.pdfWrap }, toolbar, renderPreviewLoading())
  }
  return h('div', { style: styles.pdfWrap },
    toolbar,
    h('div', { style: styles.pdfScroll, ref: scrollRef, onScroll: trackPage },
      h('div', { style: styles.pdfPages, ref: holderRef },
        Array.from({ length: doc.numPages }, (_, at) => h('canvas', {
          key: `${at}`,
          ref: (element) => { pagesRef.current[at] = element ?? undefined },
          style: styles.pdfCanvas,
        })),
      ),
    ),
  )
}

/** 图片预览：适应宽度 / 百分比缩放 / Ctrl+滚轮缩放（对齐主体 image 的缩放视口）。 */
export function ImagePreview(input) {
  const url = input.url
  const name = input.name
  const [zoom, setZoom] = useState(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [failed, setFailed] = useState(false)
  const boxRef = useRef(null)
  const fit = () => {
    if (size.width === 0) return
    const available = (boxRef.current?.clientWidth ?? 600) - 32
    setZoom(Math.round((available / size.width) * 100))
  }
  const step = (delta) => setZoom((current) => Math.max(10, Math.min(400), (current ?? 100) + delta))
  return h('div', { style: styles.imgWrap },
    h('div', { style: styles.pdfBar },
      h('button', { type: 'button', style: styles.pdfTool, title: '缩小', onClick: () => step(-10) }, '−'),
      h('span', { style: styles.pdfZoom }, zoom === null ? '—' : `${zoom}%`),
      h('button', { type: 'button', style: styles.pdfTool, title: '放大', onClick: () => step(10) }, '+'),
      h('button', { type: 'button', style: styles.pdfTool, title: '适应宽度', onClick: fit }, '⇔'),
      h('button', { type: 'button', style: styles.pdfTool, title: '原始大小', onClick: () => setZoom(100) }, '1:1'),
      h('span', { style: { flex: 1 } }),
      h('a', { href: url, download: name, style: styles.pdfToolLink, title: '下载' }, '⤓'),
    ),
    h('div', {
      style: styles.imgScroll,
      ref: boxRef,
      onWheel: (event) => {
        if (!event.ctrlKey) return
        event.preventDefault()
        step(event.deltaY < 0 ? 10 : -10)
      },
    },
      h('img', {
        src: url,
        alt: name,
        style: zoom === null ? styles.previewImg : { ...styles.previewImg, width: Math.round(size.width * (zoom / 100)) || undefined },
        onLoad: (event) => {
          const image = event.currentTarget
          setSize({ width: image.naturalWidth, height: image.naturalHeight })
          if (zoom === null) {
            const available = (boxRef.current?.clientWidth ?? 600) - 32
            setZoom(Math.round((available / (image.naturalWidth || 1)) * 100))
          }
        },
        onError: () => setFailed(true),
      }),
      failed ? h('div', { style: styles.pdfError }, '图片不可用，可能已被移动或删除') : null,
    ),
  )
}

/** SheetJS 引擎：构建期由 esbuild 打进 bundle（主体 Excel 预览用的就是它，0.20.3）。 */
function xlsxEngine() {
  const lib = typeof XLSX_LIB?.read === 'function' ? XLSX_LIB : XLSX_LIB?.default
  if (typeof lib?.read !== 'function') {
    throw new Error(`SheetJS 未打进 bundle：keys=${Object.keys(XLSX_LIB ?? {}).slice(0, 10).join(',')}`)
  }
  return lib
}

/**
 * Excel / XLS 预览：按主体同源方案用 SheetJS 解包，再按 `excel` 工具条外观自绘网格
 * （列标 + 行号 + 表头行 + 底部 Sheet 页签）。只读，不对对端文件做任何改动。
 */
export function ExcelPreview(input) {
  const url = input.url
  const [phase, setPhase] = useState('loading')
  const [message, setMessage] = useState('')
  const [sheets, setSheets] = useState([])
  const [active, setActive] = useState(0)
  useEffect(() => {
    let alive = true
    diagNote(`xlsx mount ${String(url).slice(-60)}`)
    setPhase('loading')
    setSheets([])
    ;(async () => {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`读取失败 ${response.status}`)
      const bytes = new Uint8Array(await response.arrayBuffer())
      const lib = await xlsxEngine()
      const book = lib.read(bytes, { type: 'array', cellDates: true })
      const list = (book.SheetNames ?? []).map((sheetName) => {
        const sheet = book.Sheets[sheetName] ?? {}
        const rows = lib.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '', blankrows: false })
        const widths = (sheet['!cols'] ?? []).map((column) => (column?.wpx ?? (column?.wch === undefined ? undefined : Math.round(column.wch * 8 + 10))))
        return { name: sheetName, rows, widths }
      })
      if (!alive) return
      setSheets(list)
      setActive(0)
      setPhase('ready')
    })().catch((failure) => {
      if (!alive) return
      setMessage(String(failure?.message ?? failure))
      setPhase('error')
    })
    return () => { alive = false }
  }, [url])

  if (phase !== 'ready') {
    return h('div', { style: styles.previewCsvBody },
      phase === 'error'
        ? h('div', { style: { ...styles.previewScroller, ...styles.previewTextDoc, color: 'var(--dsw-alias-state-error-primary, #c0392b)' } }, message || '表格打开失败')
        : renderPreviewLoading(),
    )
  }
  const sheet = sheets[active] ?? { name: '', rows: [], widths: [] }
  const shown = (sheet.rows ?? []).slice(0, 400)
  const columns = Math.max(1, shown.reduce((widest, row) => Math.max(widest, row.length), 1), sheet.widths.length)
  const template = `28px ${Array.from({ length: columns }, (_, at) => {
    const width = sheet.widths[at]
    return typeof width === 'number' && width > 0 ? `${Math.max(56, Math.min(320, width))}px` : 'minmax(88px, 1fr)'
  }).join(' ')}`
  return h('div', { style: styles.previewCsvBody },
    tableFormulaBar(shown[0]?.[0]),
    tableGrid(shown, columns, template),
    h('div', { style: styles.excelTabs },
      sheets.map((item, at) => h('button', {
        key: `${at}`,
        type: 'button',
        style: at === active ? { ...styles.excelTab, ...styles.excelTabActive } : styles.excelTab,
        onClick: () => setActive(at),
      }, item.name)),
      h('span', { style: { flex: 1 } }),
      h('span', { style: styles.csvFooterText }, `${shown.length} 行 · 100%`),
    ),
  )
}

export function renderPreviewLoading() {
  return h('div', { style: styles.previewLoading, role: 'status', 'aria-label': '文档渲染中...' },
    h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', style: styles.previewSpinner, 'aria-hidden': 'true' },
      h('g', { style: styles.previewSpinnerMotion },
        h('circle', { cx: 12, cy: 12, r: 9.5, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', opacity: 0.25 }),
        h('circle', { cx: 12, cy: 12, r: 9.5, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeDasharray: '12 150', style: styles.previewSpinnerArc }),
      ),
    ),
    h('span', null, '文档渲染中...'),
  )
}

/** 文件大小（原生文件树用 B/KB/MB 的紧凑写法）。 */
export function formatBytes(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return ''
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

/**
 * 表格网格（列标 + 行号 + 单元格）：CSV 预览与 xlsx 工作表预览共用同一套外观。
 * @param shown - 已截断到可视行数的二维单元格
 * @param columns - 列数
 * @param template - `gridTemplateColumns`（首列固定行号宽）
 */
function tableGrid(shown, columns, template) {
  const headerRow = h('div', { key: 'cols', style: { display: 'grid', gridTemplateColumns: template, position: 'sticky', top: 0, zIndex: 2 } },
    h('div', { style: { ...styles.csvColHead, position: 'static' } }, ''),
    Array.from({ length: columns }, (_, at) => h('div', { key: at, style: { ...styles.csvColHead, position: 'static' } }, columnName(at))),
  )
  const bodyRows = shown.map((row, rowIndex) => h('div', { key: rowIndex, style: { display: 'grid', gridTemplateColumns: template } },
    h('div', { style: { ...styles.csvRowHead, position: 'static' } }, String(rowIndex + 1)),
    Array.from({ length: columns }, (_, at) => h('div', { key: at, style: styles.csvCell, title: row[at] ?? '' }, row[at] ?? '')),
  ))
  return h('div', { style: styles.csvGridWrap },
    h('div', { style: styles.csvGrid }, headerRow, bodyRows),
  )
}

/** 表格上方的 A1 / fx 条（公式栏外观，取当前选中单元格的值）。 */
function tableFormulaBar(value) {
  return h('div', { style: styles.csvBar },
    h('span', { style: styles.csvCellRef }, 'A1'),
    h('span', { style: styles.csvFx }, 'fx'),
    h('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, value ?? ''),
  )
}

/** CSV：A1 / fx 工具条 + 列标 + 行号 + 单元格网格 + 底部 `CSV 100%`（同原生表格预览外观）。 */
export function renderCsvBody(text) {
  const rows = parseCsvRows(text)
  const shown = rows.slice(0, 200)
  const columns = shown.reduce((widest, row) => Math.max(widest, row.length), 1)
  const template = `28px repeat(${columns}, minmax(72px, 1fr))`
  return h('div', { style: styles.previewCsvBody },
    tableFormulaBar(shown[0]?.[0]),
    tableGrid(shown, columns, template),
    h('div', { style: styles.csvFooter },
      h('span', null, 'CSV'),
      h('span', { style: { flex: 1 } }),
      h('span', null, '100%'),
    ),
  )
}

/**
 * 按扩展名挑预览方式。返回 `'binary'` 表示右侧面板无法内嵌渲染
 * （zip / docx / xlsx / pptx / exe…），调用方改走「显示文件位置」的路径页。
 */
export function previewModeOf(path) {
  const suffix = extOf(path)
  if (IMAGE_SUFFIXES.has(suffix)) return 'image'
  if (PDF_SUFFIXES.has(suffix)) return 'pdf'
  if (VIDEO_SUFFIXES.has(suffix)) return 'video'
  if (AUDIO_SUFFIXES.has(suffix)) return 'audio'
  if (OFFICE_SUFFIXES.has(suffix)) return 'office'
  if (suffix === 'xlsx' || suffix === 'xls') return 'excel'
  if (suffix === 'html' || suffix === 'htm') return 'html'
  if (suffix === 'csv' || suffix === 'tsv') return 'csv'
  if (suffix === 'md' || suffix === 'markdown') return 'markdown'
  if (LANGUAGE_BY_EXT.has(suffix)) return 'code'
  if (suffix === '' || TEXT_SUFFIXES.has(suffix)) return 'text'
  return 'binary'
}
