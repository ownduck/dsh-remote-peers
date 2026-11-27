// 验证「打开」缓存的版本探测与复用：连真实对端跑两遍，第二遍必须命中缓存、不再下载字节。
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const peer = { id: 'probe-peer', host: '192.168.130.24', port: 62907, token: 'DrNlAjQ6zZfop8kzlxdBtffsEbehN2kwADIp9M8ksI0' }
const source = 'C:/Users/Administrator/Documents/vertax-work/default-workspace/sample_files/13_资料包.zip'
const cacheRoot = join(process.env.TEMP ?? '.', 'rp-open-cache-probe')

const headers = { 'x-dsh-lan-token': peer.token }

async function remoteVersionOf(entry, path) {
  const url = new URL(`http://${entry.host}:${entry.port}/api/file`)
  url.searchParams.set('path', path)
  const response = await fetch(url, { headers, redirect: 'manual' })
  await response.body?.cancel().catch(() => {})
  const token = /[?&]v=([^&]+)/u.exec(response.headers.get('location') ?? '')
  if (token !== null) return { version: decodeURIComponent(token[1]), length: undefined }
  const length = Number(response.headers.get('content-length') ?? Number.NaN)
  const stamp = (response.headers.get('last-modified') ?? '').replace(/[^0-9A-Za-z]/gu, '')
  if (response.ok && stamp !== '') return { version: `m${stamp}-s${Number.isNaN(length) ? 0 : length}`, length }
  throw new Error(`无法判定对端版本（${response.status}）`)
}

function safeNameOf(path) {
  const base = path.split(/[\\/]/u).pop() ?? 'file'
  const clean = base.replace(/[\u0000-\u001f<>:"/\\|?*]/gu, '_').trim()
  return clean === '' ? 'file' : clean
}

async function materialize(entry, path) {
  const digest = createHash('sha1').update(path).digest('hex').slice(0, 12)
  const name = safeNameOf(path)
  let version = 'v-unknown'
  let versionToken
  try {
    const probed = await remoteVersionOf(entry, path)
    versionToken = probed.version
    version = `v-${createHash('sha1').update(probed.version).digest('hex').slice(0, 16)}`
  } catch { /* 退化 */ }
  const dir = join(cacheRoot, entry.id, digest, version)
  const local = join(dir, name)
  const metaPath = join(dir, 'meta.json')
  let meta
  try { meta = JSON.parse(readFileSync(metaPath, 'utf8')) } catch { meta = undefined }
  if (version !== 'v-unknown' && existsSync(local)) {
    const size = statSync(local).size
    if (meta?.size === undefined || size === meta.size) {
      writeFileSync(metaPath, `${JSON.stringify({ ...meta, hits: (meta?.hits ?? 0) + 1 })}`)
      return { local, hit: true, token: versionToken }
    }
  }
  const url = new URL(`http://${entry.host}:${entry.port}/api/file`)
  url.searchParams.set('path', path)
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`读取失败 ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${local}.part`, bytes)
  renameSync(`${local}.part`, local)
  writeFileSync(metaPath, JSON.stringify({ peerId: entry.id, peerPath: path, version, versionToken, size: bytes.byteLength, hits: 1 }, null, 2))
  return { local, hit: false, bytes: bytes.byteLength, token: versionToken }
}

const first = await materialize(peer, source)
console.info('run1', first)
const second = await materialize(peer, source)
console.info('run2', second)
console.info('expect run2.hit = true, run2.local =', second.local)
