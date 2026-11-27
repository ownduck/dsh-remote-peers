// 读本机网关的 `session/follow` 流：打印首帧 snapshot 的记录规模与轮次，用于核对历史窗口。
// 用法：node probes/stream-summary.mjs <host:port> <token> <peerId> <sessionId>

const [host, token, peerId, sessionId] = process.argv.slice(2)
const payload = {
  args: {
    request: {
      address: { kind: 'session', sessionId },
      maxMessages: 500,
      turnWindow: { minMessages: 50, minTurns: 2 },
      assistantStream: true,
    },
  },
}
const url = `http://${host}/api/remote-peers/stream?id=${encodeURIComponent(peerId)}`
  + `&endpoint=${encodeURIComponent('session/follow')}`
  + `&payload=${encodeURIComponent(JSON.stringify(payload))}`

const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
console.log('status', response.status)
const reader = response.body.getReader()
const decoder = new TextDecoder()
let buffer = ''
const deadline = Date.now() + 15_000
while (Date.now() < deadline) {
  const { value, done } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n')
  for (const line of lines) {
    if (!line.startsWith('data:')) continue
    let frame
    try { frame = JSON.parse(line.slice(5).trim()) } catch { continue }
    if (frame.type !== 'snapshot') continue
    const events = (frame.records ?? []).map((record) => record.event).filter(Boolean)
    const turns = events.filter((event) => event.type === 'turn/start').map((event) => event.data.turn)
    const messages = events.filter((event) => event.type === 'agent/inbox/spliced' || event.type === 'assistant/message').length
    console.log(JSON.stringify({
      records: frame.records?.length, events: events.length, turns, messages,
      firstSeq: events[0]?.seq, lastSeq: events.at(-1)?.seq, hasMore: frame.hasMore,
    }, null, 2))
    await reader.cancel()
    process.exit(0)
  }
}
console.log('no snapshot frame received')
process.exit(1)
