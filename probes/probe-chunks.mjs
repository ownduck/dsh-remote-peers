import { readLocalToken } from './_state.mjs'
const token = readLocalToken()
const headers = { "content-type":"application/json", "x-dsh-lan-token": token }
const authority = "127.0.0.1:35776"
const sessionId = "sdk-test-20261124-a"
const payload = { args: { request: { address: { kind:"session", sessionId }, maxMessages: 2, assistantStream: true } } }
const url = `http://${authority}/remote-peers/stream?endpoint=${encodeURIComponent("session/follow")}&payload=${encodeURIComponent(JSON.stringify(payload))}`
const res = await fetch(url, { headers })
const reader = res.body.getReader(); const dec = new TextDecoder(); let buf=""
const t0 = Date.now(); const shapes = []
setTimeout(async () => {
  await fetch(`http://${authority}/api/session/prompt`, { method:"POST", headers, body: JSON.stringify({ type:"client-request", rpcId:"p2", method:"session/prompt", payload:{ args:{ request:{ requestId:`p-${Date.now()}`, sessionId, mode:"queue", content:[{type:"text",text:"再回复：OK"}] } } } }) })
}, 400)
while (Date.now() - t0 < 20000) {
  const { value, done } = await reader.read(); if (done) break
  buf += dec.decode(value, { stream:true }); const parts = buf.split("\n\n"); buf = parts.pop() ?? ""
  for (const part of parts) {
    const line = part.split("\n").find(l => l.startsWith("data: ")); if (!line) continue
    const d = JSON.parse(line.slice(6))
    if (d?.type === "assistant-stream" && d.frame?.type === "chunk") {
      console.log("+" + (Date.now()-t0) + "ms", JSON.stringify(d.frame.chunk))
    }
    if (d?.type === "assistant-stream" && d.frame?.type === "end") { console.log("END", JSON.stringify(d.frame.outcome)); process.exit(0) }
  }
}
process.exit(0)
