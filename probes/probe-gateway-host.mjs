// 冒烟：只跑 Host 面的跨域网关（下载内核 → 起 no-tun 内核 → 状态 → 关闭）。
// 用假 connection 满足 apply 的依赖，状态目录固定到 F:\data\var\dsh\remote-peers\gwtest。
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../index.mjs'

const stateDir = process.env.RP_GW_STATE ?? join(tmpdir(), 'rp-gateway-probe')
let handler

const ctx = {
  typertGateway: { wireStream: async function* () {} },
  logger: Object.assign((scope) => ({
    info: (...args) => console.log(`[${scope}]`, ...args),
    warn: (...args) => console.warn(`[${scope}]`, ...args),
    debug: () => {},
    error: (...args) => console.error(`[${scope}]`, ...args),
  }), {}),
  get: (name) => {
    if (name === 'typertGateway') return { wireStream: async function* () {} }
    return undefined
  },
  connection: {
    createPeer: () => ({ dispose: async () => {} }),
    createSharedFetchHandler: () => async () => new Response('{"ok":true}', { headers: { 'content-type': 'application/json' } }),
    rpc: { handle: (scope, fn) => { handler = fn } },
  },
  effect: (fn) => fn(),
}

apply(ctx, { listenHost: '127.0.0.1', listenPort: 35777, stateDir, allowedCidrs: ['127.0.0.0/8'] })

const call = async (endpoint, payload = {}) => {
  const result = await handler(endpoint, payload, undefined)
  if (result?.ok !== true) throw new Error(`${endpoint}: ${result?.error?.message ?? '失败'}`)
  return result.value
}

await new Promise((resolve) => setTimeout(resolve, 500))

console.log('启用前:', (await call('gateway/status')).phase)
const started = await call('gateway/enable')
console.log('启用后:', started.phase, '| 虚拟地址', started.vip, '| 内核', started.coreReady, '| 连接码前 12 位', started.code.slice(0, 12))
console.log('连接码长度:', started.code.length)
const again = await call('gateway/status')
console.log('再查状态:', again.phase, '| 在线节点', again.online.length)
console.log('关闭:', (await call('gateway/disable')).phase)
process.exit(0)
