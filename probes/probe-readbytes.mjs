// 冒烟：对端 `workspaceFiles/readBytes` 一页字节能否从 multipart 回包里干净取出。
const peer = { host: '192.168.130.24', port: 62907, token: 'DrNlAjQ6zZfop8kzlxdBtffsEbehN2kwADIp9M8ksI0' }
const sessionId = 'session-7e27cf2b-161a-49a9-81aa-255dca058a39'
const path = 'C:\\Users\\Administrator\\Documents\\vertax-work\\default-workspace\\doubao-jesus\\output-images.zip'

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

const offset = Number(process.argv[2] ?? 0)
const length = Number(process.argv[3] ?? 1048576)
const response = await fetch(`http://${peer.host}:${peer.port}/api/workspaceFiles/readBytes`, {
  method: 'POST',
  headers: { 'x-dsh-lan-token': peer.token, 'content-type': 'application/json' },
  body: JSON.stringify({
    type: 'client-request',
    rpcId: 'probe-1',
    method: 'workspaceFiles/readBytes',
    payload: { args: { workspaceFileScopeId: sessionId, path, options: { range: { offset, length } } } },
  }),
})
console.log('status', response.status, 'ctype', response.headers.get('content-type'))
const boundary = (/boundary=([^;]+)/u.exec(response.headers.get('content-type') ?? '') ?? [])[1]
const buffer = Buffer.from(await response.arrayBuffer())
if (boundary === undefined) {
  console.log('non-multipart body:', buffer.toString('utf8').slice(0, 400))
  process.exit(1)
}
const part = extractMultipartPart(buffer, boundary.trim().replace(/^"|"$/gu, ''))
console.log('raw bytes', buffer.byteLength, 'part bytes', part?.byteLength)
if (part !== undefined) console.log('head hex', Buffer.from(part.slice(0, 8)).toString('hex'), 'tail hex', Buffer.from(part.slice(-4)).toString('hex'))
