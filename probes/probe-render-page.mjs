// 冒烟：用最小 React（useState/useEffect 带 dep 比较 + 重渲染循环）驱动插件 client，
// 走一遍「管理页 → 点进入 → 远程端主界面 → 搜索/视图选项 → 返回列表」。
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

const peers = [{ id: 'peer-1', name: 'tudou-doubao', host: '192.168.130.24', port: 62907 }]
const sessionsPayload = {
  items: [
    { sessionId: 's1', cwd: 'C:\\work\\vertax\\a', updatedAt: 100, projections: { values: { title: 'Chief' } } },
    { sessionId: 's2', cwd: 'C:\\work\\batch\\b', updatedAt: 200, projections: { values: { title: '豆包组图批次生成' } } },
    { sessionId: 's3', cwd: 'C:\\work\\vertax\\c', updatedAt: 300, projections: { values: { title: '安装 dsh 远程对等插件' } } },
  ],
}

// 迷你 React：按 hook 序号存状态，effect 用 deps 比较，setState 触发下一轮渲染。
let cells = []
let cursor = 0
let pendingEffects = []
let dirty = false

const sameDeps = (left, right) => Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => Object.is(item, right[index]))

const reactStub = {
  /** 类组件基类（错误边界用）：只保存 props，render 由子类实现。 */
  Component: class { constructor(props) { this.props = props } },
  createElement: (type, props, ...children) => {
    const merged = children.length === 0 ? props?.children : (children.length === 1 ? children[0] : children)
    const finalProps = { ...(props ?? {}), children: merged }
    if (typeof type === 'function') {
      // 类组件（错误边界）：按 React 的语义新建成实例再取 render 结果。
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
const sandbox = {
  window: { __ModuleLoader__: { load: (entry) => { captured = entry } }, addEventListener: () => {}, removeEventListener: () => {}, innerWidth: 1200, innerHeight: 800 },
  console,
  setTimeout,
  clearTimeout,
  Promise,
  URL,
  TextEncoder,
  TextDecoder,
  fetch: () => Promise.reject(new Error('no network in probe')),
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
let capturedPeerMain = null
const ctx = {
  get: (name) => (name === 'connection'
    ? {
        rpc: {
          call: async (_scope, endpoint, payload) => {
            if (endpoint === 'peers/list') return { ok: true, value: { peers } }
            if (endpoint === 'proxy' && payload?.method === 'session/list') return { ok: true, value: sessionsPayload }
            return { ok: true, value: {} }
          },
        },
      }
    : undefined),
  slots: {
    inject: (name, fn) => { fn(); return () => {} },
    register: (descriptor, renderFn) => {
      if (descriptor.name === 'main' && descriptor.key === exportsObject.PANEL_ID) capturedMain = renderFn
      if (descriptor.name === 'main' && typeof descriptor.key === 'string' && descriptor.key.startsWith(`${exportsObject.PANEL_ID}:`)) capturedPeerMain = renderFn
      return () => {}
    },
  },
  effect: () => () => {},
  on: () => () => {},
  logger: console,
}

exportsObject.apply(ctx)

/** 跑若干轮渲染直到稳定（effect 里 await 出来的 setState 也算）。 */
async function settle(renderFn, passes = 12) {
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

const findButton = (tree, label) => nodesWhere(tree, (node) => node.type === 'button' && textOf(node.props?.children).join('').trim() === label)[0]

await settle(() => (capturedMain === null ? null : capturedMain()))
if (capturedMain === null) throw new Error('没有捕获到 main 面板渲染函数')

let tree = await settle(capturedMain)
let texts = textOf(tree)
console.log('管理页含「进入」:', texts.includes('进入'), '| 底部残留会话工具条:', texts.includes('分组：工作区') || texts.includes('关闭'))
console.log('跨域网关块:', texts.includes('跨域网关'), '| 未启用态:', texts.includes('未启用'), '| 有加入入口:', texts.includes('加入'))

const enterButton = findButton(tree, '进入')
if (enterButton === undefined) throw new Error('管理页没有找到「进入」按钮')
enterButton.props.onClick()
tree = await settle(capturedMain)
texts = textOf(tree)
console.log('进入后仍是管理页:', texts.includes('本机网关'))
console.log('主界面含「返回远程端列表」:', texts.includes('返回远程端列表'))
console.log('主界面含「会话」标题:', texts.includes('会话'))

const peerTree = capturedPeerMain === null ? tree : await settle(capturedPeerMain)
console.log('focusPeer 主界面含「返回远程端列表」:', textOf(peerTree).includes('返回远程端列表'))

// 搜索：点开后就地出现输入框，且只有一个取消钮
const searchButton = nodesWhere(tree, (node) => node.type === 'button' && node.props?.['aria-label'] === '搜索')[0]
if (searchButton !== undefined) {
  // 先模拟 hover 出气泡，再点开输入框：气泡必须一起收掉
  searchButton.props.onMouseEnter?.({ currentTarget: { getBoundingClientRect: () => ({ left: 900, right: 928, bottom: 300 }) } })
  tree = await settle(capturedMain)
  const searchButtonNow = nodesWhere(tree, (node) => node.type === 'button' && node.props?.['aria-label'] === '搜索')[0]
  searchButtonNow.props.onClick()
  tree = await settle(capturedMain)
  const inputs = nodesWhere(tree, (node) => node.type === 'input')
  const clears = nodesWhere(tree, (node) => node.type === 'button' && node.props?.['aria-label'] === '取消搜索')
  const fieldWidth = nodesWhere(tree, (node) => typeof node.props?.style?.width === 'number' && node.props.style.width === 240)
  console.log('搜索框数量:', inputs.length, '| 取消钮数量:', clears.length, '| 240px 方框:', fieldWidth.length)
  const hintAfterOpen = nodesWhere(tree, (node) => typeof node.props?.style?.background === 'string' && node.props.style.background.includes('tooltip'))
  console.log('点开搜索后气泡已消失:', hintAfterOpen.length === 0)
  // 只按会话名称匹配（断言见 probe-search-title.mjs：搜 ch 只该出 Chief）
  inputs[0].props.onChange({ target: { value: 'ch' } })
  tree = await settle(capturedMain)
  const clearsAfter = nodesWhere(tree, (node) => node.type === 'button' && node.props?.['aria-label'] === '取消搜索')[0]
  clearsAfter?.props.onClick()
  tree = await settle(capturedMain)
  clears[0]?.props.onClick()
  tree = await settle(capturedMain)
  console.log('取消后搜索框消失:', nodesWhere(tree, (node) => node.type === 'input').length === 0)
} else {
  console.log('没有找到「搜索」按钮')
}

// tooltip：hover 图标钮出现原生深色气泡
const hoverTarget = nodesWhere(tree, (node) => node.type === 'button' && node.props?.['aria-label'] === '视图选项')[0]
if (hoverTarget !== undefined && typeof hoverTarget.props.onMouseEnter === 'function') {
  hoverTarget.props.onMouseEnter({ currentTarget: { getBoundingClientRect: () => ({ left: 900, right: 928, bottom: 300 }) } })
  const hoverTree = await settle(capturedMain)
  const hintBoxes = nodesWhere(hoverTree, (node) => typeof node.props?.style?.background === 'string' && node.props.style.background.includes('tooltip'))
  console.log('hover 后出现气泡节点:', hintBoxes.length, '| 文案含「视图选项」:', textOf(hoverTree).includes('视图选项'))
} else {
  console.log('没有挂上 tooltip 的 hover 处理')
}

// 视图选项浮层
const viewButton = nodesWhere(tree, (node) => node.type === 'button' && node.props?.['aria-label'] === '视图选项')[0]
if (viewButton !== undefined) {
  viewButton.props.onClick({ stopPropagation: () => {}, currentTarget: { getBoundingClientRect: () => ({ bottom: 100, right: 400 }) } })
  tree = await settle(capturedMain)
  const menuText = textOf(tree)
  console.log('浮层两段标题都在:', ['分组方式', '筛选会话'].every((label) => menuText.includes(label)), '| 已无排序段:', !menuText.includes('排序方式'))
  console.log('浮层六项都在:', ['按工作区', '按工作区树', '单列表', '隐藏已归档', '全部对话（显示已归档）', '仅显示已归档'].every((label) => menuText.includes(label)))
} else {
  console.log('没有找到「视图选项」按钮')
}

// 返回远程端列表
const backButton = findButton(tree, '返回远程端列表')
if (backButton !== undefined) {
  backButton.props.onClick()
  tree = await settle(capturedMain)
  console.log('返回后回到管理页:', textOf(tree).includes('本机网关'), '| 不再有返回按钮:', !textOf(tree).includes('返回远程端列表'))
} else {
  console.log('没有找到「返回远程端列表」按钮')
}

// 下载进度轮询是常驻的（真实环境也这么跑），探针断言跑完直接退出。
process.exit(0)
