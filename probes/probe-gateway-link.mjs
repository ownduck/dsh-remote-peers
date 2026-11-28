// 冒烟：两台「本机实例」走跨域网关对接 —— A 建网出连接码，B 粘贴加入，
// 再由 B 经 127.0.0.1 转发口访问 A 的网关。验证 no-tun + port-forward 全链路。
import { rmSync } from 'node:fs'
import net from 'node:net'
import { join } from 'node:path'
import { apply } from '../index.mjs'

const root = 'F:\\data\\var\\dsh\\remote-peers\\gwlink'
rmSync(root, { recursive: true, force: true })

const instances = []
function boot(name, port) {
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
  apply(ctx, { listenHost: '127.0.0.1', listenPort: port, stateDir: join(root, name), allowedCidrs: ['127.0.0.0/8'] })
  const call = async (endpoint, payload = {}) => {
    const result = await handler(endpoint, payload, undefined)
    if (result?.ok !== true) throw new Error(`${name}/${endpoint}: ${result?.error?.message ?? '失败'}`)
    return result.value
  }
  const entry = { name, call }
  instances.push(entry)
  return entry
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const a = boot('a', 35777)
const b = boot('b', 35778)
await wait(600)

const aOn = await a.call('gateway/enable')
console.log('A 启用:', aOn.phase, '| 虚拟地址', aOn.vip, '| 网络', aOn.networkName)

const bJoin = await b.call('gateway/join', { code: aOn.code })
console.log('B 加入:', bJoin.phase, '| 虚拟地址', bJoin.vip, '| 与 A 不同址', bJoin.vip !== aOn.vip)

const bPeers = await b.call('peers/list')
const aPeer = bPeers.peers.find((peer) => peer.via === 'gateway')
console.log('B 的对端清单含网关节点:', aPeer !== undefined, '| 转发口', aPeer?.port, '| 展示地址', `${aPeer?.gateway?.vip}:${aPeer?.gateway?.port}`)

const probeFirst = await fetch(`http://127.0.0.1:35777/remote-peers/hello`, { headers: { 'x-dsh-lan-token': aPeer.token } })
console.log('直连 A 的网关:', probeFirst.status, (await probeFirst.text()).slice(0, 40))

const probe = await fetch(`http://127.0.0.1:${aPeer.port}/remote-peers/hello`, { headers: { 'x-dsh-lan-token': aPeer.token } }).catch((error) => ({ status: `ERR ${error?.cause?.code ?? error?.message}`, text: async () => '' }))
const body = await probe.json?.().catch(() => {}) ?? {}
console.log('经网关访问 A 的网关:', probe.status, '| 实例号一致', String(body.instanceId ?? '').slice(0, 8))

// 同一个转发口再用裸 socket 发一次 HTTP/1.0：把「网关本身」和「转发链路」分开看。
const raw = await new Promise((resolve) => {
  const socket = net.connect(aPeer.port, '127.0.0.1')
  let data = ''
  socket.setTimeout(6000)
  socket.on('connect', () => socket.write(`GET /remote-peers/hello HTTP/1.0\r\nx-dsh-lan-token: ${aPeer.token}\r\n\r\n`))
  socket.on('data', (chunk) => { data += String(chunk) })
  socket.on('timeout', () => { socket.destroy(); resolve(`TIMEOUT ${data.length}`) })
  socket.on('close', () => resolve(data.split('\r\n')[0]))
  socket.on('error', (error) => resolve(`ERR ${error.code}`))
})
console.log('裸 socket 经转发:', raw)

const bStatus = await b.call('gateway/status')
console.log('B 网关在线节点数:', bStatus.online.length, '| 转发表', JSON.stringify(bStatus.forwards))

await b.call('gateway/disable')
await a.call('gateway/disable')
console.log('两端已关闭')
process.exit(0)
