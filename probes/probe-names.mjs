/** 端点名探测：对 P0 网关逐个试调用，打印 code。 */
import { readFileSync } from 'node:fs'
import { readLocalToken } from './_state.mjs'

const token = readLocalToken()
const authority = process.argv[2] ?? '127.0.0.1:33938'
const names = process.argv.slice(3)

for (const method of names) {
  try {
    const response = await fetch(`http://${authority}/api/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-dsh-lan-token': token },
      body: JSON.stringify({ type: 'client-request', rpcId: 'p', method, payload: { args: { _request: {} } } }),
    })
    const text = await response.text()
    let code = `http-${response.status}`
    try {
      const parsed = JSON.parse(text)
      code = parsed?.result?.ok === true ? 'OK' : (parsed?.result?.error?.code ?? '?')
    } catch {
      code = code + ' non-json'
    }
    console.log(`${method} -> ${code}`)
  } catch (error) {
    console.log(`${method} -> error ${error.message}`)
  }
}
