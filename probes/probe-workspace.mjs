/** 探针：workspace/follow 的 SSE 基线（分组要用它的 title/path/sessionIds）。 */
import { readFileSync } from 'node:fs'
import { readLocalToken } from './_state.mjs'

const token = readLocalToken()
const authority = process.argv[2] ?? '127.0.0.1:35776'
const payload = JSON.stringify({ args: {} })
const url = `http://${authority}/remote-peers/stream?endpoint=${encodeURIComponent('workspace/follow')}&payload=${encodeURIComponent(payload)}`
const response = await fetch(url, { headers: { 'x-dsh-lan-token': token } })
console.log('stream', response.status, response.headers.get('content-type'))
const reader = response.body.getReader()
const decoder = new TextDecoder()
let buffer = ''
const started = Date.now()
while (Date.now() - started < 6000) {
  const { value, done } = await reader.read()
  if (done) break
  buffer += decoder.decode(value, { stream: true })
  const frames = buffer.split('\n\n')
  buffer = frames.pop() ?? ''
  for (const frame of frames) {
    const line = frame.split('\n').find((item) => item.startsWith('data: '))
    if (line === undefined) continue
    const data = JSON.parse(line.slice(6))
    console.log('frame', data.type, JSON.stringify(data).slice(0, 500))
    if (data.type === 'baseline') process.exit(0)
  }
}
process.exit(0)
