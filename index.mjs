/** DeepSeek Harness 局域网互联 —— Host 面。 本插件在自己的监听器上暴露一个「带共享密钥的 HTTP 网关」，收到的请求以本机 操作者 Peer 的身份进入 DSH 自己的 `/api` 通道（`ctx.connection.createSharedFetchHandler`）， 因此对端看... */

import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { appendFileSync, createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { networkInterfaces } from 'node:os'
import { basename, join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { pathToFileURL } from 'node:url'

/** 插件在 loader 里的名字，同时也是 cordis.patch.yml 里 insert 的 id 来源。 */
export const name = 'remote-peers'

/** 宿主服务依赖：connection 提供 `/api` 通道、Peer 与 Fetch 路由；typertGateway 提供流式carrier。 */
export const inject = ['connection', 'typertGateway']

const DEFAULTS = Object.freeze({
  listenHost: '0.0.0.0',
  listenPort: 0,
  allowedCidrs: ['127.0.0.0/8', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '::1/128'],
})

/** 单请求体上限，与 DSH 自己的 HTTP 载体一致（聚合图片 200 MiB 的 base64 余量）。 */
const MAX_REQUEST_BODY_BYTES = 300 * 1024 * 1024

/** 空的 Client→Host 上行：普通 Remote 流不读它，只有 Gateway 自有端点才会消费。 */
const EMPTY_UPLINK = Object.freeze({
  async *[Symbol.asyncIterator]() {
    // 永不产出：本网关只承载服务端向客户端推送的流。
  },
})

/** 密钥请求头；`Authorization: Bearer` 也接受。 */
const TOKEN_HEADER = 'x-dsh-lan-token'

/**
 * 挂载局域网网关。
 * @param ctx - 插件 Context，需已注入 connection。
 * @param config - loader 传入的配置（listenHost / listenPort / stateDir / allowedCidrs）。
 */
export function apply(ctx, config = {}) {
  const logger = ctx.logger('remote-peers')
  const settings = resolveSettings(config)
  /** 挂载埋点：定位 apply 中途抛错的位置。 */
  const mark = (text) => {
    try {
      mkdirSync(settings.stateDir, { recursive: true })
      writeFileSync(join(settings.stateDir, 'apply.log'), `${new Date().toISOString()} ${text}\n`, { flag: 'a' })
    } catch {
      // 埋点失败不影响插件工作。
    }
  }
  mark(`apply start typertGateway=${ctx.get('typertGateway') !== undefined} connection=${ctx.get('connection') !== undefined}`)
  const state = loadState(settings.stateDir)
  const connection = ctx.connection
  /** 当前共享密钥；重置时轮换，已连接的对端须重新填写。 */
  let currentToken = state.token

  if (connection === undefined) {
    logger.error('remote-peers: 缺少 connection 服务，网关未启动')
    return
  }

  /** 以本机操作者身份派发：对端是本用户的另一台设备，权限与桌面本机相同。 */
  const peer = connection.createPeer({ principal: { kind: 'owner' }, interactions: 'answer' })
  mark('peer created')
  const api = connection.createSharedFetchHandler('/api')
  mark('shared fetch handler ready')
  /** 流式 carrier：把 Remote 流式端点（如 session/observeEvent）直接变成 SSE 下行。 */
  const wireStream = ctx.typertGateway.wireStream
  mark('wireStream ready')

  const server = createServer((req, res) => {
    handle(req, res).catch((error) => {
      logger.warn('remote-peers: 请求处理失败 %s', String(error))
      if (!res.headersSent) res.writeHead(500, { connection: 'close' })
      if (!res.destroyed) res.end()
    })
  })

  server.on('clientError', (error, socket) => {
    logger.debug('remote-peers: clientError %s', String(error))
    if (!socket.destroyed) socket.destroy()
  })

  server.on('error', (error) => {
    mark(`listen error ${String(error)}`)
    if (attemptedPort !== 0 && error?.code === 'EADDRINUSE') {
      logger.warn('remote-peers: 端口 %d 被占用，改用系统分配', attemptedPort)
      listen(0)
      return
    }
    logger.error('remote-peers: 监听失败 %s', String(error))
  })

  mark('before listen')
  // 端口优先沿用上次的：重载后对端填的地址仍然有效；被占用则退回系统分配。
  const preferredPort = settings.listenPort !== 0 ? settings.listenPort : state.port
  let attemptedPort = preferredPort
  const listen = (port) => {
    attemptedPort = port
    server.listen(port, settings.listenHost, () => {
      mark('listening callback')
      const bound = server.address()
      const actualPort = typeof bound === 'object' && bound !== null ? bound.port : port
      const snapshot = {
        instanceId: state.instanceId,
        host: settings.listenHost,
        port: actualPort,
        addresses: lanAddresses(),
        tokenLength: currentToken.length,
        startedAt: new Date().toISOString(),
      }
      writeState(settings.stateDir, snapshot)
      logger.info('remote-peers: 网关已监听 %s:%d（密钥文件 %s）', settings.listenHost, actualPort, tokenPath(settings.stateDir))
      for (const item of snapshot.addresses) logger.info('remote-peers: 局域网地址 %s', item)
      if (settings.allowedCidrs.length === 0) logger.warn('remote-peers: allowedCidrs 为空，只接受 127.0.0.1')
    })
  }
  try {
    listen(preferredPort)
  } catch (error) {
    mark(`listen throw ${error?.stack ?? error}`)
  }

  try {
    ctx.effect(() => () => {
      logger.info('remote-peers: 关闭网关')
      server.close()
      void peer.dispose()
    }, 'remote-peers: gateway listener')
  } catch (error) {
    mark(`effect throw ${error?.stack ?? error}`)
  }

  // ── 浏览器面通道：/remote-peers ─────────────────────────────────────────
  // 本机 GUI 通过它读写网关状态与「他端」清单，并经由本机中转访问对端，
  // 因此浏览器始终只与本机通信：不需要 CORS，也不需要在对端暴露密钥。
  const peersFile = join(settings.stateDir, 'peers.json')
  let peers = readPeers(peersFile)

  /** TEMP-DIAG：Host 侧也往 stateDir/diag.log 写一行（渲染器与 Host 的日志落到同一处好对照）。 */
  const hostDiag = (text) => {
    try {
      mkdirSync(settings.stateDir, { recursive: true })
      appendFileSync(join(settings.stateDir, 'diag.log'), `${new Date().toISOString()} ${text}\n`)
    } catch {
      // 诊断写盘失败不该影响主流程。
    }
  }

  const handleRemotePeers = async (endpoint, payload, signal) => {
    try {
      switch (endpoint) {
        case 'status':
          return ok(statusOf())
        case 'token/reset':
          return ok(rotateToken())
        case 'peers/list':
          return ok({ peers })
        case 'peers/upsert': {
          const entry = normalizePeer(payload)
          if (entry === undefined) return fail('remote-peers/bad-peer', '需要 host、port、token，port 1–65535，token ≥16 字符')
          const existing = peerById(entry.id)
          peers = existing === undefined
            ? [...peers, entry]
            : peers.map((item) => (item.id === entry.id ? entry : item))
          writePeers(peersFile, peers)
          return ok({ peers, saved: entry.id })
        }
        case 'peers/remove': {
          const id = typeof payload?.id === 'string' ? payload.id : undefined
          if (id === undefined) return fail('remote-peers/bad-request', '需要 id')
          peers = peers.filter((item) => item.id !== id)
          writePeers(peersFile, peers)
          return ok({ peers })
        }
        case 'peers/ping':
          return ok(await pingPeer(payload?.id, signal))
        case 'proxy':
          return ok({ result: await forward(payload, signal) })
        case 'file/size': {
          const id = typeof payload?.id === 'string' ? payload.id : ''
          const peerEntry = peerById(id)
          if (peerEntry === undefined) return fail('remote-peers/unknown-peer', `未知节点 ${JSON.stringify(id)}`)
          const source = typeof payload?.path === 'string' ? payload.path : ''
          if (!isAbsoluteFsPath(source)) return fail('remote-peers/bad-path', '需要绝对文件路径')
          const sessionId = typeof payload?.sessionId === 'string' ? payload.sessionId : ''
          const size = await remoteSizeOf(peerEntry, source, sessionId, signal)
          // TEMP-DIAG：Host 侧也留一行，确认跑的到底是哪条取大小路径（stat / 响应头 / 拿不到）。
          hostDiag(`size host ${source} session=${sessionId === '' ? '-' : sessionId} -> ${String(size ?? 'unknown')}`)
          if (size === undefined) return fail('remote-peers/size-unknown', '对端没有给出文件大小')
          return ok({ size })
        }
        case 'file/sizes': {
          // 批量版：一次 RPC 带多条路径，Host 内小并发向阳端 stat；逐项失败只让该项为 null，
          // 不让一个坏路径拖垮整批（前端把 null 记成 error 占位，不再重问）。
          const id = typeof payload?.id === 'string' ? payload.id : ''
          const peerEntry = peerById(id)
          if (peerEntry === undefined) return fail('remote-peers/unknown-peer', `未知节点 ${JSON.stringify(id)}`)
          const sessionId = typeof payload?.sessionId === 'string' ? payload.sessionId : ''
          const wanted = Array.isArray(payload?.paths) ? payload.paths : []
          const paths = wanted
            .filter((item) => typeof item === 'string' && item !== '' && !item.includes('\0') && isAbsoluteFsPath(item))
            .slice(0, 200)
          if (paths.length === 0) return ok({ sizes: {}, locals: {} })
          const sizes = {}
          const locals = {}
          await runPool(paths, 4, async (source) => {
            // 「本机是否已有副本」是纯本地 stat，顺路带回给前端，卡片据此显示「已下载」。
            locals[source] = hasLocalCopy(localCopyPathOf(peerEntry.id, source))
            try {
              const size = await remoteSizeOf(peerEntry, source, sessionId, signal)
              sizes[source] = typeof size === 'number' && size > 0 ? size : null
            } catch (error) {
              logger.warn('remote-peers: 批量取大小失败 %s: %s', source, String(error))
              sizes[source] = null
            }
          })
          hostDiag(`size batch ${paths.length} -> ${paths.filter((item) => typeof sizes[item] === 'number').length} hit, ${paths.filter((item) => locals[item] === true).length} local`)
          return ok({ sizes, locals })
        }
        case 'open-local':
          return ok(await openLocal(payload, signal))
        case 'local/copy': {
          // 「显示文件位置」用的探针：只回答本机有没有这份副本，绝不顺手去下载。
          const id = typeof payload?.id === 'string' ? payload.id : ''
          const peerEntry = peerById(id)
          if (peerEntry === undefined) return fail('remote-peers/unknown-peer', `未知节点 ${JSON.stringify(id)}`)
          const source = typeof payload?.path === 'string' ? payload.path : ''
          if (source === '' || source.includes('\0') || !isAbsoluteFsPath(source)) {
            return fail('remote-peers/bad-path', '需要绝对文件路径')
          }
          const local = localCopyPathOf(peerEntry.id, source)
          return ok({ exists: hasLocalCopy(local), path: local })
        }
        case 'download/status': {
          // 在跑的传输清单：新页面/重开面板据此把进度长回来（Host 才是进度的权威来源）。
          return ok({
            transfers: [...liveTransfers.values()].map((entry) => ({
              key: entry.key,
              peerId: entry.peerId,
              path: entry.path,
              name: entry.name,
              localPath: entry.localPath,
              phase: entry.phase,
              failure: entry.failure,
              loaded: entry.loaded,
              total: entry.total,
              startedAt: entry.startedAt,
            })),
          })
        }
        case 'download/save': {
          // 不再弹「另存为」：直接落到本机副本目录。已有副本就当场返回 `reused`，一次字节都不取。
          const id = typeof payload?.id === 'string' ? payload.id : ''
          const peerEntry = peerById(id)
          if (peerEntry === undefined) return fail('remote-peers/unknown-peer', `未知节点 ${JSON.stringify(id)}`)
          const source = typeof payload?.path === 'string' ? payload.path : ''
          if (source === '' || source.includes('\0') || !isAbsoluteFsPath(source)) {
            return fail('remote-peers/bad-path', '需要绝对文件路径')
          }
          const sessionId = typeof payload?.sessionId === 'string' ? payload.sessionId : ''
          const started = startCopy(peerEntry, source, sessionId, '下载')
          return ok({
            key: started.key,
            total: started.entry?.total ?? 0,
            phase: started.reused ? 'done' : 'downloading',
            localPath: started.local,
            reused: started.reused,
          })
        }
        case 'download/cancel': {
          const key = typeof payload?.key === 'string' ? payload.key : ''
          const entry = liveTransfers.get(key)
          if (entry === undefined) return fail('remote-peers/unknown-transfer', '没有这个下载任务')
          entry.abort?.()
          liveTransfers.delete(key)
          return ok({ cancelled: key })
        }
        case 'diag': {
          // TEMP-DIAG：把渲染器一侧探测到的结果落到 stateDir/diag.log（渲染器 console 无处可看）。
          const line = `${new Date().toISOString()} ${JSON.stringify(payload)}\n`
          mkdirSync(settings.stateDir, { recursive: true })
          appendFileSync(join(settings.stateDir, 'diag.log'), line)
          return ok({})
        }
        default:
          return fail('remote-peers/unknown-endpoint', `未知端点 ${JSON.stringify(endpoint)}`)
      }
    } catch (error) {
      logger.warn('remote-peers: /remote-peers %s 失败 %s', endpoint, String(error))
      return fail('remote-peers/internal', String(error instanceof Error ? error.message : error))
    }
  }

  // 热重载时上一个实例可能还占着通道，注册会在同一毫秒失败；退避重试而不是让 apply 半途死掉。
  const registerChannel = (attempt = 0) => {
    try {
      connection.rpc.handle('/remote-peers', handleRemotePeers)
      mark(`rpc channel ready (attempt ${attempt})`)
    } catch (error) {
      if (attempt < 12) {
        mark(`rpc retry ${attempt}: ${String(error)}`)
        setTimeout(() => registerChannel(attempt + 1), 250)
        return
      }
      mark(`rpc throw ${error?.stack ?? error}`)
    }
  }
  registerChannel()

  function statusOf() {
    const address = server.address()
    return {
      instanceId: state.instanceId,
      host: settings.listenHost,
      port: typeof address === 'object' && address !== null ? address.port : settings.listenPort,
      addresses: lanAddresses(),
      allowedCidrs: settings.allowedCidrs,
      token: currentToken,
      peers: peers.length,
    }
  }

  /** 轮换密钥：写盘并让运行中的监听器立刻只用新密钥。 */
  function rotateToken() {
    currentToken = randomBytes(32).toString('base64url')
    writeFileSync(tokenPath(settings.stateDir), `${currentToken}\n`, { mode: 0o600 })
    logger.warn('remote-peers: 共享密钥已重置，已连接的对端需要重新填写')
    return statusOf()
  }

  async function pingPeer(id, signal) {
    const peerEntry = peerById(id)
    if (peerEntry === undefined) return { ok: false, reason: 'peer-not-found' }
    const url = `http://${peerEntry.host}:${peerEntry.port}/remote-peers/hello`
    try {
      const response = await fetch(url, {
        headers: peerHeaders(peerEntry),
        signal: AbortSignal.timeout(5000),
      })
      if (response.status === 401) return { ok: false, reason: 'token-rejected' }
      if (!response.ok) return { ok: false, reason: `status-${response.status}` }
      const body = await response.json()
      return { ok: true, instanceId: body.instanceId, port: body.port, version: body.version }
    } catch (error) {
      return { ok: false, reason: String(error instanceof Error ? error.message : error) }
    }
  }

  /** 把一次端点调用转发到对端网关，返回对端原始的 server-response.result。 */
  async function forward(payload, signal) {
    const id = typeof payload?.id === 'string' ? payload.id : undefined
    const method = typeof payload?.method === 'string' ? payload.method : undefined
    if (id === undefined || method === undefined) throw new Error('proxy 需要 id 与 method')
    const peerEntry = peerById(id)
    if (peerEntry === undefined) throw new Error(`未登记的对端 ${id}`)
    if (!/^[A-Za-z0-9_$.-]+\/[A-Za-z0-9_$.-]+$/.test(method)) throw new Error(`非法端点 ${method}`)

    const url = `http://${peerEntry.host}:${peerEntry.port}/api/${method}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', [TOKEN_HEADER]: peerEntry.token },
      body: JSON.stringify({
        type: 'client-request',
        rpcId: `lan-${randomUUID()}`,
        method,
        payload: payload?.payload ?? { args: {} },
      }),
      signal,
    })
    if (response.status === 401) throw new Error('对端拒绝了共享密钥')
    if (!response.ok) throw new Error(`对端返回 ${response.status}`)
    const envelope = await response.json()
    if (envelope?.type !== 'server-response') throw new Error('对端响应不是 server-response')
    return envelope.result
  }

  // 打开与下载共用同一份本机副本：对端文件只取一次，落在 `<stateDir>/files/<peerId>/<路径摘要>/<原名>`，
  // 之后「打开」「下载」都只认这份文件是否存在 —— 不再按版本号重复取字节。
  const copyRoot = join(settings.stateDir, 'files')

  /** 一个路径所在的目录（`reveal` 在非 Windows 平台需要目录本身）。 */
  function dirnameOf(path) {
    const index = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
    return index <= 0 ? path : path.slice(0, index)
  }

  /** 本机副本路径：同一对端路径恒定落在同一处（路径摘要做目录，原名做文件名）。 */
  function localCopyPathOf(peerId, source) {
    const digest = createHash('sha1').update(source).digest('hex').slice(0, 12)
    return join(copyRoot, peerId, digest, safeNameOf(source))
  }

  /** 正式文件名出现即代表上次已写完（落盘用 `.part` + rename，不会留下半截正式文件）。 */
  function hasLocalCopy(local) {
    try {
      return existsSync(local) && statSync(local).size > 0
    } catch {
      return false
    }
  }

  /**
   * 保证本机有一份对端文件的完整副本；已有就直接复用，没有才分页取字节。
   * @param peerEntry - 目标他端
   * @param source - 对端绝对路径
   * @param sessionId - 文件作用域（`workspaceFiles/stat|readBytes` 需要）
   * @param signal - 取消信号
   * @param stats - 可选的任务对象，用来实时累加 `loaded/total`（下载进度）
   * @returns `{ path, reused }`
   */
  async function ensureLocalCopy(peerEntry, source, sessionId, signal, stats) {
    const local = localCopyPathOf(peerEntry.id, source)
    if (hasLocalCopy(local)) return { path: local, reused: true }
    const size = await remoteSizeOf(peerEntry, source, sessionId, signal)
    if (stats !== undefined) {
      stats.total = size ?? 0
      stats.localPath = local
    }
    const dir = dirnameOf(local)
    mkdirSync(dir, { recursive: true })
    // 浏览器式的「同位置临时占位文件」：写字节期间叫 `dsh-xxxxxxxx.crdownload`（纯 ASCII、无空格、
    // 无中文、固定小写扩展名），完成那一刻才 rename 成真正的原文件名 —— 改名前不碰任何可能
    // 在中文名/空格/大小写/特殊符号上出问题的路径。
    for (const name of safeReaddir(dir)) {
      if (!name.endsWith('.crdownload')) continue
      try { rmSync(join(dir, name), { force: true }) } catch { /* 上次崩溃留下的临时文件，删不掉就算了 */ }
    }
    const staging = join(dir, `dsh-${randomBytes(4).toString('hex')}.crdownload`)
    try {
      await writeRemoteToDisk(peerEntry, sessionId, source, size, staging, stats ?? { loaded: 0, total: 0 }, signal)
      // 完成才改成真名；目标若已存在（并发/旧副本）先删掉再改名，保证 rename 在同目录内原子。
      if (existsSync(local)) rmSync(local, { force: true })
      renameSync(staging, local)
    } catch (error) {
      try { rmSync(staging, { force: true }) } catch { /* 删不掉就留着，别盖住原始失败 */ }
      throw error
    }
    return { path: local, reused: false }
  }

  /** 读目录名；目录还没建 / 权限不足时返回空数组（调用方只拿它清临时文件）。 */
  function safeReaddir(dir) {
    try {
      return readdirSync(dir)
    } catch {
      return []
    }
  }

  /**
   * 固定并发跑一批异步任务：批量取大小时用它在 Host 内部并发向阳端 stat，
   * 既不像串行那样把 N 个 RTT 叠起来，也不会一次打出几百个请求。
   */
  async function runPool(items, limit, worker) {
    let cursor = 0
    const lanes = []
    const laneCount = Math.max(1, Math.min(limit, items.length))
    for (let lane = 0; lane < laneCount; lane += 1) {
      lanes.push((async () => {
        while (cursor < items.length) {
          const at = cursor
          cursor += 1
          await worker(items[at], at)
        }
      })())
    }
    await Promise.all(lanes)
  }

  /**
   * 对端文件字节数。首选 `workspaceFiles/stat`：`/api/file` 的读取上限取自贴图的单图字节上限，
   * 超过的多媒体/压缩包直接 413（连 `v` 与 `content-length` 都不给），而 stat 只读元信息，
   * 任何大小都拿得到。没有会话 id（拿不到文件作用域）时再退回读 `/api/file` 的响应头：
   * 有 `v` 取版本串第三段（`<inode>:<…>:<size>:…`），否则用 `content-length`。
   */
  async function remoteSizeOf(peerEntry, source, sessionId, signal) {
    if (typeof sessionId === 'string' && sessionId !== '') {
      const statUrl = upstreamUrl(peerEntry, '/api/workspaceFiles/stat')
      const stat = await fetch(statUrl, {
        method: 'POST',
        headers: { ...peerHeaders(peerEntry), 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'client-request',
          rpcId: `size-${Math.random().toString(36).slice(2)}`,
          method: 'workspaceFiles/stat',
          payload: { args: { workspaceFileScopeId: sessionId, path: source } },
        }),
        signal,
      })
      if (stat.ok) {
        const body = await stat.json().catch(() => undefined)
        const value = body?.result?.value
        if (body?.result?.ok === true && typeof value?.bytes === 'number' && value.bytes > 0) return value.bytes
      }
    }
    const upstream = upstreamUrl(peerEntry, '/api/file')
    upstream.searchParams.set('path', source)
    const response = await fetch(upstream, { headers: peerHeaders(peerEntry), redirect: 'manual', signal })
    await response.body?.cancel().catch(() => {})
    const token = /[?&]v=([^&]+)/u.exec(response.headers.get('location') ?? '')
    if (token !== null) {
      const fields = decodeURIComponent(token[1]).split(':')
      const size = Number(fields[2] ?? Number.NaN)
      if (Number.isFinite(size) && size > 0) return size
    }
    const length = Number(response.headers.get('content-length') ?? Number.NaN)
    return Number.isFinite(length) && length > 0 ? length : undefined
  }

  /** 原名做目录里的文件名：去掉 Windows 不允许的字符，保留中文。 */
  function safeNameOf(source) {
    const base = basenameOf(source) || 'file'
    const clean = base.replace(/[\u0000-\u001f<>:"/\\|?*]/gu, '_').trim()
    return clean === '' ? 'file' : clean
  }

  /**
   * Windows 资源管理器要的目标：文件 URI，逗号和等号转义，连续的非 ASCII 转义还原成原字符
   * （照主体 `explorerTarget`：Explorer 对字面路径里的空格/中文/`,` 容易断，URI 更稳）。
   */
  function explorerTargetOf(target) {
    return pathToFileURL(target, { windows: true }).href
      .replace(/(?:%[89A-F][0-9A-F])+/gi, (escaped) => decodeURIComponent(escaped))
      .replaceAll(',', '%2C')
      .replaceAll('=', '%3D')
  }

  /**
   * 交给本机系统：`open` 走文件关联，`reveal` 在资源管理器里定位并选中。
   * `reveal` 必须**显式可见**——`windowsHide` 用的 SW_HIDE 会把 Explorer 的文件夹窗口一起藏起来，
   * 表现就是「点了显示文件位置什么也没发生」（主体源码同样是 `visible`）。
   */
  function launchLocal(target, action) {
    const platform = process.platform
    let program
    let args
    let verbatim = false
    let hide = true
    if (platform === 'win32') {
      if (action === 'reveal') {
        program = 'explorer.exe'
        // `/select,` 与目标分成两个 argv：目标整体是 `file:///` URI，绕开空格与中文。
        args = ['/select,', explorerTargetOf(target)]
        hide = false
      } else {
        // `start` 会按文件关联打开；`""` 是窗口标题占位，缺了它含空格的路径会被当成标题。
        program = process.env.ComSpec ?? 'cmd.exe'
        args = ['/d', '/s', '/c', `start "" "${target}"`]
        verbatim = true
      }
    } else if (platform === 'darwin') {
      program = 'open'
      args = action === 'reveal' ? ['-R', target] : [target]
      hide = action !== 'reveal'
    } else {
      program = 'xdg-open'
      args = [action === 'reveal' ? dirnameOf(target) : target]
      hide = action !== 'reveal'
    }
    const child = spawn(program, args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: hide,
      windowsVerbatimArguments: verbatim,
    })
    child.on('error', (error) => logger.warn('remote-peers: 启动本机程序失败 %s', String(error)))
    // Explorer 把请求转交给已在运行的桌面进程后自身以 1 退出，那是成功而不是失败。
    child.on('exit', (code) => {
      if (hide || code === 0 || code === 1) return
      logger.warn('remote-peers: 定位文件失败，explorer 退出码 %s', String(code))
    })
    child.unref()
  }


  /**
   * 把对端的一个文件在本机打开（`zip`/`md`/目录皆同理）。
   * 复用「下载」那条链路：同一份本机副本，已有就直接开，没有则先取（取字节期间卡片会显示进度，可取消）。
   * @param payload - `{ id, path, action?, sessionId? }`；`action: 'reveal'` 只定位不打开
   * @param signal - 请求取消信号
   * @returns `{ path, action, reused?, pending? }`；`pending: true` 表示还在取字节，取完会自动打开
   */
  async function openLocal(payload, signal) {
    const startedAt = Date.now()
    const peerEntry = peerById(typeof payload?.id === 'string' ? payload.id : undefined)
    if (peerEntry === undefined) throw new Error('未找到该节点，请先在列表里登记')
    const source = typeof payload?.path === 'string' ? payload.path : ''
    if (source === '' || source.includes('\0') || !isAbsoluteFsPath(source)) throw new Error('需要绝对文件路径')
    const action = payload?.action === 'reveal' ? 'reveal' : 'open'
    const sessionId = typeof payload?.sessionId === 'string' ? payload.sessionId : ''
    if (action === 'reveal' && !hasLocalCopy(localCopyPathOf(peerEntry.id, source))) {
      // 定位只对「已经在本机」的副本有意义：没有副本就不该为了定位去下载一份。
      throw new Error('还没有下载这份文件')
    }
    const started = startCopy(peerEntry, source, sessionId, '打开')
    if (started.reused) {
      const before = Date.now()
      launchLocal(started.local, action)
      // 「正在打开…」由前端固定显示 2 秒，Host 只负责把窗口叫起来并立即回执。
      hostDiag(`${action} local ${started.local} (rpc ${Date.now() - startedAt}ms, spawn ${Date.now() - before}ms)`)
      return { path: started.local, action, reused: true }
    }
    // 首次没有副本：请求先返回（别让 RPC 等完 766 MB），字节取完再交给系统打开。
    void started.promise
      .then(() => {
        launchLocal(started.local, action)
        hostDiag(`${action} local after copy ${started.local}`)
      })
      .catch(() => { /* 失败已经进了任务表，前端会弹提示 */ })
    return { path: started.local, action, pending: true }
  }

  /** 流式下行：把 `endpoint`（带 payload）开成 Remote 流，按 SSE 逐帧推给对端。 */
  async function streamOut(req, res, url) {
    const endpoint = url.searchParams.get('endpoint') ?? ''
    // 既接受 `namespace/method`，也接受 Gateway 自有端点（`$events` 这类单段名字）。
    if (!/^(\$?[A-Za-z0-9_-]+|[A-Za-z0-9_-]+\/[A-Za-z0-9_$.-]+)$/.test(endpoint)) {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('invalid endpoint')
      req.destroy()
      return
    }
    let payload
    try {
      payload = JSON.parse(url.searchParams.get('payload') ?? '{"args":{}}')
    } catch {
      res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('invalid payload')
      req.destroy()
      return
    }

    const abort = new AbortController()
    res.on('close', () => {
      if (!res.writableEnded) abort.abort()
    })
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    })
    // 先发一个注释帧，让对端立刻知道通道已建立。
    res.write(': remote-peers stream open\n\n')

    try {
      const items = await wireStream.open(endpoint, payload, EMPTY_UPLINK, peer, abort.signal)
      for await (const item of items) {
        if (abort.signal.aborted) break
        res.write(`data: ${JSON.stringify(item)}\n\n`)
      }
      if (!abort.signal.aborted) {
        res.write('event: end\ndata: {}\n\n')
      }
    } catch (error) {
      const failure = wireStream.failure(error)
      if (!abort.signal.aborted) {
        res.write(`event: error\ndata: ${JSON.stringify({ code: failure.code, message: failure.message })}\n\n`)
      }
    } finally {
      res.end()
    }
  }

  // 浏览器面：`/api/remote-peers/stream` 把本机面板的 EventSource 转发到对端的同名通道。
  // 浏览器始终只与本机通信，令牌留在 Host 侧。
  /**
   * 一次性调用转发（非流式）：给大页返回留一条不经浏览器 RPC 通道的出口，
   * 避免历史分页被通道体积上限截断。`payload` 与 RPC 的 `proxy` 同形。
   */
  const callRoute = {
    path: '/api/remote-peers/call',
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const url = new URL(request.url)
      const payload = url.searchParams.get('payload')
      if (payload === null) return new Response('missing payload', { status: 400 })
      let parsed
      try {
        parsed = JSON.parse(payload)
      } catch {
        return new Response('bad payload', { status: 400 })
      }
      const result = await forward(parsed, request.signal)
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      })
    },
  }
  const streamRoute = peerPassRoute('/api/remote-peers/stream', '/remote-peers/stream',
    (url) => {
      const endpoint = url.searchParams.get('endpoint')
      const payload = url.searchParams.get('payload')
      if (endpoint === null || payload === null) return 'missing endpoint or payload'
      return { endpoint, payload }
    },
    () => ({ 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform' }))
  // 会话导出：把对端的 `GET /api/session.export` 原样转成本机的一条下载路由，
  // 浏览器只与本机通信，对端令牌不出 Host。

/** 他端按 id 查找：清单是唯一的权威来源。 */
function peerById(id) {
  return peers.find((item) => item.id === id)
}

/**
 * 从 typert 的 multipart 回包里取出第一个二进制片段（`bytes-0` 就是 PDF 本身）。
 * @param buffer - 整包字节
 * @param boundary - `content-type` 里的 boundary（已去引号）
 * @returns 片段字节；找不到分隔记号时返回 `undefined`
 */
function extractMultipartPart(buffer, boundary) {
  const bytes = new Uint8Array(buffer)
  const text = Buffer.from(bytes).toString('latin1')
  const headEnd = text.indexOf('\r\n\r\n')
  if (headEnd === -1) return undefined
  const start = headEnd + 4
  const tail = `\r\n--${boundary}`
  const end = text.indexOf(tail, start)
  if (end === -1) return undefined
  return bytes.slice(start, end)
}

/** 他端同一 API 的绝对地址（`path` 以 `/api` 开头）。 */
function upstreamUrl(peerEntry, path) {
  return new URL(`http://${peerEntry.host}:${peerEntry.port}${path}`)
}

/** 转发用的请求头：令牌只留在 Host 进程内，不下发给浏览器。 */
function peerHeaders(peerEntry) {
  return { [TOKEN_HEADER]: peerEntry.token }
}

/**
 * 对端 `GET <upstreamPath>?…` 的直通路由：查 peer → 组查询串 → 带令牌转发 → 回写指定响应头。
 * `paramsOf(url)` 返回要转发的查询参数，或返回一段文案表示参数不合法（回 400）。
 * 404/400/502 的口径与原各条路由一致。
 * @param path - 本机暴露的路由路径
 * @param upstreamPath - 对端路径（`/api/…`）
 * @param paramsOf - `(url) => Record<string,string> | string`
 * @param headersOf - `(response, params) => Record<string,string>`，写回浏览器的响应头
 * @returns 路由定义
 */
function peerPassRoute(path, upstreamPath, paramsOf, headersOf) {
  return {
    path,
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const url = new URL(request.url)
      const peerEntry = peerById(url.searchParams.get('id'))
      if (peerEntry === undefined) return new Response('unknown peer', { status: 404 })
      const params = paramsOf(url)
      if (typeof params === 'string') return new Response(params, { status: 400 })
      const upstream = upstreamUrl(peerEntry, upstreamPath)
      for (const [name, value] of Object.entries(params)) upstream.searchParams.set(name, value)
      const response = await fetch(upstream, { headers: peerHeaders(peerEntry), signal: request.signal })
      if (!response.ok) return new Response(`upstream ${response.status}`, { status: 502 })
      return new Response(response.body, { status: 200, headers: headersOf(response, params) })
    },
  }
}

  const exportRoute = peerPassRoute('/api/remote-peers/export', '/api/session.export',
    (url) => {
      const sessionId = url.searchParams.get('sessionId')
      if (sessionId === null || sessionId === '') return 'missing sessionId'
      return { sessionId, includeDescendants: url.searchParams.get('includeDescendants') ?? 'true' }
    },
    (response, params) => ({
      'content-type': response.headers.get('content-type') ?? 'application/zip',
      'content-disposition': response.headers.get('content-disposition')
        ?? `attachment; filename="dsh-session-${params.sessionId}.zip"`,
      'cache-control': 'no-store',
    }))

  // 复制会话为 Markdown：把对端的 `GET /api/session.markdown` 转成本机一条路由，
  // 对端 Host 自己按会话日志生成 Markdown（原生同一实现），令牌不出 Host。
  const markdownRoute = peerPassRoute('/api/remote-peers/markdown', '/api/session.markdown',
    (url) => {
      const sessionId = url.searchParams.get('sessionId')
      if (sessionId === null || sessionId === '') return 'missing sessionId'
      return { sessionId }
    },
    (response) => ({
      'content-type': response.headers.get('content-type') ?? 'text/markdown; charset=utf-8',
      'cache-control': 'no-store',
    }))

  // 预览 / 下载：把对端的 `GET|HEAD /api/file?path=` 转成本机一条路由。
  // 对端在缺 `v` 时 302 到带版本号的 URL；这里把重定向改写成指回本路由（保留 id），
  // 版本号因此进入浏览器地址，带 `v` 的响应沿用对端的 immutable 缓存语义。
  const FILE_PASS_HEADERS = [
    'content-type', 'content-length', 'cache-control',
    'x-content-type-options', 'content-security-policy',
  ]
  const fileRoute = {
    path: '/api/remote-peers/file',
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const url = new URL(request.url)
      const peerEntry = peerById(url.searchParams.get('id'))
      if (peerEntry === undefined) return new Response('unknown peer', { status: 404 })
      const path = url.searchParams.get('path')
      if (path === null || path === '' || path.includes('\0') || !isAbsoluteFsPath(path)) {
        return new Response('absolute path required', { status: 400 })
      }
      const version = url.searchParams.get('v')
      const upstream = upstreamUrl(peerEntry, `/api/file`)
      upstream.searchParams.set('path', path)
      if (version !== null) upstream.searchParams.set('v', version)
      const response = await fetch(upstream, {
        method: request.method,
        headers: peerHeaders(peerEntry),
        redirect: 'manual',
        signal: request.signal,
      })
      if (response.status >= 300 && response.status < 400) {
        const params = new URLSearchParams()
        params.set('id', peerEntry.id)
        params.set('path', path)
        const nextVersion = /[?&]v=([^&]+)/u.exec(response.headers.get('location') ?? '')
        if (nextVersion !== null) params.set('v', decodeURIComponent(nextVersion[1]))
        // 刷新用的 nonce 必须跟着重定向走，否则最终 URL 与上一次完全相同，会被 immutable 缓存命中。
        const nonce = url.searchParams.get('_r')
        if (nonce !== null) params.set('_r', nonce)
        return new Response(null, {
          status: 302,
          headers: { location: `?${params.toString()}`, 'cache-control': 'private, no-store' },
        })
      }
      if (!response.ok) return new Response(`upstream ${response.status}`, { status: 502 })
      const headers = new Headers()
      for (const name of FILE_PASS_HEADERS) {
        const value = response.headers.get(name)
        if (value !== null) headers.set(name, value)
      }
      if (url.searchParams.get('download') === '1') {
        const name = basenameOf(path)
        headers.set('content-disposition',
          `attachment; filename="${name.replace(/"/gu, '')}"; filename*=UTF-8''${encodeURIComponent(name)}`)
        headers.set('cache-control', 'private, no-store')
      }
      const body = request.method === 'HEAD' ? null : response.body
      return new Response(body, { status: 200, headers })
    },
  }

  // 大文件下载：`/api/file` 的读取上限取自「单图字节上限」，超大交付件直接 413，
  // 所以这里改走对端的 `workspaceFiles/readBytes` 分页（对端上限 2 MiB 一页），
  // 本机把各页拼成一条 `content-length` 已知的流：浏览器因此能显示原生进度，
  // 也不再受 `/api/file` 的字节上限约束。对端拿不到总长时退回 `/api/file` 一条流。
  const DOWNLOAD_CHUNK = 2 * 1024 * 1024
  /**
   * 落盘的下载任务：`<peerId>|<对端绝对路径>` → `{ phase, loaded, total, localPath, … }`。
   * 字节由 Host 自己写盘（渲染器只发一次 `download/save`），所以页面/插件重载后
   * 前端凭 `download/status` 就能把进度「长回来」，取消也由 Host 的 abort 直接生效。
   */
  const liveTransfers = new Map()
  const abortedError = () => Object.assign(new Error('已取消'), { name: 'AbortError' })
  const isAbortError = (error) => error?.name === 'AbortError'
  const dropTransfer = (key) => { liveTransfers.delete(key) }

  /** 把对端文件按 2 MiB 一页拉下来、直接写进本机目标文件（不经渲染器内存）。 */
  async function writeRemoteToDisk(peerEntry, sessionId, source, size, target, entry, signal) {
    const out = createWriteStream(target)
    // 写盘流的 error 必须在下一个 tick 之前就有人接：否则 Node 会把它当未捕获异常，
    // 直接把整个主进程带走（曾因中文用户名路径 ENOENT 崩掉一次）。
    const failed = new Promise((_, reject) => {
      out.once('error', reject)
    })
    failed.catch(() => {})
    const waitForFlush = (event) => Promise.race([once(out, event), failed])
    try {
      if (!(size > 0)) {
        // 拿不到总长（对端没给 stat）：退回 `/api/file` 一条流，照样由 Host 写盘。
        const upstream = upstreamUrl(peerEntry, '/api/file')
        upstream.searchParams.set('path', source)
        upstream.searchParams.set('download', '1')
        const response = await fetch(upstream, { headers: peerHeaders(peerEntry), signal })
        if (!response.ok) throw new Error(`对端返回 HTTP ${response.status}`)
        let written = 0
        await pipeline(Readable.fromWeb(response.body), async function* (chunks) {
          for await (const chunk of chunks) {
            written += chunk.byteLength
            entry.loaded = written
            entry.total = written
            yield chunk
          }
        }, out)
        return
      }
      let offset = 0
      let chunkSize = DOWNLOAD_CHUNK
      while (offset < size) {
        if (signal.aborted) throw abortedError()
        const want = Math.min(chunkSize, size - offset)
        let part = await remoteBytesOf(peerEntry, sessionId, source, offset, want, signal)
        if (part === undefined && want > 512 * 1024) {
          chunkSize = 512 * 1024
          part = await remoteBytesOf(peerEntry, sessionId, source, offset, Math.min(chunkSize, size - offset), signal)
        }
        if (part === undefined || part.byteLength === 0) throw new Error('对端没有返回字节')
        if (!out.write(Buffer.from(part))) await waitForFlush('drain')
        offset += part.byteLength
        entry.loaded = offset
      }
      out.end()
      await waitForFlush('finish')
    } catch (error) {
      out.destroy()
      throw error
    }
  }

  /** 同一份副本正在取字节时的飞行记录：`<peerId>|<路径>` → Promise，避免「打开」和「下载」各取一遍。 */
  const copyFlights = new Map()

  /**
   * 起一条「本机副本」任务：已有副本直接复用；正在取就并到同一条；都没有才开始取。
   * 「打开」与「下载」共用这一个入口，所以同一文件永远只有一份、也只会取一次。
   * @returns `{ key, local, reused, entry?, promise }`
   */
  function startCopy(peerEntry, source, sessionId, action = '下载') {
    const key = `${peerEntry.id}|${source}`
    const local = localCopyPathOf(peerEntry.id, source)
    if (hasLocalCopy(local)) return { key, local, reused: true, promise: Promise.resolve(local) }
    const running = copyFlights.get(key)
    if (running !== undefined) return { key, local, reused: false, entry: liveTransfers.get(key), promise: running }
    const controller = new AbortController()
    const entry = {
      key,
      peerId: peerEntry.id,
      path: source,
      name: basename(source),
      loaded: 0,
      total: 0,
      startedAt: Date.now(),
      phase: 'downloading',
      localPath: local,
      abort: () => controller.abort(),
    }
    liveTransfers.set(key, entry)
    const promise = ensureLocalCopy(peerEntry, source, sessionId, controller.signal, entry)
      .then((result) => {
        hostDiag(`${action} done ${result.path} ${String(entry.loaded)}`)
        dropTransfer(key)
        copyFlights.delete(key)
        return result.path
      })
      .catch((error) => {
        copyFlights.delete(key)
        dropTransfer(key)
        if (isAbortError(error)) {
          hostDiag(`${action} cancelled ${source}`)
        } else {
          hostDiag(`${action} failed ${source}: ${String(error?.message ?? error)}`)
          // 失败那条留 6 秒给前端弹提示，然后自行退场。
          entry.phase = 'failed'
          entry.failure = String(error?.message ?? error)
          entry.loaded = 0
          liveTransfers.set(key, entry)
          setTimeout(() => { if (entry.phase === 'failed') dropTransfer(key) }, 6000)
        }
        throw error
      })
    // 调用方可能只在 later 挂 then（「打开」是后台等），这里先兜住未处理拒绝。
    promise.catch(() => {})
    copyFlights.set(key, promise)
    hostDiag(`${action} start ${source} -> ${local}`)
    return { key, local, reused: false, entry, promise }
  }

  const downloadRoute = {
    path: '/api/remote-peers/download',
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const url = new URL(request.url)
      const peerEntry = peerById(url.searchParams.get('id'))
      if (peerEntry === undefined) return new Response('unknown peer', { status: 404 })
      const sessionId = url.searchParams.get('sessionId') ?? ''
      const path = url.searchParams.get('path') ?? ''
      if (sessionId === '' || path === '' || path.includes('\0') || !isAbsoluteFsPath(path)) {
        return new Response('absolute path and sessionId required', { status: 400 })
      }
      const size = await remoteSizeOf(peerEntry, path, sessionId, request.signal)
      if (size === undefined) {
        const upstream = upstreamUrl(peerEntry, '/api/file')
        upstream.searchParams.set('path', path)
        upstream.searchParams.set('download', '1')
        const response = await fetch(upstream, { headers: peerHeaders(peerEntry), signal: request.signal })
        if (!response.ok) return new Response(`upstream ${response.status}`, { status: 502 })
        return new Response(response.body, {
          status: 200,
          headers: { 'content-type': 'application/octet-stream', 'cache-control': 'private, no-store' },
        })
      }
      const name = basenameOf(path)
      const headers = new Headers({
        'content-type': 'application/octet-stream',
        'cache-control': 'private, no-store',
        'content-disposition': `attachment; filename="${name.replace(/"/gu, '')}"; filename*=UTF-8''${encodeURIComponent(name)}`,
        'content-length': String(size),
      })
      if (request.method === 'HEAD') return new Response(null, { status: 200, headers })
      const transferKey = `${peerEntry.id}|${path}`
      const transfer = {
        key: transferKey,
        peerId: peerEntry.id,
        path,
        name,
        loaded: 0,
        total: size,
        startedAt: Date.now(),
        phase: 'downloading',
      }
      const transferAbort = new AbortController()
      transfer.abort = () => transferAbort.abort()
      const signal = AbortSignal.any([request.signal, transferAbort.signal])
      liveTransfers.set(transferKey, transfer)
      const finish = () => { liveTransfers.delete(transferKey) }
      let offset = 0
      let chunkSize = DOWNLOAD_CHUNK
      const body = new ReadableStream({
        async pull(controller) {
          try {
            if (offset >= size) { controller.close(); return }
            const want = Math.min(chunkSize, size - offset)
            let part = await remoteBytesOf(peerEntry, sessionId, path, offset, want, signal)
            // 对端的页上限可能比我们假设的小：把这一页降档再要一次，别整条下载失败。
            if (part === undefined && want > 512 * 1024) {
              chunkSize = 512 * 1024
              part = await remoteBytesOf(peerEntry, sessionId, path, offset, Math.min(chunkSize, size - offset), signal)
            }
            if (part === undefined || part.byteLength === 0) { controller.close(); finish(); return }
            controller.enqueue(new Uint8Array(part))
            offset += part.byteLength
            transfer.loaded = offset
            if (offset >= size) { controller.close(); finish() }
          } catch (error) {
            finish()
            controller.error(error)
          }
        },
        cancel() {
          finish()
          transferAbort.abort()
        },
      })
      return new Response(body, { status: 200, headers })
    },
  }

  /** 对端一页字节：`workspaceFiles/readBytes` 的 range 窗口，multipart 回包里取第一个二进制片段。 */
  async function remoteBytesOf(peerEntry, sessionId, source, offset, length, signal) {
    const upstream = upstreamUrl(peerEntry, '/api/workspaceFiles/readBytes')
    const response = await fetch(upstream, {
      method: 'POST',
      headers: { ...peerHeaders(peerEntry), 'content-type': 'application/json' },
      body: JSON.stringify({
        type: 'client-request',
        rpcId: `dl-${offset}-${Math.random().toString(36).slice(2)}`,
        method: 'workspaceFiles/readBytes',
        payload: { args: { workspaceFileScopeId: sessionId, path: source, options: { range: { offset, length } } } },
      }),
      signal,
    })
    if (!response.ok) throw new Error(`upstream ${response.status}`)
    const boundary = /boundary=([^;]+)/u.exec(response.headers.get('content-type') ?? '')
    if (boundary === null) return undefined
    const buffer = Buffer.from(await response.arrayBuffer())
    return extractMultipartPart(buffer, boundary[1].trim().replace(/^"|"$/gu, ''))
  }


  // 前端渲染库：插件自带 pdfjs（与主体同一版本 6.3.289）与 SheetJS（主体 Excel 预览同源方案），
  // 按名字按需回给渲染器。
  const VENDOR_ASSETS = Object.freeze({
    'pdf.worker.min.mjs': 'pdfjs/pdf.worker.min.mjs',
  })
  // pdf.js 的二进制资源（cMap / 标准字体 / wasm）按文件名取，路径前缀固定，只允许这三类目录。
  const VENDOR_DIRS = Object.freeze({
    'pdfjs/cmaps/': 'pdfjs/cmaps/',
    'pdfjs/standard_fonts/': 'pdfjs/standard_fonts/',
    'pdfjs/wasm/': 'pdfjs/wasm/',
  })
  const resolveVendorAsset = (name) => {
    if (Object.hasOwn(VENDOR_ASSETS, name)) return { relative: VENDOR_ASSETS[name], type: 'text/javascript' }
    for (const prefix of Object.keys(VENDOR_DIRS)) {
      if (!name.startsWith(prefix)) continue
      const base = name.slice(prefix.length)
      if (!/^[A-Za-z0-9_.-]+$/u.test(base)) return undefined
      return { relative: `${VENDOR_DIRS[prefix]}${base}`, type: base.endsWith('.wasm') ? 'application/wasm' : base.endsWith('.ttf') ? 'font/ttf' : 'application/octet-stream' }
    }
    return undefined
  }
  const vendorRoute = {
    path: '/api/remote-peers/asset',
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const name = new URL(request.url).searchParams.get('name') ?? ''
      const asset = resolveVendorAsset(name)
      if (asset === undefined) return new Response('unknown asset', { status: 404 })
      const file = join(vendorRoot, asset.relative)
      if (!existsSync(file)) return new Response('asset missing', { status: 404 })
      return new Response(readFileSync(file), {
        status: 200,
        // 渲染器会缓存模块（blob/URL 都可能命中），迭代期间一律不缓存，避免拿到旧版本。
        headers: { 'content-type': `${asset.type}; charset=utf-8`, 'cache-control': 'no-store' },
      })
    },
  }

  // TEMP-DIAG：渲染器没有控制台可看，用一条 GET 路由把排障信息追加到 stateDir/diag.log。
  const diagRoute = {
    path: '/api/remote-peers/diag',
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const note = new URL(request.url).searchParams.get('note') ?? ''
      mkdirSync(settings.stateDir, { recursive: true })
      appendFileSync(join(settings.stateDir, 'diag.log'), `${new Date().toISOString()} ${note}\n`)
      return new Response('ok', { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } })
    },
  }

  // Office 文档预览：对端 `officeKit/render` 把 doc/docx/xls/xlsx/ppt/pptx 转成 PDF 字节，
  // 这里是本机的一条只读路由，直接把这批 PDF 字节回给渲染器（iframe 用得上，JSON 也不经过）。
  const officeRoute = {
    path: '/api/remote-peers/office',
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const url = new URL(request.url)
      const peerEntry = peerById(url.searchParams.get('id'))
      if (peerEntry === undefined) return new Response('unknown peer', { status: 404 })
      const sessionId = url.searchParams.get('sessionId')
      const path = url.searchParams.get('path')
      if (sessionId === null || sessionId === '' || path === null || path === '') {
        return new Response('missing sessionId or path', { status: 400 })
      }
      const upstream = upstreamUrl(peerEntry, '/api/officeKit/render')
      const response = await fetch(upstream, {
        method: 'POST',
        headers: { ...peerHeaders(peerEntry), 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'client-request',
          rpcId: `office-${randomUUID()}`,
          method: 'officeKit/render',
          payload: { args: { workspaceFileScopeId: sessionId, path, priority: 'foreground' } },
        }),
        signal: request.signal,
      })
      if (response.status === 401) return new Response('对端拒绝了共享密钥', { status: 403 })
      if (!response.ok) return new Response(`upstream ${response.status}`, { status: 502 })
      const boundary = /\bboundary=([^;]+)/u.exec(response.headers.get('content-type') ?? '')
      if (boundary === null) {
        // 出错时对端回的是 JSON 信封，原样转发便于在面板里读出原因。
        return new Response(await response.arrayBuffer(), {
          status: 200,
          headers: { 'content-type': response.headers.get('content-type') ?? 'application/json; charset=utf-8', 'cache-control': 'no-store' },
        })
      }
      const bytes = await response.arrayBuffer()
      const pdf = extractMultipartPart(bytes, boundary[1].replace(/"/gu, ''))
      if (pdf === undefined) return new Response('office payload not found', { status: 502 })
      return new Response(request.method === 'HEAD' ? null : pdf, {
        status: 200,
        headers: { 'content-type': 'application/pdf', 'cache-control': 'no-store' },
      })
    },
  }

  // 文件动作：转发对端的 `POST /api/present.open`（在对端桌面上打开或定位文件）。
  const presentOpenRoute = {
    path: '/api/remote-peers/present-open',
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const url = new URL(request.url)
      const peerEntry = peerById(url.searchParams.get('id'))
      if (peerEntry === undefined) return new Response('unknown peer', { status: 404 })
      for (const name of ['sessionId', 'seq', 'index']) {
        if (url.searchParams.get(name) === null) return new Response(`missing ${name}`, { status: 400 })
      }
      const upstream = upstreamUrl(peerEntry, `/api/present.open`)
      for (const name of ['sessionId', 'seq', 'index', 'action']) {
        const value = url.searchParams.get(name)
        if (value !== null) upstream.searchParams.set(name, value)
      }
      const response = await fetch(upstream, {
        method: 'POST',
        headers: peerHeaders(peerEntry),
        signal: request.signal,
      })
      return new Response(response.body, {
        status: response.status,
        headers: {
          'content-type': response.headers.get('content-type') ?? 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      })
    },
  }

  // 附件上行：浏览器把 `File` 的字节直接投给本机网关，网关原样流给节点自己的
  // `/api/session/uploadFileBinary`（原生 Client 同一条路由），不经过 JSON-RPC 的 base64 展开。
  const uploadRoute = {
    path: '/api/remote-peers/upload',
    methods: ['POST'],
    requestBody: 'streaming',
    fetch: async (request) => {
      const url = new URL(request.url)
      const peerEntry = peerById(url.searchParams.get('id'))
      if (peerEntry === undefined) return new Response('unknown peer', { status: 404 })
      const sessionId = url.searchParams.get('sessionId')
      if (sessionId === null || sessionId === '') return new Response('missing sessionId', { status: 400 })
      const query = new URLSearchParams({ sessionId })
      // 带 `mediaType` 的按提示词图片存放；名字用于节点侧保留原始文件名。
      const name = url.searchParams.get('name')
      if (name !== null && name !== '') query.set('name', name)
      const mediaType = url.searchParams.get('mediaType')
      if (mediaType !== null && mediaType !== '') query.set('mediaType', mediaType)
      const response = await fetch(
        `http://${peerEntry.host}:${peerEntry.port}/api/session/uploadFileBinary?${query.toString()}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/octet-stream', [TOKEN_HEADER]: peerEntry.token },
          body: request.body,
          duplex: 'half',
          signal: request.signal,
        },
      )
      return new Response(response.body, {
        status: response.status,
        headers: {
          'content-type': response.headers.get('content-type') ?? 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      })
    },
  }

  // 本轮改动摘要/对比：把对端的 `GET /api/changes.summary|changes.diff` 转成本机一条路由。
  const changesRoute = {
    path: '/api/remote-peers/changes',
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const url = new URL(request.url)
      const peerEntry = peerById(url.searchParams.get('id'))
      if (peerEntry === undefined) return new Response('unknown peer', { status: 404 })
      const sessionId = url.searchParams.get('sessionId')
      const seq = url.searchParams.get('seq')
      if (sessionId === null || sessionId === '' || seq === null || !/^\d+$/u.test(seq)) {
        return new Response('missing sessionId or seq', { status: 400 })
      }
      const kind = url.searchParams.get('kind') === 'diff' ? 'diff' : 'summary'
      const upstream = upstreamUrl(peerEntry, `/api/changes.${kind}`)
      upstream.searchParams.set('sessionId', sessionId)
      upstream.searchParams.set('seq', seq)
      if (kind === 'diff') {
        const index = url.searchParams.get('index')
        if (index === null || !/^\d+$/u.test(index)) return new Response('missing index', { status: 400 })
        upstream.searchParams.set('index', index)
      }
      const response = await fetch(upstream, {
        headers: peerHeaders(peerEntry),
        signal: request.signal,
      })
      if (!response.ok) {
        return new Response(`upstream ${response.status}`, { status: response.status === 404 ? 404 : 502 })
      }
      return new Response(response.body, {
        status: 200,
        headers: {
          'content-type': response.headers.get('content-type') ?? 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      })
    },
  }

  // 与通道注册同理：重载瞬间旧实例可能还没释放这条精确路由。
  const fetchRoutes = [streamRoute, exportRoute, markdownRoute, fileRoute, downloadRoute, vendorRoute, diagRoute, officeRoute, presentOpenRoute, changesRoute, uploadRoute, callRoute]
  const registerFetchRoute = (attempt = 0) => {
    try {
      for (const route of fetchRoutes) connection.fetch.register(route)
      mark(`fetch route registered (attempt ${attempt})`)
    } catch (error) {
      if (attempt < 12) {
        mark(`fetch retry ${attempt}: ${String(error)}`)
        setTimeout(() => registerFetchRoute(attempt + 1), 250)
        return
      }
      mark(`fetch register failed: ${error?.stack ?? error}`)
    }
  }
  registerFetchRoute()

  /** 一次请求：准入 → 路由。 */
  async function handle(req, res) {
    const method = req.method ?? 'GET'
    const url = new URL(req.url ?? '/', 'http://lan-peer.internal')

    const remote = remoteAddressOf(req)
    if (!addressAllowed(remote, settings.allowedCidrs)) {
      res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('source address not allowed')
      req.destroy()
      return
    }
    if (!tokenMatches(req.headers, currentToken)) {
      res.writeHead(401, {
        'content-type': 'text/plain; charset=utf-8',
        'www-authenticate': 'Bearer realm="dsh-remote-peers"',
      })
      res.end('invalid or missing lan token')
      req.destroy()
      return
    }

    if (url.pathname === '/remote-peers/hello' && method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({
        type: 'remote-peers/hello',
        instanceId: state.instanceId,
        port: typeof server.address() === 'object' && server.address() !== null ? server.address().port : null,
        product: 'dsh-remote-peers',
        version: readOwnVersion(),
      }))
      return
    }

    if (url.pathname.startsWith('/api/')) {
      await bridge(req, res)
      return
    }

    if (url.pathname === '/remote-peers/stream' && method === 'GET') {
      await streamOut(req, res, url)
      return
    }

    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('not found')
    req.destroy()
  }

  /** node:http ↔ fetch 桥：与 DSH 自己的 HTTP 载体同一套写法（背压 + 断开中止）。 */
  async function bridge(req, res) {
    const abort = new AbortController()
    // 断线检测挂在 response 上：IncomingMessage 的 close 在请求体读完就触发。
    res.on('close', () => {
      if (!res.writableEnded) abort.abort()
    })

    const url = new URL(req.url ?? '/', 'http://lan-peer.internal')
    const method = req.method ?? 'GET'
    const headers = Object.fromEntries(
      Object.entries(req.headers).filter(([, value]) => typeof value === 'string'),
    )
    // 网关自己的密钥不进 DSH 的请求上下文。
    delete headers[TOKEN_HEADER]
    delete headers.authorization

    const bodyMode = api.requestBodyMode({ method, url })
    let request
    if (bodyMode === 'buffered') {
      const declaredLength = req.headers['content-length']
      if (declaredLength !== undefined && Number(declaredLength) > MAX_REQUEST_BODY_BYTES) {
        res.writeHead(413, { connection: 'close' })
        res.end()
        req.destroy()
        return
      }
      const chunks = []
      let received = 0
      for await (const chunk of req) {
        received += chunk.byteLength
        if (received > MAX_REQUEST_BODY_BYTES) {
          res.writeHead(413, { connection: 'close' })
          res.end()
          req.destroy()
          return
        }
        chunks.push(chunk)
      }
      request = new Request(url, {
        method,
        headers,
        ...(chunks.length > 0 ? { body: Buffer.concat(chunks) } : {}),
        signal: abort.signal,
      })
    } else {
      request = new Request(url, {
        method,
        headers,
        body: Readable.toWeb(req),
        signal: abort.signal,
        duplex: 'half',
      })
    }

    const response = await api.fetch(request, peer)
    const requestUnread = bodyMode === 'streaming' && !req.readableEnded
    const responseHeaders = Object.fromEntries(response.headers.entries())
    res.writeHead(response.status, requestUnread ? { ...responseHeaders, connection: 'close' } : responseHeaders)
    if (response.body === null) {
      res.end()
      if (requestUnread) req.destroy()
      return
    }
    for await (const chunk of response.body) {
      if (abort.signal.aborted) continue
      if (!res.write(chunk) && !res.destroyed) {
        await new Promise((resolve) => {
          const done = () => {
            res.off('drain', done)
            res.off('close', done)
            resolve()
          }
          res.once('drain', done)
          res.once('close', done)
        })
      }
    }
    res.end()
    if (requestUnread) req.destroy()
  }
}

/** 归一化配置；缺省值只在这里出现，调用方永远拿到完整的一份。 */
function resolveSettings(config) {
  const listenHost = typeof config.listenHost === 'string' && config.listenHost !== '' ? config.listenHost : DEFAULTS.listenHost
  const listenPort = Number.isInteger(config.listenPort) ? config.listenPort : DEFAULTS.listenPort
  const allowedCidrs = Array.isArray(config.allowedCidrs) ? config.allowedCidrs.map(String) : DEFAULTS.allowedCidrs
  const configuredDir = typeof config.stateDir === 'string' && config.stateDir !== '' ? config.stateDir : undefined
  return {
    listenHost,
    listenPort,
    allowedCidrs,
    stateDir: configuredDir ?? defaultStateDir(),
  }
}

/** 没有配置 stateDir 时退化到 DSH_HOME；两者都缺就报错，不静默写到别处。 */
function defaultStateDir() {
  const home = process.env.DSH_HOME
  if (home !== undefined && home !== '') return join(home, 'remote-peers')
  throw new Error('remote-peers: 需要配置 stateDir，或设置 DSH_HOME')
}

function tokenPath(stateDir) {
  return join(stateDir, 'token')
}

function statePath(stateDir) {
  return join(stateDir, 'state.json')
}

/** 读令牌：没有就生成一个 43 字符（32 字节 base64url），并落盘。 */
function ensureToken(stateDir) {
  const file = tokenPath(stateDir)
  if (existsSync(file)) {
    const existing = readFileSync(file, 'utf8').trim()
    if (existing.length >= 32) return existing
  }
  const token = randomBytes(32).toString('base64url')
  writeFileSync(file, `${token}\n`, { mode: 0o600 })
  return token
}

/** 读实例状态：instanceId 一旦生成就固定，对端用它做 peer 身份。 */
function loadState(stateDir) {
  mkdirSync(stateDir, { recursive: true })
  const file = statePath(stateDir)
  let instanceId = randomUUID()
  let port = 0
  if (existsSync(file)) {
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8'))
      if (typeof parsed?.instanceId === 'string' && parsed.instanceId !== '') instanceId = parsed.instanceId
      if (Number.isInteger(parsed?.port) && parsed.port > 0) port = parsed.port
    } catch {
      // 状态文件损坏不影响启动：instanceId 重新生成，端口与密钥照旧。
    }
  }
  return { instanceId, token: ensureToken(stateDir), port }
}

function writeState(stateDir, snapshot) {
  const file = statePath(stateDir)
  const previous = existsSync(file) ? safeParse(readFileSync(file, 'utf8')) : undefined
  writeFileSync(file, `${JSON.stringify({ ...previous, ...snapshot }, null, 2)}\n`)
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** `/api/file` 只接受绝对路径：Windows 盘符或 POSIX 根路径。 */
function isAbsoluteFsPath(path) {
  return /^[A-Za-z]:[\\/]/u.test(path) || path.startsWith('/')
}

/** 路径末段，用作下载文件名。 */
function basenameOf(path) {
  const at = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return at === -1 ? path : path.slice(at + 1)
}

/** 固定时间比较，避免按字节提前返回。 */
function tokenMatches(headers, token) {
  const supplied = headerToken(headers)
  if (supplied === undefined) return false
  const left = Buffer.from(supplied)
  const right = Buffer.from(token)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function headerToken(headers) {
  const direct = headers[TOKEN_HEADER]
  if (typeof direct === 'string' && direct !== '') return direct.trim()
  const authorization = headers.authorization
  if (typeof authorization === 'string') {
    const match = /^Bearer\s+(.+)$/i.exec(authorization.trim())
    if (match !== null) return match[1].trim()
  }
  return undefined
}

function remoteAddressOf(req) {
  const address = req.socket.remoteAddress
  return typeof address === 'string' ? address : undefined
}

/** 来源准入：命中任一 CIDR 即允许；白名单为空时只放行回环。 */
function addressAllowed(address, cidrs) {
  const candidates = cidrs.length > 0 ? cidrs : ['127.0.0.0/8', '::1/128']
  const normalized = normalizeAddress(address)
  if (normalized === undefined) return false
  if (isLoopback(normalized)) return true
  return candidates.some((cidr) => cidrContains(cidr, normalized))
}

function normalizeAddress(address) {
  if (typeof address !== 'string' || address === '') return undefined
  // IPv4-mapped IPv6（::ffff:192.168.1.20）按 IPv4 判。
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address)
  if (mapped !== null) return mapped[1]
  return address.toLowerCase()
}

function isLoopback(address) {
  return address === '::1' || address.startsWith('127.')
}

/** 支持 IPv4（a.b.c.d/prefix）与 IPv6 回环字面量。 */
function cidrContains(cidr, address) {
  const text = String(cidr).trim().toLowerCase()
  if (text === '::1/128' || text === '::1') return address === '::1'
  const parts = text.split('/')
  if (parts.length !== 2) return false
  const prefix = Number(parts[1])
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false
  const base = ipv4ToInt(parts[0])
  const target = ipv4ToInt(address)
  if (base === undefined || target === undefined || prefix === 0) return base !== undefined && target !== undefined
  const mask = prefix === 32 ? 0xffffffff : (~((1 << (32 - prefix)) - 1)) >>> 0
  return (base & mask) === (target & mask)
}

function ipv4ToInt(text) {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(text)
  if (match === null) return undefined
  const octets = match.slice(1).map(Number)
  if (octets.some((octet) => octet > 255)) return undefined
  const [a, b, c, d] = octets
  return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0
}

/** 本机所有非回环 IPv4，供 GUI 直接显示可填地址。 */
function lanAddresses() {
  const result = []
  for (const [nic, entries] of Object.entries(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.internal) continue
      if (entry.family !== 4 && entry.family !== 'IPv4') continue
      result.push(`${entry.address} (${nic})`)
    }
  }
  return result
}

function readOwnVersion() {
  try {
    const raw = readFileSync(new URL('./package.json', import.meta.url), 'utf8')
    const parsed = JSON.parse(raw)
    return typeof parsed?.version === 'string' ? parsed.version : undefined
  } catch {
    return undefined
  }
}

/** 成功结果，形状与 Connection 通道的 handler 结果一致。 */
function ok(value) {
  return { ok: true, value }
}

/** 失败结果；details 留空以匹配 envelope 校验。 */
function fail(code, message) {
  return { ok: false, error: { code, message, details: {} } }
}

/** 读「他端」清单；文件损坏按空清单处理，不让启动失败。 */
function readPeers(file) {
  if (!existsSync(file)) return []
  const parsed = safeParse(readFileSync(file, 'utf8'))
  const items = Array.isArray(parsed?.peers) ? parsed.peers : []
  return items.flatMap((item) => {
    const normalized = normalizePeer(item)
    return normalized === undefined ? [] : [normalized]
  })
}

function writePeers(file, peers) {
  writeFileSync(file, `${JSON.stringify({ peers }, null, 2)}\n`)
}

/** 校验并归一化一条他端记录：id 缺省即生成，name 缺省用 host:port。 */
function normalizePeer(payload) {
  if (payload === null || typeof payload !== 'object') return undefined
  const host = typeof payload.host === 'string' ? payload.host.trim() : ''
  if (host === '' || host.includes('/') || host.includes(':')) return undefined
  const port = Number(payload.port)
  if (!Number.isInteger(port) || port < 1 || port > 65535) return undefined
  const token = typeof payload.token === 'string' ? payload.token.trim() : ''
  if (token.length < 16) return undefined
  const name = typeof payload.name === 'string' && payload.name.trim() !== '' ? payload.name.trim() : `${host}:${port}`
  const id = typeof payload.id === 'string' && payload.id !== '' ? payload.id : randomUUID()
  return { id, name, host, port, token }
}
