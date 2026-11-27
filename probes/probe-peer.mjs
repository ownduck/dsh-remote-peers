/**
 * 直连对端网关（用对端 token）：node probe-peer.mjs <host:port> <token> <method> <payloadJson>
 */
const [, , authority, token, method, payloadArg = '{}'] = process.argv

const response = await fetch(`http://${authority}/api/${method}`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-dsh-lan-token': token,
  },
  body: JSON.stringify({
    type: 'client-request',
    rpcId: 'probe-peer',
    method,
    payload: JSON.parse(payloadArg),
  }),
})

const text = await response.text()
console.log('status', response.status, response.headers.get('content-type'))
console.log(text.slice(0, 4000))
console.log('bytes', text.length)
