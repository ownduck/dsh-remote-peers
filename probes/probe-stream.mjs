/** SSE 冒烟：连 /remote-peers/stream 读 session/follow，打印前若干帧后断开。 */
import { readFileSync } from 'node:fs'
import { readLocalToken } from './_state.mjs'

const token = readLocalToken()
const authority = process.argv[2] ?? '127.0.0.1:35611'
const sessionId = process.argv[3] ?? 'gui-smoke'
const limit = Number(process.argv[4] ?? 6)

const payload = {
  args: {
    request: {
      address: { kind: 'session', sessionId },
      maxMessages: 6,
      assistantStream: true,
    },
  },
}
const url = `http://${authority}/remote-peers/stream?endpoint=${encodeURIComponent('session/follow')}&payload=${encodeURIComponent(JSON.stringify(payload))}`

const abort = new AbortController()
const response = await fetch(url, { headers: { 'x-dsh-lan-token': token }, signal: abort.signal })
console.log('status', response.status, response.headers.get('content-type'))

const reader = response.body.getReader()
const decoder = new TextDecoder()
let seen = 0
let buffer = ''

while (seen < limit) {
  const { value, done } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const frames = buffer.split('\n\n')
  buffer = frames.pop() ?? ''
  for (const frame of frames) {
    const line = frame.split('\n').find((item) => item.startsWith('data: '))
    if (line === undefined) {
      console.log('frame:', frame.slice(0, 60))
      continue
    }
    const data = JSON.parse(line.slice(6))
    seen += 1
    const summary = data?.type === 'snapshot'
      ? `snapshot  records=${data.records?.length} cursor=${data.cursor} assistantStream=${data.assistantStream !== undefined}`
      : data?.type === 'event'
        ? `event     ${data.event?.type} seq=${data.event?.seq}`
        : data?.type === 'assistant-stream'
          ? `assist    ${data.frame?.type} ${data.frame?.type === 'chunk' ? JSON.stringify(data.frame.chunk).slice(0, 80) : ''}`
          : `other     ${JSON.stringify(data).slice(0, 80)}`
    console.log(`#${seen} ${summary}`)
    if (seen >= limit) break
  }
}
abort.abort()
console.log('closed after', seen, 'frames')
