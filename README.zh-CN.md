# dsh-remote-peers

[English](README.md) | 中文

在自己的侧栏里操作另一台机器上的 DeepSeek Harness —— 走局域网。社区 DeepSeek Harness 插件，非 DeepSeek AI 官方产品。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个插件，两件事，不改 DSH 本体：

1. 本机把自己的能力公开成一个带共享密钥的 HTTP 网关（监听 `0.0.0.0`，端口由系统分配）；
2. 桌面里多出一个**远程端**面板：填对端的 `ip:端口 + 密钥`，就能看到对端的全部会话
   （按对端工作区分组），读历史、发消息并流式接收、回传审批、预览与下载文件。

对端不需要另开 API。网关把请求以**对端本机操作者 Peer** 的身份派发进 DSH 自己的
`/api` 通道（`connection.createSharedFetchHandler('/api')`），所以对端暴露的能力和它的桌面完全一致。

## 安装

需已安装 DSH，并能使用 `dsh` 命令（`desktop` 或 `web`）。

```powershell
dsh plugin --profile desktop add dsh-remote-peers
# 或: dsh plugin --profile web add dsh-remote-peers
# 或: dsh plugin --profile desktop add github:ownduck/dsh-remote-peers
```

安装后重启 DSH，打开侧栏的 **远程端** 入口。

```powershell
dsh plugin --profile desktop remove dsh-remote-peers
```

两台机器都装本插件。要被访问的那台，在面板里能看到自己的局域网地址、端口与密钥；
你正在用的这台，把地址 + 密钥登记成一条他端即可。

## 能做什么

- **会话**：对端的全部会话，按对端工作区分组，已归档的置底
- **对话**：分页读历史、发消息、流式接收回复；思考行、代码块、Markdown、文件卡片都对齐宿主外观
- **附件**：`Ctrl+V` 直接粘贴，或从 `+ → 文件` 选；图片成 64×64 缩略图，其余文件成 240×64 文件卡。
  选中即开始上传到对端，发送时随正文带一张 `{ type: 'file', receiptId }` 收据
- **审批 / 提问**：在本侧批准或作答，决定回传给对端
- **文件**：右侧预览 PDF / Word / Excel / PPT / 图片 / 文本；下载落进同一份本机副本，
  **打开**、**下载**、**显示文件位置** 共用这份副本
- **运行态**：对端仍在跑的会话会一直显示运行状态，重开面板后也在

## 安全

网关上有两道闸：

| 闸 | 默认 |
| --- | --- |
| 来源 CIDR 白名单 | 只放行私网段：`127.0.0.0/8`、`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`::1/128` |
| 共享密钥 | `x-dsh-lan-token` 头或 `Authorization: Bearer`，固定时间比较 |

密钥首次启动自动生成（43 字符），面板里可**重置**；重置后旧密钥立刻失效，别处登记过本机的他端需要重填。
端口对局域网开放，Windows 弹防火墙提示时请允许**专用网络**。

网关不暴露 DSH 源码，也不携带本机任何凭证；密钥只留在对端 Host 进程内，从不下发给浏览器。

## 端点

对外（网关，需密钥）：

- `GET /remote-peers/hello` → `{ type, instanceId, port, version }`
- `POST /api/<namespace>/<method>` → 与桌面浏览器同一个信封：
  `{ type: 'client-request', rpcId, method, payload: { args: {...} } }`
- `GET /remote-peers/stream?endpoint=<ns>/<method>&payload=<urlencoded json>` → 真 SSE，逐帧转发；
  正常结束发 `event: end`，失败发 `event: error`

只在本机可达（浏览器与本机 Host 通信，对端密钥不出 Host）：

- `/remote-peers` RPC：`status`、`token/reset`、`peers/list|upsert|remove|ping`、`proxy`、`file/size(s)`、
  `open-local`、`local/copy`、`download/status|save|cancel`、`diag`
- `POST /api/remote-peers/upload?id=<peer>&sessionId=<id>[&name=<名字>][&mediaType=<类型>]` →
  请求体原样流给节点自己的 `/api/session/uploadFileBinary`，回那条路由的 `{ ok, value: { receiptId, image | file } }`
- `GET|HEAD /api/remote-peers/file?id=<peer>&path=<绝对路径>[&v=<版本>][&download=1]`
- `GET /api/remote-peers/export|markdown|stream|call|diag|vendor|office|present-open|changes`

## 已知边界

- **只打通局域网。** 目前没有 NAT 穿透或中继，两台机器必须能直接互相访问（同网段，或能维持三层可达的 VPN）。
- **侧栏做不成文件夹。** 宿主的 `sidebar.panellist` 是平铺列表，`sidebar.workspaces` 是单槽且已被宿主占用，
  所以本插件给每个他端注册一条入口，把工作区树放在会话列表页里。
- **只做预览，不做编辑。** 各格式对齐宿主渲染链（PDF 走 pdf.js，Office 走对端 `officeKit`）。
- **附件按字节流过去。** 选中的文件直接作为本机 `/api/remote-peers/upload` 的请求体发出，网关原样转给节点，
  不再做 base64 展开，与桌面端同一条路径；占用是每份文件一条在途请求，几百 MB 的大包仍建议走文件**下载**那条路。
- **没有「轨迹」tab。** 它需要事件级调用树，本插件不重建。
- **「显示文件位置」固定约 2 秒。** 资源管理器起窗本身就要这么久，按钮固定显示 2 秒「正在打开…」，不再轮询窗口。

## 开发

```powershell
npm install
npm run build     # src/client.js（连同 pdfjs-dist、xlsx）→ lib/client.js
npm run probe     # 面板的无头渲染冒烟
npm run audit     # src/client.js 的死声明 / 重复块检查
```

结构：`index.mjs` 是 Host 面（网关、路由、本机副本）；`src/client.js` 是 Client 面入口（面板 UI 的状态、RPC 与布局），样式令牌、图标字形、预览与语义助手分别拆在 `src/theme.js`、`src/icons.js`、`src/preview.js`、`src/conversation.js`；
`scripts/build.mjs` 打客户端产物；`probes/` 是冒烟脚本；`vendor/pdfjs` 是预览要用的资源。
实现细节见 [`docs/internals.zh-CN.md`](docs/internals.zh-CN.md)。

## 许可证

MIT。打包进来的第三方代码保留各自许可证：pdf.js（`pdfjs-dist`）与 SheetJS（`xlsx`）为 Apache-2.0。
