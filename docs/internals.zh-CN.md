# 实现笔记（开发向）

> 面向使用者的说明见 [README.md](../README.md) / [README.zh-CN.md](../README.zh-CN.md)。本文保留实现细节与逐条行为约定，路径已改为 $DSH_HOME / <repo>。

# dsh-remote-peers

DeepSeek Harness 的远端互联插件：**只做插件，不改本体**。当前只打通局域网，后续做跨域跨端。

两件事：

1. 本机把自己的能力公开成一个带共享密钥的 HTTP 网关（监听 `0.0.0.0`，端口随机）；
2. 本机桌面里多一个「远程端」面板：填对端 `ip:端口 + 密钥`，就能看到对端的全部会话
   （按对端工作区分组）、读历史、发消息并流式接收，还能回传审批。

对端不需要另开 API —— 网关把请求以**本机操作者 Peer** 的身份直接派发进 DSH 自己的
`/api` 通道（`connection.createSharedFetchHandler('/api')`），所以对端看到的能力和
桌面本机完全一致。

## 装载

- 包目录：`<repo>`（源码，改这里）；npm 包名 `dsh-remote-peers`
- profile 里是以 junction 挂进去的：`profiles\desktop\node_modules\dsh-remote-peers`
- profile 只有两处改动：`package.json` 加一条依赖 + `bundles` 加一行，插件条目由本包
  自带的 `cordis.patch.yml` insert 声明（`enabled` 关掉即可停用）

装到另一台机器（或换一个 profile）不需要脚本，两步即可：

1. 把整个包目录放到 `<DSH_HOME>\profiles\<profile>\node_modules\dsh-remote-peers`（或做成
   junction / symlink 指向源码目录）；
2. 在该 profile 的 `package.json` 的 `dependencies` 里加一条 `"dsh-remote-peers": "*"`，
   并在 `bundles` 里加一行同名条目 —— 插件条目由本包自带的 `cordis.patch.yml` insert 声明
   （`enabled` 关掉即可停用）。

改完源码后，桌面无需重启：触一下 `profiles\<profile>\cordis.patch.yml`（加一行注释）即可
热重载；客户端模块需要刷新页面（Ctrl+R）才会重新加载。

## 会话页数据通路

- 正文窗口：`session/follow` 快照一次给 `maxMessages: 500` + `turnWindow{minMessages: 50, minTurns: 2}`（与原生 `HISTORY_PAGE_OPTIONS` 同口径），**不是全量读取**。
- 更早的窗口：滚到顶（`scrollTop < 120`）或点轮次导航里未加载的轮，用 `session/events` 的 `beforeSeq` 补一页（200 条 + 同样的 `turnWindow`）。这类大页走 `GET /api/remote-peers/call`，不经浏览器 RPC 通道，避免体积上限把尾部截掉。
- 轮次刻度：`session/projections` 的 `turnOutline` 首帧即给全部轮次，梯子初始就完整；未加载的轮点一下才翻页。
- 三条 SSE（`session/follow`、`$events`、`workspace/follow`）统一用 `fetch` 读流并带 `Authorization` —— 原生 `EventSource` 无法携带请求头，会被本机网关 401。
## 状态与密钥

| 文件 | 内容 |
| --- | --- |
| `$DSH_HOME\remote-peers\state.json` | instanceId、监听地址与**实际端口**、本机局域网地址 |
| `$DSH_HOME\remote-peers\token` | 共享密钥，首次启动自动生成（43 字符） |
| `$DSH_HOME\remote-peers\peers.json` | 他端清单（id / 名称 / 地址 / 端口 / 密钥） |

密钥可以在面板里「重置」，重置后运行中的监听器立刻只认新密钥，已登记的他端需要重填。

他端表格的 `删除` **先弹确认框**（`renderPeerDeleteDialog`，复用 `dialogShell` + `dialogHead`，
确认按钮为红色），文案写明「只删本机保存的地址与密钥，对端不受影响」；确认后才调 `peers/remove`，
并同步清掉左栏入口与该端正在看的会话。

### 添加 / 编辑他端表单

- **必填**：地址、端口、密钥；**显示名可留空**（留空时列表显示「（未命名）」，左栏入口回退到
  `host:port`）。未填就点保存 → 输入框描边转红 + 底部红字提示，不发请求。
- **粘贴即拆**：往「地址」或「端口」里粘 `192.168.130.24:62907` 会自动拆成地址 + 端口；
  `http://host:port/`、`host port`、`[::1]:62907` 同样识别，端口越界（>65535）则不拆、原样留着。
- 「端口」输入框只收数字。

### 交互回执

| 操作 | 回执 |
| --- | --- |
| `刷新` | 按钮禁用并换成转圈 + `刷新中…`（`busy === 'status'`），完成后恢复 |
| `检测`（他端行） | 同上，`busy === 'ping:<peerId>'`，避免连点重复请求 |
| `复制` 密钥 | 成功后按钮变绿 + `✓ 已复制`，1.6s 后复原（`dsh-rp-copied` 轻微弹一下）；剪贴板 API 失败时退到临时 textarea + `execCommand` |
| `复制` 局域网地址 | 每条地址后面跟一个复制图标（原生 `copyGlyph` 13px），点一下只复制这一条，图标变绿勾并弹一下，1.4s 复原（`copiedAddress` 记当前条） |
| `重置` 密钥 | **先弹确认框**（`renderTokenResetDialog`），说明「旧密钥立刻失效、已登记本机的他端需重填；本机对他端的记录不受影响」；确认后按钮变 `重置中…` |

## 准入

两道闸：

- 来源 CIDR 白名单，默认只放行私网段（`127/8`、`10/8`、`172.16/12`、`192.168/16`、`::1`），
  Tailscale 的 `169.254.x` 这类链路本地地址默认不放行；
- 共享密钥，`x-dsh-lan-token` 头或 `Authorization: Bearer`，固定时间比较。

端口对局域网开放，Windows 若弹防火墙提示请允许「专用网络」。

## 端点

对外（网关，需密钥）：

- `GET /remote-peers/hello` → `{ type, instanceId, port, version }`
- `POST /api/<namespace>/<method>` → 与桌面浏览器同一个信封
  `{ type:'client-request', rpcId, method, payload: { args: {...} } }`
- `GET /remote-peers/stream?endpoint=<ns>/<method>&payload=<urlencoded json>` → **SSE 真流**：
  经 `ctx.typertGateway.wireStream.open` 打开 Remote 流式端点，逐帧 `data: <json>` 下发，
  结束发 `event: end`，失败发 `event: error`。对话用的就是 `session/follow`
  （`assistantStream: true`，含 `assistant-stream` 的 `chunk` 帧）。

对内（本机浏览器）：

- `/remote-peers` RPC 通道：`status` / `token/reset` / `peers/list` / `peers/upsert` /
  `peers/remove` / `peers/ping` / `proxy`
- `GET /remote-peers/stream?...`：把面板的 EventSource 转发到对端的同名流式端点（令牌留在 Host 侧）
- `GET /remote-peers/stream?endpoint=workspace/follow` → 工作区基线：
  `{type:'baseline', value:{items:[{workspaceId, path, title, sessionIds}], archivedSessionIds, pinnedSessionIds}}`。
  面板用它把 `session/list` 的全部会话按对端工作区分组（未归入的单独一组，已归档的置底）。
- `GET|HEAD /api/remote-peers/file?id=<peer>&path=<绝对路径>[&v=<版本>][&download=1]`：
  转发对端 `GET /api/file`。对端在缺 `v` 时 302 到带版本号的 URL，这里把重定向改写成指回本路由
  （保留 `id`），浏览器跟随后的响应沿用对端的 `private, max-age=31536000, immutable`；
  逐字节透传 `content-type` / `content-length` / `nosniff` / CSP；`download=1` 补 `content-disposition`。
  预览图片、下载文件都走它，**不需要上传、共享目录或任何映射表**。
- `POST /api/remote-peers/present-open?id=<peer>&sessionId&seq&index&action=reveal`：
  转发对端 `POST /api/present.open`，在对端桌面显示文件位置。

## 左栏入口

- `sidebar.panellist` 一条固定入口「远程端」= 管理页（网关、密钥、他端清单）；
- 每个他端各再注册一条 `sidebar.panellist` 入口（id `remote-peers:<peerId>`，order 6+i），
  名称取该他端显示名，点开直接进入该端会话列表（`main` 侧按同一 key 注册）；
- **排序**：`sidebar.panellist` 按 `order` 升序、同值按注册顺序，原生入口只用到 0/10 这种小值。
  本插件全部入口用同一个大基数 `PANEL_ORDER_BASE = 1_000_000`（「远程端」占 base，各他端占
  base+1+index），因此这一块**紧挨着**、整体落在该槽位最末，不会再被其他插件插进中间；
  列表末尾的「更多」行由原生固定追加在面板行之后，属于外壳自身，不参与排序。
- 他端增删/改名时按清单增删入口：**改名要重注册那一条面板行**——原生左栏只在槽位变化
  （`ctx.slots.subscribe('sidebar.panellist')`）时才重读 `label`（`ui-sidebar/src/client/index.ts:57-70`），
  只改 `holder.current` 名字不会触发重读；重注册时 `main` 页不动，所以正开着的会话页不受影响。
  接管「工作区」分组仍不在本插件范围内。

### 为什么左栏做不成「文件夹」

原生左栏两段是不同槽位：`sidebar.panellist` 是**平铺列表**，每个条目只带 `label` + 图标，由
`PanelRow` 渲成单行，没有 children / 缩进 / 右侧时间列（`ui-sidebar/src/client/index.ts:101`、
`contract/slots.ts:47`）；图里那种「文件夹头 + 缩进会话行 + 右侧相对时间」属于 `sidebar.workspaces`，
它是 `kind: 'single'`，已被原生 `ui-workspace` 独占（`ui-workspace/src/client/index.ts:375`）。
所以要在左栏嵌套，只能抢那个单槽位（顶掉原生工作区）或给 panellist 加 children —— 都等于改 DSH 本体。
插件现在的做法：左栏保持一条「远程端」+ 每个他端一条入口，**文件夹树放在会话列表页里**（见下）。

## 流式区：复刻原生「思考」行

对端 `session/follow` 的 `assistant-stream` 里，chunk 分 `text-delta`（回答）、`reasoning-delta`（思考）、
`tool-call-delta`（工具参数片段），三者都带 `text`。`chunkText()` 只认回答增量，思考与工具参数不进正文
（否则表现是「先刷满一段英文思考 → 该步 end 清空 → 下一步再刷 → 几轮后才看到回答」）。

思考按原生 `ReasoningRow` + `DisclosureRow` + `TextShimmer` 复刻：

- 24px 一行：16px 图标框（`IconThinkOutlineRegular` 14px，16px 内居中）+ gap 6 + `思考`（13/24、
  三级文字色、400 字重）；hover 时整行转二级色、图标淡出让位给 chevron（`[data-rp-think-row]` CSS）。
- 折叠摘要：流式中取「最近一个已写完段落的首行」（`latestParagraphFirstLine`），完成后取首行，
  `**` 去掉；前面有 2×2px 的圆点分隔（`margin: 0 8px`）。
- 流式中的摘要右侧 48px 渐隐且不省略（`mask-image: linear-gradient(to right, black calc(100% - 48px), transparent)`），
  并叠一层 `TextShimmer` 扫光（底稿可读、扫光层 `aria-hidden` 的遮罩副本，1.5s `steps(48)`）。
- 点整行（含键盘 Enter/Space）展开：`padding: 4px 0 4px 22px`，正文用 `MarkdownText variant="compact"`；
  展开时左侧换成向上 chevron，摘要隐藏。
- 正文流式块与思考行同属一个 `gap: 16px` 的列（原生 `AssistantMarkdown .body`）；原生没有打字光标，
  所以也不画 `▍`。

顺带：`reasoningDisplayText()` 按原生 `reasoningText()` 剥掉开头的 `<signature>…</signature>`。

进入某个他端后，列表按原生左栏的形状渲染三层：

```
▾ 📁 <对端名>            5   · <最近会话的相对时间>
   ▾ 📁 DS Bot           1   · 2天
       Chief             2天
   ▸ 📁 未归入工作区      3   · 21小时      ← 默认展开，点文件夹行折叠
```

- 文件夹行：chevron + 原生文件夹图标（`navFolderGlyph`，取 `IconFolderOpenRegular/CloseRegular`）+
  名字 + 会话数 + 右侧相对时间；点行折叠/展开（`sessionTreeOpen`，key 缺省即展开）。
- 会话行：缩进一级，标题 + 右侧相对时间（`刚刚 / N分钟 / N小时 / N天`，超一周给日期），
  整行可点开会话；sessionId 与 cwd 收进 `title`。
- 组顺序来自 `workspace/follow` 的基线顺序，未归入的单独一组、已归档置底且默认收起；
  「分组：时间」按钮仍是平铺一层。

## 会话页

会话页是**本机自绘**（未复用宿主会话组件：原生的会话视图绑在本机会话 scope 上，远端会话没有 scope）。
只还原原生观感，不复刻与本插件无关的控件：

- 标题 + 模式标签：模式名取 `session/list` 的 `projections.values.agentPreset`（`null` = 对端默认预设），
  再用 `agentPresets/list` 的清单映射成名字；内置预设宿主不给 `name`，按宿主文案映射
  （`standard` 标准模式 / `ptc` PTC 模式 / `minimal` 极简模式 / `cordis` 创造模式）；
- 只有 `对话` 一个 tab：`轨迹` 需要事件级的调用树，本插件不提供，直接不做；
- 正文通栏 `maxWidth: 820`：助手不加气泡，用户靠右浅灰气泡；
- 正文渲染支持围栏代码块、整行加粗的小标题、无序/有序列表的悬挂缩进、段落折行；
- 代码块用原生代码卡片：给 `MarkdownText` 的 `labels.code` 传 `toolbarLabels`
  （`{ codeLabel: '代码块', wrapLabel: '自动换行', unwrapLabel: '取消自动换行' }`，同
  `ui-chat/src/client/markdown-labels.ts`）。这样 `CodeBlock` 走 `CodeToolbar`：左侧是语言名
  （围栏没写语言时就是「代码块」）、右侧是换行开关 + 复制图标；不给 `toolbarLabels` 时是旧的
  纯文本「复制」条，样式和交互都跟原生不一致。换行默认开、只作用于当前这张卡片、不影响复制出的
  源码；复制成功后图标换成「已复制」一秒；高亮/换行/diff 围栏全部由原生 `CodeBlock` 自己实现，
  本插件不重画；
- 文件/图片卡片：**只渲染卡片，不跨端传字节**；点击卡片（含消息里的附件卡）都走右侧预览面板，
  数据由 `openFilePreview()` 按该会话 `cwd` 解析后的路径经 `/api/remote-peers/file` 转发；
- 底部状态行：`N 轮 M 步 · tok/s · 累计 token · 缓存命中 · 上下文占用`，取自会话事件里的
  `turn/start`、`step/start|end`、`assistant/message.data.usage`、`request/context.data.contextWindow`。

### 轮次导航与历史分页

右侧竖排刻度 = 用户提问（`turnOutline` ∪ 已加载轮，首帧即有全部刻度），悬停出预览卡、点击跳转。

- 预览卡：原生几何 —— `right: calc(100% + 10px)`（挂竖轨的兄弟节点，不能被 `overflow` 裁掉），
  `top: calc(50% + 轨内偏移 - 轨高/2)`，`transition: top 140ms`；
  刻度 `onBlur`、轨 `onPointerLeave`、`pointerleave`/`window blur`/`visibilitychange`、正文滚动都要清态。
- 落点：`data-rp-turn-anchor` 只挂在提问行（助手块留 `data-rp-turn` 供高亮），跳转按 rect 差值对齐到
  视口顶 + 24px，并连等数帧重复对齐。
- 历史：首屏 500 条 + `turnWindow{50,2}`，滚到顶走 `session/events` `beforeSeq` 续页；跳未加载轮时循环翻页覆盖目标 seq。
  顶部边缘药丸镜像 `hasMore`：可点「加载更早的消息」，到底显示「已到会话开头」。

### 「已完成，用时 N 秒」明细

一轮结束行，两层折叠（第三层不做）：

- 第一层：点「已完成，用时 N 秒 ⌄」展开一行分组标题（原生 `processTitle` 规则：按分类计数取前三，
  一类直接写、两类 `A并B`、三类以上 `A、B、C等`；纯推理写「已完成分析」）；
- 第二层：点分组标题展开逐步行 —— 推理为 `思考 · <该段首行>`（原生 `FirstLine` 摘要，不把整段拼成一行），
  工具为 `运行命令 / 读取文件 / 写入文件 / 编辑文件 · <工具 description，缺省取 path/query>`，
  非用户来源的 `user/message` 为 `上下文注入 · <source.kind>`；
- 第二层明细块**限高**（原生 `ChatGroupSeat.module.css .body` 的 `max-height: min(400px, 50vh)`）：
  内容超高就在块内滚动（`overflow-y:auto`、`scrollbar-gutter:stable`），上下还有内容时该侧压 24px 渐隐
  （镜像原生 `useProcessScroll` 的边缘渐隐；滚动位置按轮号记在 `processScroll`）；
- 数据只取当前窗口事件（`step/start` 分段），不做额外请求；拿不到数据时不出箭头。
- 逐行左侧图标用原生 `ui-primitives` 的 artwork（1px regular，14px 显示）内联 SVG：思考 `think-outline`、
  上下文注入 `context-injection-outline`、工具行按分类取活动图标（`commands→api`、`webFetch/read→browse`、
  `webSearch→globe`、`edit/write→edit`、`code→code`、`search→search`、`subagents→agent-preset`、`plan→plan`、
  `questions→question`、其余 `sparkle`），不再用 `✳ / › / ▤` 文本字符；
- `/permission` 斜杠命令（`command/run` / `command/done` 且 `name === 'permission'`）不渲染成正文，原生只在权限 chip 里体现。

### 「+」添加菜单

输入框左下角的 `+` 打开原生样式的菜单，只保留本次要求的五项：

| 项 | 行为 |
|---|---|
| 文件 file | 打开本机文件选择框，选中的文件以胶囊列在输入框上方（**跨端上传未接入**，发送时会提示"只发送文本"并清空） |
| 目标 goal | 输入框内嵌蓝色 `/目标` 标记 + 提示「输入目标，智能体将持续执行…」，回车后以 `/goal <内容>` 走命令通道 |
| 计划 plan | 同上，蓝色 `/计划` + 「描述你的任务以生成计划」，提交 `/plan <内容>` |
| 压缩 compact | 立即执行 `/compact`，结果以 `> compact · …` 两行（执行中 / 完成）落在会话里 |
| 下载日志 export | 本机 `GET /api/remote-peers/export?id=<peer>&sessionId=<sid>` 流式转发对端 `session.export` ZIP，并弹「Session 导出已开始下载」 |

未实现（按要求不做）：反馈 feedback、权限 permission、模型 model、mobile —— 权限与模型已有各自入口，mobile 属其他插件。

**斜杠命令统一走 `commands/execute`**：输入框里以 `/` 开头的文本不再当消息发送，而是
`{args:{agentId, line, submittedAttachments:[]}}` 直接执行；`command/run` 与 `command/done`
事件渲染成灰色 `> name · text` 行（`kind:error` 用红色）。

**导出路由**：`index.mjs` 新增精确 fetch 路由 `/api/remote-peers/export`，与 stream 路由同批注册
（失败按 250ms 退避重试），对端令牌只留在 Host 侧，浏览器只与本机通信。

### 标题栏「⋯」菜单

与原生 breadcrumb 右侧的 `⋯` 菜单同版式（`Menu.module.css`：卡片 `padding:4`、`radius-lg`、
`elevation-prominent`、`surface-fill` + `blur(40px) saturate(150%)`；行 `min-height:34`、`6px 8px`、
`gap:6`、`13/20`；图标 14px，路径照搬 `copy-outline` / `download-outline`）：

| 项 | 行为 |
| --- | --- |
| 复制会话为 Markdown | 只走转发路由 `GET /api/remote-peers/markdown?id=<peer>&sessionId=<sid>`：Markdown 由对端 Host 的 `GET /api/session.markdown` 用 `formatSessionMarkdown` 生成，本机不做任何本地拼装；失败即「无法读取 Session 进行复制，请重试」。写剪贴板用 `ClipboardItem` 延迟写（保住点击激活），成功弹 toast「Session 已复制为 Markdown」 |
| 下载 Session 日志 | 与「+」菜单的「下载日志」**是同一个功能**：原生两处都落到 `sessionLogDownload.download(sessionId)` → `GET /api/session.export` ZIP；这里复用同一个 `downloadExport()`（本机转发对端 ZIP，不本地生成） |

未实现（按要求不做）：在应用中打开（`ui-open-in-app`）、反馈（`ui-message-feedback`）。

### 文件卡片与右侧预览

卡片数据来自工具调用 `present` 的参数（`{files:[{path, description}]}`），按 `turn/end` 落到该 turn
的正文尾部（原生 turn-tail 位置）；版式照 `PresentedFileCard.tsx` / `Deliverables.module.css`：
60px 高、`padding:8px 10px`、`gap:10`、`0.5px` l1 描边、`radius-lg`、卡底 `card-fill`，图标块 40×40
（`radius:10`、`card-tile-fill`、`FileTypeIcon` 20px），名称 13/20 500，描述 10/16 三级色（hover 换
「在侧边栏预览」），单卡 1 列、多卡 2 列（容器 <620px 折成一列）。相对路径按该会话 `cwd` 解析。

点卡片 → 右栏预览页签（`PreviewFrame` / `TextPreview` 版式：38px 页签条 + 38px 路径行 + 正文）：

| 类型 | 数据通道 | 渲染 |
| --- | --- | --- |
| png/jpg/gif/webp… | `/api/remote-peers/file?id&path` | 图片按宽度缩放（`bg-document-preview` 底） |
| txt / 其它文本 | `workspaceFiles/read`（`workspaceFileScopeId` = sessionId，`range:{offset:0,limit:4000}`） | 等宽逐行，8px 文档内边距、每行 10px 缩进 |
| csv / tsv | 同上 | `A1` + `fx` 工具条、A/B/C… 列标、行号、网格、底部 `CSV` / `100%` |
| md | 同上 | 原生 `MarkdownText`（表格、代码、列表），`pathImages` 把相对图片解析到转发 URL |

路径行右侧与原生一致：刷新、打开、显示文件位置（下载走 `download=1`）。
卡片右侧是原生分段按钮（`ui-open-in-app` 的 28px 图标格 + 0.5px 分隔 + 20px caret，24px 高、
`radius-md` 发丝描边）：**主按钮是「打开」**（图标 `IconRightUpOutlineRegular`，原生在有应用关联时
就是这个箭头而不是文件夹），caret 菜单只有「显示文件位置」一项。**应用列表不做**（对端的应用清单
没有远程入口，原生在这种情况下也会退化成定位）。

**动作发生在本机，不是对端。** 对端的 `session/openWorkspacePath` 是在对端桌面上起窗口 —— 用户
在 A 机看 B 机会话时，B 机弹出记事本等于「点了没反应」。所以走本机通道 `open-local`：
`/api/file?path=` 把字节拉回 `stateDir/open/<uuid>/<basename>`，再交给系统：`open` 用
`cmd /d /s /c start "" "<file>"`（按文件关联，zip/md/docx 一样），`reveal` 用
`explorer.exe /select,"<file>"`（macOS `open -R`、Linux `xdg-open <目录>`）。回执在会话页底部
（绿底 `已在本机打开 …`，失败红字），因为窗口在别人的屏幕上，本机必须有可见反馈。

请求形状（实测）：`open-local` 的入参 `{ id, path, action? }`，`action: 'reveal'` 只定位。
对端 `/api/file` 带 `x-dsh-lan-token` 可取字节（README.md 实测 10,756 B、`text/markdown`）；
对端 `session/openWorkspacePath` 直接调也返回 `{"opened":true}`（可用于核对对端是否可用）。

**位置要求**：`openPeerPath` 这个 `const` 必须写在会话页那条提前 `return renderConversation()`
之前。会话页走早退分支，晚定义的 `const` 在该次渲染里从未初始化，点击时才会抛
`Cannot access ... before initialization`，表现就是「按钮点了没反应」。
打开失败时在会话页贴一条 toast（`openErrorToast`），并把「路径」页作为兜底打开。
助手 Markdown 里也注入了原生 `MarkdownText` 的 `pathImages` / `fileMentions` 解析器：
本地图片换成转发 URL，路径形态的行内代码变成可点开预览的 chip。路径文本本身保持对端原样。

正文图片走**字节转发 + `blob:` URL**，而不是直接把转发路由的相对地址交给渲染器：原生
`MarkdownText` 的 `pathImages` 只接受绝对 URL（`http:`/`https:`/`blob:`/`data:` 或
`dsh-app://app/api/file?` 这三条桌面媒体路由），`/api/remote-peers/file?…` 这种相对地址会被判成
「无词表」并退回 alt 文本（表现为正文只剩图片说明）。因此 `ensureRemoteImage()` 先用同一个转发路由
`fetch` 回对端字节，转成 `blob:` URL 再交给 `pathImages`；同一路径只取一次（`imagePendingRef` 去重），
换对端或离开面板时统一 `revokeObjectURL`。取不到字节时仍保留 alt 文本，与原生同一套兜底。

图片还包在原生 `MarkdownDelegateProvider` 里（`fileImages` = 本机 `resolve` + 文案 +
空拖拽实现）：原生 `MarkdownText` 只有拿到这份委托才会把图包成 `button.imageButton`
（`cursor: zoom-in`、`title`/`aria-label` = 「打开原图」），点击走原生 `ImageLightbox`
（全屏遮罩 + 右上关闭 + Esc 关闭 + 关闭后焦点回落）。拖动图片不接管（`prepare.start` 返回 false），
点了照常开原图。

同一份委托还提供 `openFile`：原生 `MarkdownFileLink` 在没有 `openFile` 时只吐纯文本（正文里的
`[README.md](…)` 看不出是链接、点了没反应），有它才渲染成 `button.fileMention.fileLink`
（按扩展名取图标、原生 hover 下划线、`title` = 对端全路径），点击即 `openFilePreview({ path })`
打开右侧预览面板。行号（`options.line`）本机预览不定位，直接忽略。

**正文里的行内代码只在原生的范围内解析**（`markdownResolvers(turn)`）。原生把行内代码变成文件芯片
靠 `chatFileMentions.forClosing` → `producedFileMentions`：候选项只有该轮「产出/呈现」的文件
（成功结算的 `write`/`edit`/`patch`/`apply`/`str_replace` 调用 + present 卡片，外加这些工具调用的
**字面参数路径**），匹配规则是 `path === token`、`basename(path) === token`，唯一命中才取。
因此裸文件名（`set-01.png`、`README.md`）能解析，而普通路径形态（没被产出的目录名
`doubao_out/jesus-10/`、模板名 `image_raw.png`）保持内联代码——原生本来就这样，不要一律当链接。
`pathImages` 同理只认绝对路径（原生 `localPathMediaUrl` 走 `isAbsoluteWorkspacePath`），相对图片路径仍是 alt。

目录路径（带尾斜杠、且确实出现在 Markdown 链接里，例如 `[目录](doubao_out/jesus-10/)`）原生
`parseFileLink` 不排除，`openFile` 交给侧栏按地址挑视图，目录得到文件夹列表。本机复刻用对端
`workspaceFiles/list`（网关参数 `{ workspaceFileScopeId: <sessionId>, path }`，wire 上必须叫
`workspaceFileScopeId`，写 `workspaceFileScope` 会 `gateway/arguments-invalid`），在右侧面板渲染
名称 + 大小的列表：点目录继续下钻、点文件按文件预览打开。若 `workspaceFiles/read` 报
「is a directory」自动退到同一条列表，不再甩红字。

改动卡片只保留「已编辑 N 个文件」+ 文件行 + hover 的「在侧边栏预览」，不再显示 `+/-`：真实数字
来自对端 `git diff-tree --numstat`（`workspace-changes/recorder.ts`，只存在内存），历史轮次取不到时
只能按工具参数行数估算，误差不可控，索性不显示。因此 `deriveChanges()` 只记「本轮改了哪些文件」：
`mutationPathOf()` 从写盘类工具参数取路径，成功的 `tool/result` 用 `meta.path` 归一到绝对路径。

### 权限预设（可切换）

输入框左下角是与原生一致的三档下拉（盾牌图标 + 右侧勾选）：

- 当前值：最近一次 `permission/preset` 事件（`read-only` / `workspace-write` / `danger-full-access`），
  按宿主文案显示为「仅可查看 / 工作区内修改 / 完全权限」；
- 候选清单：`POST /api/permissionPresets/catalog`（`{args:{}}`）；
- 切换：`POST /api/commands/execute`，payload
  `{args:{agentId:<sessionId>, line:"/permission <preset>", submittedAttachments:[]}}`，
  返回 `value.result.kind === 'success'` 才算成功（实测 `preset read-only` → 再切回 `workspace-write` 均通过，
  会话里出现 `permission/preset` + `command/run` + `command/done`）。
- **注意**：必须走 `commands/execute`；把 `/permission ...` 塞进 `session/prompt` 只会变成一条普通用户消息。
- `danger-full-access` 在原生 UI 上要过一次风险确认，这里同样复刻：居中弹窗（警示图标 + 标题
  「确认启用完全权限？」+ 说明文案 + 勾选「我已了解风险，并愿意继续」+ 取消/启用），
  **不勾选时确认按钮禁用**，勾选后才提交 `commands/execute`。
- 对端会话必须是活的 Agent（`agentId` 能解析到 Agent）；冷会话会由宿主按需要恢复。

### 模型与推理等级（会写到对端）

输入框右下角的 `模型 + 推理等级` 是可用的真实选择器：

- 模型列表来自 `POST /api/session/modelCatalog`（`{args:{}}`）；
- 点模型或推理等级 → `POST /api/session/selectModel`，payload `{args:{request:{sessionId, provider, model, reasoningEffort}}}`
- 改的是**对端会话的真实选择**，对端界面刷新后同样生效；宿主还会顺手把它存成对端默认模型。

## 审批 / 提问回传

对端要审批时（`approval/policy: ask`），面板顶部会弹出审批卡片。通道是 Gateway 的
forwarded-event，不是 Remote 流式端点：

- 订阅：`GET /remote-peers/stream?endpoint=$events&payload={"args":{}}`
  （SSE；首帧 `{type:'ready', clientId}`，随后 `{type:'waterfall', event, eventId, request}`
  / `{type:'emit', ...}` / `{type:'cancel', eventId}`）
- 应答：`POST /api/$events/result`，envelope 内 `payload.args = {clientId, eventId, outcome}`
  - 审批：`outcome = {kind:'result', value:'allowed-once' | 'rejected' | 'cancelled' | 'unavailable'}`
  - 不接管：`outcome = {kind:'next'}`
- 约束：应答必须来自**同一个 Peer**（本插件只有一个 Peer 实例，天然满足），
  且 Peer 需 `interactions:'answer'` 与 owner principal。

实测（`sdk-test-20261124-a`）：`approval/asked`(seq107) → 回传 `allowed-once` →
`approval/decided`(seq108) → `tool/result`。`user-questions/request` 也会作为 waterfall 到达，
面板当前只给「跳过（交给下一个处理器）」，结构化问答应答尚未做。

## 已知边界

- 只做局域网，不做跨端隧道。
- 重载时旧实例可能仍占着 `/remote-peers` 通道与 `/api/remote-peers/stream` 路由：注册失败会退避重试
  （最多 12 次 ×250ms）并写 `apply.log` 的 `rpc retry n` / `fetch retry n`。
  若面板出现 `transport failure for /remote-peers/status: HTTP 405`，通常就是宿主侧 apply 没走完——
  先看 `apply.log` 是否停在 `before listen`。
- `user-questions/request` 只能跳过，不能代为作答。

- 对端文件预览、终端等路径类入口在本地无意义，面板不提供。
- v1 面板自成一页，不接管本地侧栏的「工作空间」区域（那是一个 single 占位的插槽，
  接管就等于替换掉本地会话列表）。
- `stateDir/apply.log` 是挂载埋点（每次热重载追加一行），排障用。

## PDF / Word / Excel / PPT 预览：复刻主体的渲染链

原生 `ui-sidebar-documentpreview` 的做法分成两段，本插件按同样分段复刻：

1. **转换在 Host**：`officeKit/render(workspaceFileScopeId, path, priority)` 用 LibreOffice Kit 把
   `doc/docx/xls/xlsx/ppt/pptx` 转成 PDF 字节（`RenderedDocumentBytes`，带 `version`/`missingFonts`/
   `generation`）。对端网关是同一个 `/api` 通道，所以直接 `POST /api/officeKit/render` 即可（实测
   `sample_files/01_产品需求说明书.docx` → 200 multipart，抽出片段是 `%PDF-1.7` 227,451 B）。
   Host 侧新路由 `GET /api/remote-peers/office?id&sessionId&path` 负责转发并按 `content-type` 的
   boundary 取出第一个二进制片段，回 `application/pdf`（不落盘、不经过 JSON）。
2. **渲染在 Client**：与原生同一版本 pdfjs（6.3.289）。库与 Worker 不从 CDN 取，改为插件自带
   `vendor/pdfjs/{pdf.min.mjs, pdf.worker.min.mjs}`（从仓库 `packages/client/ui-sidebar-documentpreview/
   node_modules/pdfjs-dist/build` 复制），由 `GET /api/remote-peers/asset?name=…` 提供，渲染器用
   `import()` 取库、`new Worker(url, { type: 'module' })` 当 `GlobalWorkerOptions.workerPort`。

`PdfPreview`（模块作用域，位置稳定，避免父组件每次 render 都换组件类型导致重挂）负责：取字节
（`file`/`office` 两条转发路由都行）、`getDocument`、逐页 canvas、缩放（`zoom` 百分比，初值按容器
宽度算）、页码跟随滚动、旋转 90°、适应宽度、下载；工具条外观对齐主体的 `pdfBar`。

**为什么不再用 `<iframe>`**：iframe 里是 Chromium/PDFium 的内置阅读器，会带自己的深色工具栏、左侧
缩略页、系统主题配色，样式不受控，和主体的 pdfjs 自绘观感差得远——`#toolbar=0` 一类 open 参数只能
去掉一部分 chrome。

## 各格式预览对照（只做预览，不做编辑）

| 扩展名 | 主体做法 | 插件现状 |
|---|---|---|
| png/jpg/jpeg/gif/webp/bmp/ico/svg | `bytes-complete` + 缩放视口（适应宽度/固定比例/拖拽） | `ImagePreview`：适应宽度、±10%、1:1、Ctrl+滚轮缩放、下载 |
| pdf | pdfjs 6.3.289 + 文本层 | `PdfPreview`：pdfjs canvas、页码、缩放、旋转、下载 |
| doc/docx/ppt/pptx | `officeKit` 转 PDF → pdfjs | 同链路：`/api/remote-peers/office` 取 PDF → `PdfPreview` |
| xls/xlsx | 客户端 `exceljs` + fortune-sheet 网格 | `ExcelPreview`：插件自带 SheetJS `vendor/xlsx/xlsx.mjs`，列标 + 行号 + 列宽 + 底部 Sheet 页签，只读 |
| csv/tsv | 同一套表格外观（A1/fx/列标/行号） | 自绘 `renderCsvBody`（保持原实现） |
| md/markdown | 原生 MarkdownText | 原生 MarkdownText（同渲染器） |
| code（`CODE_HIGHLIGHT_EXTENSIONS`） | shiki 语法高亮 + 行号 | 用原生 MarkdownText 的围栏代码块渲染（同一高亮引擎 + 复制工具条）；语言映射逐条照抄 `packages/util/code-language` |
| txt/log/其它纯文本 | 分页读取 + 行号 | 分页读取（`workspaceFiles/read`，4000 行），逐行渲染 |
| html/htm | `bytes-complete` + 沙箱渲染 | `srcDoc` + `sandbox="allow-scripts allow-popups allow-forms"`（无宿主同源权限） |
| mp4/webm/mov/m4v/ogv/mkv/avi | 原生不提供 | 插件加做：`<video controls>` 直连转发路由 |
| mp3/wav/m4a/flac/ogg/aac/opus | 原生不提供 | 插件加做：`<audio controls>` |
| 其余不识别容器（zip 等） | `TextPreview` 的 unsupported 空态（36px 灰化图标 + 「该格式文件暂时无法预览」 + 「打开」） | 同款空态 + 分段「打开」按钮（主格 = 本机打开，caret = 「显示文件位置」→ 路径页） |

所有渲染库都不出宿主：`GET /api/remote-peers/asset?name=pdf.min.mjs|pdf.worker.min.mjs|xlsx.mjs`
从插件目录 `vendor/` 读取并限白名单返回。
