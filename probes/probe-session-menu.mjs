// 冒烟：会话行的「⋯ → 菜单 → 重命名对话框」与工作区会话水位（展开其余 N 个会话 / 收起）。
// 用与 probe-render-page.mjs 相同的最小 React 驱动 lib/client.js，只换数据与断言。
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const code = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

const textOf = (node, out = []) => {
  if (node === null || node === undefined || node === false || node === true) return out
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out }
  if (Array.isArray(node)) { for (const child of node) textOf(child, out); return out }
  textOf(node.props?.children, out)
  return out
}

const nodesWhere = (node, predicate, out = []) => {
  if (node === null || node === undefined || typeof node !== 'object') return out
  if (Array.isArray(node)) { for (const child of node) nodesWhere(child, predicate, out); return out }
  if (predicate(node)) out.push(node)
  nodesWhere(node.props?.children, predicate, out)
  return out
}

const workspacePath = 'C:\\Users\\Administrator\\Documents\\vertax-work\\default-workspace'
const sessionsPayload = {
  items: Array.from({ length: 7 }, (_, index) => ({
    sessionId: `s${index + 1}`,
    cwd: workspacePath,
    updatedAt: 100 + index,
    projections: { values: { title: `会话${index + 1}` } },
  })),
}

let cells = []
let cursor = 0
let pendingEffects = []
let dirty = false

const sameDeps = (left, right) => Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => Object.is(item, right[index]))

const reactStub = {
  Component: class { constructor(props) { this.props = props } },
  createElement: (type, props, ...children) => {
    const merged = children.length === 0 ? props?.children : (children.length === 1 ? children[0] : children)
    const finalProps = { ...(props ?? {}), children: merged }
    if (typeof type === 'function') {
      if (type.prototype?.isReactComponent === true || type.isReactComponent === true) {
        const instance = new type(finalProps)
        instance.props = finalProps
        instance.state = instance.state ?? null
        return instance.render()
      }
      return type(finalProps)
    }
    return { type, props: finalProps }
  },
  Fragment: 'fragment',
  useState: (initial) => {
    const index = cursor++
    if (!(index in cells)) cells[index] = typeof initial === 'function' ? initial() : initial
    const set = (value) => {
      const next = typeof value === 'function' ? value(cells[index]) : value
      if (Object.is(next, cells[index])) return
      cells[index] = next
      dirty = true
    }
    return [cells[index], set]
  },
  useEffect: (fn, deps) => {
    const index = cursor++
    const previous = cells[`deps-${index}`]
    if (Array.isArray(deps) && sameDeps(previous, deps)) return
    cells[`deps-${index}`] = deps
    pendingEffects.push(fn)
  },
  useCallback: (fn) => fn,
  useRef: (value) => {
    const index = cursor++
    if (!(index in cells)) cells[index] = { current: value }
    return cells[index]
  },
}

let captured = null
const domStub = {
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, setAttribute: () => {} }),
  head: { appendChild: () => {} },
  body: { appendChild: () => {} },
  documentElement: { style: {} },
}
const baseline = {
  type: 'baseline',
  value: {
    items: [{ workspaceId: 'w1', path: workspacePath, title: 'default-workspace', sessionIds: ['s1', 's2', 's3', 's4', 's5', 's6', 's7'] }],
    archivedSessionIds: [],
    pinnedSessionIds: [],
  },
}
/** 网关 SSE 的替身：先吐一帧 baseline，然后结束流。 */
const sseFetch = async () => {
  let sent = false
  return {
    ok: true,
    status: 200,
    body: {
      getReader: () => ({
        read: async () => {
          if (sent) return { done: true, value: undefined }
          sent = true
          return { done: false, value: new TextEncoder().encode(`data: ${JSON.stringify(baseline)}\n\n`) }
        },
      }),
    },
  }
}

const diagCalls = []
const sandbox = {
  window: { __ModuleLoader__: { load: (entry) => { captured = entry } }, addEventListener: () => {}, removeEventListener: () => {}, innerWidth: 1200, innerHeight: 800 },
  console,
  setTimeout,
  clearTimeout,
  Promise,
  URL,
  TextEncoder,
  TextDecoder,
  fetch: sseFetch,
  document: domStub,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  cancelAnimationFrame: (id) => clearTimeout(id),
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  require: (name) => (name === 'react' ? reactStub : undefined),
}
vm.createContext(sandbox)
vm.runInContext(code, sandbox, { filename: 'lib/client.js' })

const exportsObject = captured.factory((name) => {
  if (name === 'react') return reactStub
  throw new Error(`unexpected require: ${name}`)
})

let capturedMain = null
const peers = [{ id: 'peer-1', name: 'tudou-doubao', host: '192.168.130.24', port: 62907 }]
const ctx = {
  get: (name) => (name === 'connection'
    ? {
        rpc: {
          call: async (_scope, endpoint, payload) => {
            if (endpoint === 'peers/list') return { ok: true, value: { peers } }
            if (endpoint === 'status') return { ok: true, value: { active: 'lan', listening: true, host: '0.0.0.0', port: 35776, addresses: ['192.168.130.45'], token: 't'.repeat(43), allowedCidrs: [] } }
            if (endpoint === 'gateway/status') return { ok: true, value: { enabled: false, downloaded: true, phase: 'off' } }
            // api.call 返回 Host 的 value；client 侧再从 value.result 里解对端信封（envelopeOf）。
            if (endpoint === 'proxy' && payload?.method === 'session/list') return { ok: true, value: { result: { ok: true, value: sessionsPayload } } }
            if (endpoint === 'diag') { diagCalls.push(payload); return { ok: true, value: {} } }
            return { ok: true, value: {} }
          },
        },
      }
    : undefined),
  slots: {
    inject: (name, fn) => { fn(); return () => {} },
    register: (descriptor, renderFn) => {
      if (descriptor.name === 'main' && descriptor.key === exportsObject.PANEL_ID) capturedMain = renderFn
      return () => {}
    },
  },
  effect: () => () => {},
  on: () => () => {},
  logger: console,
}

exportsObject.apply(ctx)

async function settle(renderFn, passes = 16) {
  let tree = null
  for (let index = 0; index < passes; index += 1) {
    dirty = false
    cursor = 0
    pendingEffects = []
    tree = renderFn()
    for (const effect of pendingEffects) effect()
    await new Promise((resolve) => setTimeout(resolve, 0))
    if (!dirty) break
  }
  return tree
}

const rectOf = () => ({ left: 40, right: 66, top: 300, bottom: 324, width: 26, height: 24 })

await settle(() => (capturedMain === null ? null : capturedMain()))
if (capturedMain === null) throw new Error('没有捕获到 main 面板渲染函数')

let tree = await settle(capturedMain)
const enterButton = nodesWhere(tree, (node) => node.type === 'button' && textOf(node.props?.children).join('').trim() === '进入')[0]
if (enterButton === undefined) throw new Error('管理页没有找到「进入」按钮')
enterButton.props.onClick()
tree = await settle(capturedMain)

let texts = textOf(tree)
console.log('会话行被水位截断（只露 5 条）:', texts.filter((text) => /^会话\d+$/u.test(text)).length === 5)
console.log('溢出钮文案:', texts.find((text) => text.includes('展开其余')) ?? '缺失')

const overflow = nodesWhere(tree, (node) => node.type === 'button' && textOf(node.props?.children).join('').includes('展开其余'))[0]
if (overflow !== undefined) {
  overflow.props.onClick()
  tree = await settle(capturedMain)
  texts = textOf(tree)
  console.log('展开后七条全在:', texts.filter((text) => /^会话\d+$/u.test(text)).length === 7, '| 出现「收起」:', texts.includes('收起'))
}

const ellipsis = nodesWhere(tree, (node) => node.type === 'button' && textOf(node.props?.children).join('').trim() === '⋯')[0]
if (ellipsis === undefined) throw new Error('会话行没有「⋯」按钮')
ellipsis.props.onClick({ stopPropagation: () => {}, currentTarget: { getBoundingClientRect: rectOf } })
tree = await settle(capturedMain)
texts = textOf(tree)
console.log('菜单四项都在:', ['置顶会话', '重命名', '复制 Session ID', '归档会话'].every((label) => texts.includes(label)))
console.log('菜单开着时该行标记 data-rp-open:', nodesWhere(tree, (node) => node.props?.['data-rp-open'] === 'true').length === 1)

const renameItem = nodesWhere(tree, (node) => node.type === 'button' && textOf(node.props?.children).join('').includes('重命名')).pop()
renameItem?.props.onClick()
tree = await settle(capturedMain)
texts = textOf(tree)
console.log('重命名对话框:', texts.includes('重命名会话'), '| 字段名:', nodesWhere(tree, (node) => node.type === 'input' && node.props?.['aria-label'] === '会话名称').length === 1)
console.log('对话框输入框已预填标题:', nodesWhere(tree, (node) => node.type === 'input' && typeof node.props?.value === 'string' && node.props.value !== '').length === 1)
console.log('diag 上报调用数:', diagCalls.length)

process.exit(0)
