/** 写路径冒烟：先起 SSE 订阅，再 session/prompt，观察 assistant-stream 分片。 */
import { readFileSync } from 'node:fs'
import { readLocalToken } from './_state.mjs'

const token = readLocalToken()
const authority = process.argv[2] ?? '127.0.0.1:35776'
const sessionId = process.argv[3] ?? 'gui-smoke'
const text = process.argv[4] ?? '只回复：收到'
const headers = { 'content-type': 'application/json', 'x-dsh-lan-token': token }

const payload = {
  args: { request: { address: { kind: 'session', sessionId }, maxMessages: 4, assistantStream: true } },
}
const streamUrl = `http://${authority}/remote-peers/stream?endpoint=${encodeURIComponent('session/follow')}&payload=${encodeURIComponent(JSON.stringify(payload))}`
const stream = await fetch(streamUrl, { headers })
const reader = stream.body.getReader()
const decoder = new TextDecoder()
let buffer = ''
const started = Date.now()
let chunks = 0
let committed = ''

const promptBody = {
  type: 'client-request',
  rpcId: 'prompt-1',
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

async function pump() {
  while (Date.now() - started < 45000) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const line = frame.split('\n').find((item) => item.startsWith('data: '))
      if (line === undefined) continue
      const data = JSON.parse(line.slice(6))
      if (data?.type === 'assistant-stream' && data.frame?.type === 'chunk') {
        chunks += 1
        if (chunks <= 3) console.log(`chunk#${chunks} +${Date.now() - started}ms`, JSON.stringify(data.frame.chunk).slice(0, 120))
      }
      if (data?.type === 'assistant-stream' && data.frame?.type === 'end') {
        console.log(`assistant end after ${chunks} chunks, +${Date.now() - started}ms`, JSON.stringify(data.frame.outcome))
      }
      if (data?.type === 'event' && data.event?.type === 'assistant/message') {
        committed = JSON.stringify(data.event.data?.message?.content ?? '').slice(0, 160)
        console.log('committed assistant/message', committed)
        return
      }
    }
  }
}

const pumping = pump()
await new Promise((resolve) => setTimeout(resolve, 500))
const response = await fetch(`http://${authority}/api/session/prompt`, {
  method: 'POST',
  headers,
  body: JSON.stringify(promptBody),
})
console.log('prompt ->', (await response.text()).slice(0, 300))
await pumping
console.log('total chunks', chunks)
process.exit(0)
