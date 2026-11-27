/** 审批回传冒烟：订阅 $events，触发一次工具调用，观察 waterfall 帧并自动应答。 */
import { readFileSync } from 'node:fs'
import { readLocalToken } from './_state.mjs'

const token = readLocalToken()
const authority = process.argv[2] ?? '127.0.0.1:35776'
const sessionId = process.argv[3] ?? 'sdk-test-20261124-a'
const text = process.argv[4] ?? '请在当前目录运行 shell 命令 echo ok，然后把命令输出告诉我。'
const headers = { 'content-type': 'application/json', 'x-dsh-lan-token': token }
const started = Date.now()
const log = (...parts) => console.log(`+${Date.now() - started}ms`, ...parts)

const eventsUrl = `http://${authority}/remote-peers/stream?endpoint=${encodeURIComponent('$events')}&payload=${encodeURIComponent(JSON.stringify({ args: {} }))}`
const stream = await fetch(eventsUrl, { headers })
log('events stream', stream.status)
const reader = stream.body.getReader()
const decoder = new TextDecoder()
let buffer = ''
let clientId = ''
const seen = []

async function answer(eventId, outcome) {
  const body = {
    type: 'client-request',
    rpcId: `answer-${Date.now()}`,
    method: '$events/result',
    payload: { args: { clientId, eventId, outcome } },
  }
  const response = await fetch(`http://${authority}/api/$events/result`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  log('answer', eventId, JSON.stringify(outcome), '->', (await response.text()).slice(0, 200))
}

const pump = (async () => {
  while (Date.now() - started < 70000) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const line = frame.split('\n').find((item) => item.startsWith('data: '))
      if (line === undefined) continue
      const data = JSON.parse(line.slice(6))
      if (data.type === 'ready') {
        clientId = data.clientId
        log('ready clientId', clientId)
        continue
      }
      if (data.type === 'waterfall') {
        seen.push(data.eventId)
        log('waterfall', data.event, JSON.stringify(data.request).slice(0, 400))
        if (data.event === 'approval/request') {
          await answer(data.eventId, { kind: 'result', value: 'allowed-once' })
        }
        continue
      }
      if (data.type === 'cancel') {
        log('cancel', data.eventId)
        continue
      }
      if (data.type === 'emit') {
        log('emit', data.event)
      }
    }
  }
})()

await new Promise((resolve) => setTimeout(resolve, 600))
const promptBody = {
  type: 'client-request',
  rpcId: 'approval-probe',
  method: 'session/prompt',
  payload: {
    args: {
      request: {
        requestId: `probe-${Date.now()}`,
        sessionId,
        mode: 'queue',
        content: [{ type: 'text', text }],
        clientTimeZone: 'Asia/Shanghai',
      },
    },
  },
}
const response = await fetch(`http://${authority}/api/session/prompt`, { method: 'POST', headers, body: JSON.stringify(promptBody) })
log('prompt ->', (await response.text()).slice(0, 300))

await Promise.race([pump, new Promise((resolve) => setTimeout(resolve, 45000))])
log('waterfall count', seen.length)
process.exit(0)
