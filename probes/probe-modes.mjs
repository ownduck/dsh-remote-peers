// 冒烟：连接方式单开关（局域网 / 跨域网关二选一）与「内核未下载」拦截。
// 用假 connection 满足 apply 依赖；状态目录隔离，跑完清掉。
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { apply } from '../index.mjs'

const stateDir = join('F:\\data\\var\\dsh\\remote-peers', 'modetest')
rmSync(stateDir, { recursive: true, force: true })
mkdirSync(stateDir, { recursive: true })

let handler
const ctx = {
  typertGateway: { wireStream: async function* () {} },
  logger: Object.assign(() => ({ info: () => {}, warn: () => {}, debug: () => {}, error: () => {} }), {}),
  get: () => undefined,
  connection: {
    createPeer: () => ({ dispose: async () => {} }),
    createSharedFetchHandler: () => async () => new Response('{"ok":true}', { headers: { 'content-type': 'application/json' } }),
    rpc: { handle: (scope, fn) => { handler = fn } },
  },
  effect: (fn) => fn(),
}

apply(ctx, { listenHost: '127.0.0.1', listenPort: 35779, stateDir, allowedCidrs: ['127.0.0.0/8'] })

const call = async (endpoint, payload = {}) => handler(endpoint, payload, undefined)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
await wait(400)

const initial = await call('status')
console.log('初始未启用任何一种方式:', initial.value.active === '', '| 未监听:', initial.value.listening === false)

const lanOn = await call('lan/enable')
console.log('启用局域网:', lanOn.value.active, '| 已监听:', lanOn.value.listening, '| 端口', lanOn.value.port)

// 没有内核时网关必须被拦住，而不是偷偷下 33MB 或直接起失败。
const joinBlocked = await call('gateway/join', { code: 'DSHG1-xx' })
console.log('未下载内核时加入被拦:', joinBlocked.ok === false, '|', joinBlocked.error?.message)

const lanOff = await call('lan/disable')
console.log('关闭局域网:', lanOff.value.active === '', '| 已停止监听:', lanOff.value.listening === false)

const saved = JSON.parse(readFileSync(join(stateDir, 'modes.json'), 'utf8'))
console.log('方式落盘:', JSON.stringify(saved))

rmSync(stateDir, { recursive: true, force: true })
process.exit(0)
