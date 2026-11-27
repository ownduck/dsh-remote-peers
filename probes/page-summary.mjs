// 统计 `session/events` / `session/follow` 一页的规模：记录数、seq 范围、轮次、hasMore。
// 用法：node probes/page-summary.mjs <host:port> <token> <sessionId> [maxMessages] [beforeSeq]

const [host, token, sessionId, maxMessages = '500', beforeSeq] = process.argv.slice(2)
const body = {
  type: 'client-request',
  rpcId: 'page-summary',
  method: 'session/events',
  payload: {
    args: {
      request: {
        address: { kind: 'session', sessionId },
        maxMessages: Number(maxMessages),
        turnWindow: { minMessages: 50, minTurns: 2 },
        ...(beforeSeq === undefined ? {} : { beforeSeq: Number(beforeSeq) }),
      },
    },
  },
}

const response = await fetch(`http://${host}/api/session/events`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
  body: JSON.stringify(body),
})
const json = await response.json()
const value = json.result?.value
if (value === undefined) {
  console.log('error', JSON.stringify(json).slice(0, 400))
  process.exit(1)
}
const records = value.records ?? []
const first = records[0]?.event?.seq
const last = records.at(-1)?.event?.seq
const types = new Map()
const turns = []
for (const record of records) {
  const event = record.event
  types.set(event.type, (types.get(event.type) ?? 0) + 1)
  if (event.type === 'turn/start') turns.push(event.data.turn)
}
const messages = records.filter((record) => record.event.type === 'agent/inbox/spliced' || record.event.type === 'assistant/message').length
console.log(JSON.stringify({
  hasMore: value.hasMore, cursor: value.cursor, records: records.length,
  firstSeq: first, lastSeq: last, turns, messages,
  types: [...types.entries()].sort((left, right) => right[1] - left[1]).slice(0, 6),
}, null, 2))
