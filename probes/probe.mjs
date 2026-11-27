/**
 * P0 冒烟：直连局域网网关打若干 /api 端点，输出状态码与截断后的响应。
 * 用法：node probe.mjs <host:port> [method] [payloadJson]
 */
import { readFileSync } from 'node:fs'
import { readLocalToken } from './_state.mjs'

const [, , authority = '127.0.0.1:33938', method = 'session/list', payloadArg = '{}'] = process.argv
const token = readLocalToken()

const response = await fetch(`http://${authority}/api/${method}`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-dsh-lan-token': token,
  },
  body: JSON.stringify({
    type: 'client-request',
    rpcId: 'probe-1',
    method,
    payload: JSON.parse(payloadArg),
  }),
})

const text = await response.text()
console.log('status', response.status, response.headers.get('content-type'))
console.log(text.slice(0, 1200))
console.log('bytes', text.length)
