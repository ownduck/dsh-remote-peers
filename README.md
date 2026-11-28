# dsh-remote-peers

English | [中文](README.zh-CN.md)

Drive another DeepSeek Harness instance from your own sidebar, over the local network. Community DeepSeek Harness plugin — not an official DeepSeek AI product.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Two things, one plugin, no changes to DSH itself:

1. This machine publishes its capabilities as an HTTP gateway guarded by a shared token (listening on `0.0.0.0`, port assigned by the OS).
2. Your desktop grows a **Remote peers** panel: enter a peer's `ip:port` + token and you get that peer's sessions, grouped by *their* workspaces — read history, send messages with streaming replies, answer approvals, preview and download files.

The peer does not need a separate API. The gateway dispatches requests into the peer's own `/api` channel as that machine's operator peer (`connection.createSharedFetchHandler('/api')`), so the peer exposes exactly what its desktop exposes.

## Install

Requires DSH with the `dsh` CLI (`desktop` or `web`).

```powershell
dsh plugin --profile desktop add dsh-remote-peers
# or: dsh plugin --profile web add dsh-remote-peers
# or: dsh plugin --profile desktop add github:ownduck/dsh-remote-peers
```

Restart DSH, then open the **Remote peers** entry in the sidebar.

```powershell
dsh plugin --profile desktop remove dsh-remote-peers
```

Both machines run this plugin. On the machine you want to reach, the panel shows its LAN address, port and token; on the machine you sit at, add that address + token as a peer.

## What you can do

- **Sessions**: every session of the peer, grouped by the peer's workspaces, archived ones pushed to the bottom
- **Chat**: read history in pages, send a prompt, watch the reply stream in; thinking rows, code blocks, markdown and file cards follow the host app's look
- **Attachments**: paste files with Ctrl+V or pick them from `+ → 文件`; images arrive as 64×64 thumbnails, every other file as a 240×64 file card. Each draft uploads to the peer as soon as it is picked and is sent with the prompt as a `{ type: 'file', receiptId }` part
- **Approvals and questions**: approve or answer here; the decision is relayed to the peer
- **Files**: preview PDF / Word / Excel / PPT / images / text in the right pane; downloads land in one shared local copy, and *Open*, *Download* and *Show in folder* all reuse it
- **Run state**: a remote session that is still working keeps showing its running state, including after you reopen the panel
- **Cross-network link**: the *跨域网关* card at the top of the panel joins an EasyTier virtual network, so two machines on different networks can reach each other. Enable it on one machine and send its **connection code** to the other; pasting that code there brings it in, and pasting the other machine's code links back the other way. The core runs with `--no-tun` (no admin rights, no virtual adapter); the first enable downloads ~33 MB of kernel into `<stateDir>/easytier/`, after which each machine gets one forward port (`127.0.0.1:36001+`) straight to the peer's gateway. A peer joined this way is an ordinary peer record, so sessions, attachments, files and approvals behave exactly as on a LAN.

## Security

Two gates, both on the gateway:

| Gate | Default |
| --- | --- |
| Source CIDR allow-list | private ranges only: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `::1/128` |
| Shared token | `x-dsh-lan-token` header or `Authorization: Bearer`, compared in fixed time |

The token is generated on first launch (43 chars) and can be **reset** from the panel; resetting invalidates the old token immediately, and peers that registered this machine elsewhere must be updated. The port is open on the LAN — on Windows, allow it on *Private* networks when the firewall asks.

The gateway neither exposes DSH's source nor carries any local credential; the token stays inside the peer's Host process and is never handed to a browser.

## Endpoints

Exposed through the gateway (token required):

- `GET /remote-peers/hello` → `{ type, instanceId, port, version }`
- `POST /api/<namespace>/<method>` → the same envelope the desktop browser uses: `{ type: 'client-request', rpcId, method, payload: { args: {...} } }`
- `GET /remote-peers/stream?endpoint=<ns>/<method>&payload=<urlencoded json>` → real SSE, forwarded frame by frame; ends with `event: end`, failures with `event: error`

Local-only routes (the browser talks to its own Host; peer tokens stay there):

- `/remote-peers` RPC: `status`, `token/reset`, `peers/list|upsert|remove|ping`, `proxy`, `file/size(s)`, `open-local`, `local/copy`, `download/status|save|cancel`, `diag`
- `POST /api/remote-peers/upload?id=<peer>&sessionId=<id>[&name=<name>][&mediaType=<type>]` → the raw request body is streamed to the peer's own `/api/session/uploadFileBinary`; returns that route's `{ ok, value: { receiptId, image | file } }`
- `GET|HEAD /api/remote-peers/file?id=<peer>&path=<absolute path>[&v=<version>][&download=1]`
- `GET /api/remote-peers/export|markdown|stream|call|diag|vendor|office|present-open|changes`

## Known limits

- **LAN only.** No NAT traversal or relay yet; both machines must reach each other directly (same subnet, or a VPN that keeps layer-3 reachability).
- **The sidebar cannot nest.** DSH's `sidebar.panellist` is a flat list, and `sidebar.workspaces` is a single slot already owned by the host. So the plugin registers one entry per peer and renders the workspace tree inside the session list page.
- **Attachments stream as bytes.** A picked file leaves the browser as the request body of the local `/api/remote-peers/upload` route and is piped to the peer without base64 expansion, the same path the desktop app takes. Footprint is one in-flight request per file; very large archives still belong to the file *download* path.
- **Preview only, no editing.** Formats mirror the host's renderers (PDF via pdf.js, Office via the peer's `officeKit`).
- **No `Trajectory` tab.** It needs event-level call trees, which this plugin does not reconstruct.
- **`Show in folder` takes about 2 seconds.** Explorer itself takes that long to raise a window, so the button shows a fixed 2-second "Opening…" state instead of polling for the window.

## Development

```powershell
npm install
npm run build     # src/client.js (+ pdfjs-dist, xlsx) -> lib/client.js
npm run probe     # headless render smoke for the panel
npm run audit     # dead declarations / duplicated blocks in src/client.js
```

Layout: `index.mjs` is the Host face (gateway, routes, local copies); `src/client.js` is the Client face (panel UI: state, RPC, layout), with `src/theme.js` (style tokens), `src/icons.js` (inline SVG glyphs), `src/preview.js` (PDF/image/Excel preview) and `src/conversation.js` (model, usage and process-label helpers) split out; `scripts/build.mjs` bundles the client; `probes/` holds smoke scripts; `vendor/pdfjs` carries the assets the preview serves. Deep implementation notes live in [`docs/internals.zh-CN.md`](docs/internals.zh-CN.md) (Chinese).

## License

MIT. Bundled third-party code keeps its own license: pdf.js (`pdfjs-dist`) and SheetJS (`xlsx`) are Apache-2.0.
