/** 纯样式层：滚动条皮肤、设计令牌与整张 `styles` 表（不依赖 React，也不读任何运行时状态）。 */
/** 滚动条皮肤（动态类 CSS 做不到 ::-webkit-scrollbar，只能注入一条只作用于本插件容器的样式）： 5px 宽、透明轨道、`scrollbar-bg-l1` 圆角拇指、hover 换 `scrollbar-hover-l1` —— 与 ui-theme `scrollbar.css` 同值。刻意... */
export const SCROLL_SKIN = [
  '[data-remote-peers-scroll], [data-remote-peers-scroll] * { --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l1, #e5e5e5);'
  + ' --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l1, #d0d0d0); }',
  '[data-remote-peers-scroll]::-webkit-scrollbar, [data-remote-peers-scroll] *::-webkit-scrollbar { width: 5px; height: 5px; }',
  '[data-remote-peers-scroll]::-webkit-scrollbar-track, [data-remote-peers-scroll] *::-webkit-scrollbar-track { margin: 2px; background: transparent; }',
  '[data-remote-peers-scroll]::-webkit-scrollbar-thumb, [data-remote-peers-scroll] *::-webkit-scrollbar-thumb { border: 0 solid transparent;'
  + ' border-radius: 999px; corner-shape: round; background: var(--dsh-scrollbar-thumb); background-clip: content-box; }',
  '[data-remote-peers-scroll]::-webkit-scrollbar-thumb:hover, [data-remote-peers-scroll] *::-webkit-scrollbar-thumb:hover {'
  + ' background-color: var(--dsh-scrollbar-thumb-hover); }',
  '[data-remote-peers-scroll]::-webkit-scrollbar-corner, [data-remote-peers-scroll] *::-webkit-scrollbar-corner { background: transparent; }',
  /* 面板工具钮 hover：原生 `.tool:hover` */
  '[data-rp-tool]:hover { color: var(--dsw-alias-label-primary, inherit);'
  + ' background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.06)); }',
  /* 页签关闭钮 hover：原生 `.tabClose:hover` */
  '[data-rp-tab-close]:hover { color: var(--dsw-alias-label-primary, inherit);'
  + ' background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.06)); }',
  /* 改动卡片：header/行/折叠条的 hover，以及 hover 时统计换成「在侧边栏预览」 */
  '[data-rp-change-row]:hover, [data-rp-change-toggle]:hover {'
  + ' background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.06)); }',
  '[data-rp-change-header]:hover { background: var(--dsw-alias-card-fill-hover, #f2f3f5); }',
  '[data-rp-change-header]:hover [data-rp-change-hint] { display: inline; }',
  /* 会话树行：hover 全部交给 CSS（原生就是 `:hover`）。行在指针底下被移除/插入时，浏览器会把 hover
     直接交给现在占位的行；用 React 的 hover 状态则收不到 mouseenter（鼠标没动），会出现「上面一行
     被归档后消失，下一行不亮而浮在里层的按钮还在」的错位。 */
  '[data-rp-row="session"]:hover, [data-rp-row="folder"][data-rp-open="true"], [data-rp-row="session"][data-rp-open="true"] { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.04)); }',
  '[data-rp-row] [data-rp-actions] { display: none; }',
  '[data-rp-row] [data-rp-resting] { display: inline-flex; }',
  '[data-rp-row]:hover [data-rp-actions], [data-rp-row][data-rp-open="true"] [data-rp-actions] { display: inline-flex; }',
  '[data-rp-row]:hover [data-rp-resting], [data-rp-row][data-rp-open="true"] [data-rp-resting] { display: none; }',
  '[data-rp-row] [data-rp-folder-icon] { display: inline-flex; }',
  '[data-rp-row] [data-rp-chevron] { display: none; }',
  '[data-rp-row]:hover [data-rp-folder-icon] { display: none; }',
  '[data-rp-row]:hover [data-rp-chevron] { display: inline-flex; }',
  /* 会话清单整块不可选中（原生左栏的行与标题就是 `user-select: none`），输入框仍按文本处理 */
  '[data-rp-tree] { -webkit-user-select: none; user-select: none; }',
  '[data-rp-tree] input, [data-rp-tree] textarea { -webkit-user-select: text; user-select: text; }',
  /* 草稿占位：原生 InputBar `.placeholder` 的 `label-caption`（figma 34:10434 = #ADB2B8 亮 / #81858C 暗），
     浏览器默认占位色比它深一档，字形看着也更实。 */
  '.rp-composer-input::placeholder { color: var(--dsw-alias-label-caption, #ADB2B8); opacity: 1; }',
  /* 文档加载指示器：原生 `StateDot` ongoing 的 1.5s 旋转 + 描边呼吸（同一条周期） */
  '@keyframes dsh-rp-spin { to { transform: rotate(360deg); } }',
  /* 待发附件上传中：原生 `.progressBar` 的 1.2s 往返扫条（缩略图与文件卡共用） */
  '@keyframes dsh-rp-upload { from { transform: translateX(-70%); } to { transform: translateX(220%); } }',
  '@keyframes dsh-rp-dash { 0% { stroke-dasharray: 12 150; stroke-dashoffset: 0; }'
  + ' 50% { stroke-dasharray: 24 150; stroke-dashoffset: -6; }'
  + ' 100% { stroke-dasharray: 12 150; stroke-dashoffset: 0; } }',
  /* 轮次导航：竖轨隐藏滚动条（原生 `.scroller::-webkit-scrollbar { display: none }`） */
  '[data-rp-turn-rail]::-webkit-scrollbar { display: none; }',
  '@keyframes dsh-rp-turn-preview-in { from { opacity: 0; transform: translateX(4px); }'
  + ' to { opacity: 1; transform: translateX(0); } }',
  /* 复制成功的回执：按钮底色淡入 + 轻微弹一下 */
  '@keyframes dsh-rp-copied { 0% { transform: scale(0.92); } 60% { transform: scale(1.04); }'
  + ' 100% { transform: scale(1); } }',
  /* 思考行：hover 时图标让位给 chevron（原生 `.iconIdle` / `.chevronHover`） */
  '[data-rp-think-row]:hover { color: var(--dsw-alias-label-secondary, #4b5563); }',
  '[data-rp-think-row]:hover [data-rp-think-icon] { opacity: 0; }',
  '[data-rp-think-row]:hover [data-rp-think-chevron] { opacity: 1; }',
  /* 文字 shimmer 扫过（原生 `TextShimmer` 的两条反向关键帧，这里只做遮罩副本） */
  '@keyframes dsh-rp-shimmer { 0% { transform: translateX(-100%); }'
  + ' 66.6667%, 100% { transform: translateX(100%); } }',

].join('\n')

/** 样式里复用最多的设计令牌：同一 var 的同一 fallback 只写一次。 */
export const T = {
  ter: 'var(--dsw-alias-label-tertiary, #9aa0a6)',
  pri: 'var(--dsw-alias-label-primary, inherit)',
  sec: 'var(--dsw-alias-label-secondary, inherit)',
  /* 菜单项 hover 底色：常规一档、叠在卡片上再深一点的一档 */
  hover: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.04))',
  hoverStrong: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))',
  radiusMd: 'var(--dsw-radius-md, 8px)',
  radiusSm8: 'var(--dsw-radius-sm, 8px)',
  radiusLg10: 'var(--dsw-radius-lg, 10px)',
  menuBlur: 'var(--dsw-menu-backdrop-filter, blur(40px) saturate(150%))',
  elevationProminent: 'var(--dsw-elevation-prominent, 0 12px 32px rgba(0,0,0,0.16))',
}
export const styles = {
  page: { height: '100%', overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 },
  card: { border: '1px solid var(--dsh-border, #e5e5e5)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 },
  title: { fontSize: 15, fontWeight: 600, margin: 0 },
  row: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5 },
  muted: { opacity: 0.65, fontSize: 12.5 },
  button: { border: '1px solid var(--dsh-border, #d8d8d8)', background: 'transparent', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  /* 列表里的动作钮：四颗同宽同高，文案再长（「检测中」+ 转圈）也塞得下，列宽不再被挤。 */
  tableAction: { boxSizing: 'border-box', width: 66, height: 28, padding: 0, border: '1px solid var(--dsh-border, #d8d8d8)', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontSize: 13, textAlign: 'center', whiteSpace: 'nowrap' },
  tableActions: { display: 'inline-flex', alignItems: 'center', gap: 8 },
  /* 状态列定宽：在线 ↔ 不可用：<原因> 切换时不再让整张表重排；过长原因省略，全文挂 title。 */
  statusCell: { width: 200, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' },
  primary: { border: '1px solid transparent', background: 'var(--dsh-accent, #1f6feb)', color: '#fff', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 13 },
  /** 按钮内「转圈 + 文案」的横向排布。 */
  buttonBusy: { display: 'inline-flex', alignItems: 'center', gap: 5 },
  /** 复制成功回执：绿色文字 + 弹一下。 */
  buttonCopied: { border: '1px solid var(--dsw-alias-state-success-border, #bfe3c6)', background: 'var(--dsw-alias-state-success-fill, #eaf7ec)', color: '#1a7f37', borderRadius: 8, padding: '5px 12px', cursor: 'default', fontSize: 13, animation: 'dsh-rp-copied 260ms ease-out', transformOrigin: 'center' },
  input: { border: '1px solid var(--dsh-border, #d8d8d8)', background: 'transparent', borderRadius: 8, padding: '5px 9px', fontSize: 13, minWidth: 0 },
  /** 必填未填：输入框描边转红（不打断输入）。 */
  inputInvalid: { border: '1px solid #c0392b' },
  /** 必填标记（原生表单也只在标签后加 *）。 */
  fieldRequired: { marginLeft: 2, color: '#c0392b' },
  /** 流式区：思考行 + 正文，块间 16px（原生 `AssistantMarkdown` 的 `.body` gap）。 */
  liveFlow: { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 },
  /** 本轮进行中的状态行（「正在分析请求」）：24px 行、16px 图标位、gap 6，与思考行同规格。 */
  liveStatusRow: { display: 'flex', alignItems: 'center', gap: 6, height: 24, minWidth: 0, overflow: 'hidden', color: 'var(--dsw-alias-label-tertiary, #8a8f98)', fontSize: 13, lineHeight: '24px' },
  liveStatusIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', width: 16, height: 16, color: 'inherit' },
  /** 思考折叠行（原生 `ReasoningRow` + `DisclosureRow`：24px 行、16px 图标框、gap 6）。 */
  thinkRoot: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  thinkRow: { display: 'flex', alignItems: 'center', width: '100%', height: 24, minWidth: 0, overflow: 'hidden', padding: 0, border: 'none', background: 'transparent', color: 'var(--dsw-alias-label-tertiary, #8a8f98)', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', cursor: 'pointer' },
  thinkLeading: { position: 'relative', flex: 'none', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 6, color: 'inherit' },
  thinkIconIdle: { display: 'inline-flex', transition: 'opacity 100ms ease' },
  thinkChevron: { position: 'absolute', inset: 0, margin: 'auto', opacity: 0, transition: 'opacity 100ms ease', display: 'block' },
  thinkTitle: { flex: 'none', fontSize: 13, lineHeight: '24px', fontWeight: 400, color: 'inherit' },
  thinkSeparator: { flex: 'none', width: 2, height: 2, margin: '0 8px', borderRadius: 1, background: 'var(--dsw-alias-label-caption, #b9bec8)' },
  thinkSummary: { minWidth: 0, overflow: 'hidden', flex: '1 1 auto', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap', color: 'inherit' },
  /** 流式中：右端 48px 渐隐、不省略（原生 `.summary[data-streaming]`）。 */
  thinkSummaryStreaming: { minWidth: 0, overflow: 'visible', flex: '1 1 auto', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap', color: 'inherit', maskImage: 'linear-gradient(to right, black calc(100% - 48px), transparent)', WebkitMaskImage: 'linear-gradient(to right, black calc(100% - 48px), transparent)' },
  thinkSummaryText: { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' },
  thinkBody: { padding: '4px 0 4px 22px', minWidth: 0, color: 'var(--dsw-alias-label-secondary, #4b5563)' },
  /** 思考行的 shimmer（原生 `TextShimmer`：底稿 + 一道扫过的遮罩副本）。 */
  shimmerRoot: { position: 'relative', display: 'inline-grid', maxWidth: '100%', minWidth: 0, verticalAlign: 'top' },
  shimmerContent: { display: 'flex', alignItems: 'center', minWidth: 0 },
  shimmerDecoration: { position: 'absolute', inset: 0, overflow: 'clip', pointerEvents: 'none', userSelect: 'none' },
  shimmerSweep: { position: 'absolute', inset: 0, overflow: 'hidden', color: 'var(--dsw-alias-label-shimmer, #c3c8d1)', maskImage: 'linear-gradient(105deg, transparent 0%, black 40% 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(105deg, transparent 0%, black 40% 60%, transparent 100%)', transform: 'translateX(-100%)', animation: 'dsh-rp-shimmer 1.5s steps(48, end) 0.3s infinite' },
  /** 局域网地址：逐条排开，每条后面跟一个复制图标。 */
  addressList: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: 6, minWidth: 0 },
  addressChip: { display: 'inline-flex', alignItems: 'center', gap: 2, minWidth: 0 },
  addressCopy: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, padding: 0, border: 'none', borderRadius: 6, background: 'transparent', color: T.ter, cursor: 'pointer', lineHeight: 1 },
  addressCopyDone: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, padding: 0, border: 'none', borderRadius: 6, background: 'transparent', color: '#1a7f37', cursor: 'default', lineHeight: 1, animation: 'dsh-rp-copied 260ms ease-out', transformOrigin: 'center' },
  error: { color: '#c0392b', fontSize: 12.5 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', fontWeight: 500, opacity: 0.6, padding: '6px 8px', borderBottom: '1px solid var(--dsh-border, #e5e5e5)' },
  td: { padding: '6px 8px', borderBottom: '1px solid var(--dsh-border-weak, #f0f0f0)' },
  /* 会话树（照原生左栏「工作区 → 会话」的形状：文件夹行 + 缩进会话行 + 右侧相对时间） */
  sessionTree: { display: 'flex', flexDirection: 'column', gap: 1 },
  /* 图标 SVG 的公共外形：16 视图框、lex:none、随文字色（50 处重复的 prop 对象收敛到这里） */
  iconBox: { viewBox: '0 0 16 16', style: { flex: 'none', display: 'block', color: 'inherit' } },
  /* 行本体：原生 `.projectRow`/`.sessionRow` —— 32px、0 8px、md 圆角、gap 6 */
  sessionTreeRow: { display: 'flex', alignItems: 'center', gap: 6, boxSizing: 'border-box', width: '100%', height: 32, margin: 0, padding: '0 8px', border: 0, borderRadius: 'var(--dsw-radius-md, 8px)', color: 'inherit', font: 'inherit', textAlign: 'left', cursor: 'pointer' },
  /* 前导槽：原生 `.slot` —— 16×20 居中，常态放文件夹图标，hover 换成实心三角（`.projectRow:hover` 的 folder/chevron 互换） */
  treeLeadSlot: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 20, color: 'var(--dsw-alias-label-tertiary, #a6a9ae)' },
  sessionTreeLabel: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', fontSize: 14, lineHeight: '20px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  /* 已归档行留在原位、只降一档灰（原生 `.sessionRow.archived .title { color: label-caption }`） */
  sessionTreeLabelArchived: { color: 'var(--dsw-alias-label-caption, #ADB2B8)' },
  /* 置顶行的常驻标记：原生 `.pinIndicator` —— 16×20 居中、左 6、label-caption，不可点 */
  sessionTreePin: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 20, marginLeft: 6, color: 'var(--dsw-alias-label-caption, #ADB2B8)' },
  sessionTreeTime: { flex: 'none', fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary, #a6a9ae)' },
  /* 行内「⋯」字形：原生用的是 16px 图标，这里用等大的省略号字符版 */
  sessionTreeEllipsis: { fontSize: 15, lineHeight: 1, letterSpacing: 1 },
  /* 会话水位溢出钮：原生 `.sessionOverflowButton` —— 28 高、12 号 tertiary 文字、无底色、左对齐 */
  sessionOverflow: {
    width: '100%', height: 28, border: 'none', borderRadius: 6, background: 'transparent',
    textAlign: 'left', cursor: 'pointer', fontSize: 12, lineHeight: '28px',
    color: 'var(--dsw-alias-label-tertiary, #a6a9ae)',
  },
  /* 文件夹行右侧的新会话钮：原生 `.iconButton` —— 24×24 命中区（margin -4 压回 16）、14 图标、`label-tertiary`，hover 转 `label-primary` */
  sessionTreeAction: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, margin: -4, padding: 0, border: 0, borderRadius: 'var(--dsw-radius-xs, 4px)', background: 'transparent', color: 'var(--dsw-alias-label-tertiary, #a6a9ae)', cursor: 'pointer' },
  /* 工作区行/会话行 hover 时的动作列：原生 `.rowActions` —— 20 高、gap 13（两枚 -4 外边距的 24 钮叠出 ~5px 视觉间距）；display 交给 CSS 的 `[data-rp-actions]` */
  sessionTreeActions: { flex: 'none', alignItems: 'center', height: 20, gap: 13 },
  /* 会话行常态右位：原生 `.rowResting` —— 20 高、gap 6；display 交给 CSS 的 `[data-rp-resting]` */
  sessionTreeResting: { flex: 'none', alignItems: 'center', height: 20, gap: 6 },
  /* 工作区 ⋯ 菜单：原生 Menu `.list` —— 4 内距、144~360 宽、lg 圆角、prominent 阴影 */
  wsMenu: { position: 'fixed', zIndex: 1100, boxSizing: 'border-box', padding: 4, minWidth: 144, maxWidth: 360, borderRadius: 'var(--dsw-radius-lg, 10px)', background: 'var(--dsw-menu-surface-fill, rgba(252,253,254,0.7))', backdropFilter: T.menuBlur, WebkitBackdropFilter: T.menuBlur, boxShadow: T.elevationProminent },
  menuIconSlot: { display: 'inline-flex', flex: 'none', width: 14, justifyContent: 'center', color: 'inherit' },
  /* 重命名对话框：原生 Modal `.dialog`（380 宽、20 gap、底部 24）+ WorkspaceBrowser `.renameInput` */
  renameDialog: { boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20, width: 'min(380px, 100%)', padding: '0 0 24px', overflow: 'hidden', borderRadius: 'var(--dsw-radius-panel, 12px)', background: 'var(--dsw-alias-bg-layer-2, #fff)', boxShadow: T.elevationProminent },
  renameInput: { boxSizing: 'border-box', width: '100%', height: 44, padding: '7px 14px', border: '0.5px solid var(--dsw-alias-border-l4, #dcdde0)', borderRadius: 'var(--dsw-radius-lg, 12px)', outline: 'none', background: 'transparent', fontSize: 14, fontWeight: 400, lineHeight: '22px', color: T.pri },
  renameErrorText: { marginTop: 8, fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-state-error-primary, #d92d20)' },
  /* 面包屑的可点段：文字 + 下拉箭头，hover 浮出底色（原生 `.crumb`） */
  crumbButton: { display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: 220, padding: '4px 6px 4px 8px', border: 'none', borderRadius: 'var(--dsw-radius-sm, 6px)', background: 'transparent', color: T.sec, cursor: 'pointer', font: 'inherit', fontSize: 14, lineHeight: '20px' },
  crumbLabel: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  crumbCaret: { flex: 'none', display: 'inline-flex', color: T.ter },
  /* 面包屑分隔符：原生 `.crumbSep` —— 14px caption 灰 */
  crumbSep: { flex: 'none', padding: '0 2px', fontSize: 14, lineHeight: '20px', color: 'var(--dsw-alias-label-caption, #ADB2B8)' },
  // ── 会话页（照原生版式：通栏正文 + 右侧用户气泡 + 药丸输入框） ──
  conversationPage: { position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
  /** 会话页里的失败提示：原生用 toast 报告「打开失败」，这里贴底居中一条，不挡正文。 */
  openErrorToast: { position: 'absolute', zIndex: 6, left: '50%', bottom: 140, transform: 'translateX(-50%)', maxWidth: 'min(520px, 84%)', padding: '8px 14px', borderRadius: 10, background: 'var(--dsw-alias-toast-bg, rgba(32,34,38,0.92))', color: 'var(--dsw-alias-label-on-color, #fff)', fontSize: 13, lineHeight: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)', pointerEvents: 'none' },
  /* 头部整块：标题行 30px + 页签行 25px（margin-top 10），底边 0.5px l3 —— ConversationRoot `.header` */
  headerBlock: { flex: 'none', boxSizing: 'border-box', borderBottom: '0.5px solid var(--dsw-alias-border-l3, #e3e4e6)', background: 'var(--dsw-alias-bg-base, transparent)' },
  convHeader: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 30, padding: '10px 28px 0 20px' },
  /* Modal .close：28×28、sm 圆角、无边框、二级文字色 */
  ghostButton: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', borderRadius: 'var(--dsw-radius-sm, 6px)', background: 'transparent', color: T.sec, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 },
  /* 面包屑当前段：14/20、500、primary，padding 4px 8px —— `.crumbCurrent` */
  convTitle: { fontSize: 14, fontWeight: 500, lineHeight: '20px', padding: '4px 8px', maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  modeChip: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, lineHeight: '20px', color: T.ter, whiteSpace: 'nowrap' },
  /* 标题栏「⋯」：28×28 ghost 按钮，展开时浮层卡片锚在它下方右侧 */
  headerMoreButton: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', borderRadius: 'var(--dsw-radius-sm, 6px)', background: 'transparent', color: T.sec, cursor: 'pointer', fontSize: 15, opacity: 0.7, padding: 0 },
  /* 会话页返回钮：30×30 圆角图标钮，描边透明 → hover 才浮出底色与边线（比原来的文本 ← 明显） */
  convBack: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, marginLeft: -6, padding: 0, border: '0.5px solid transparent', borderRadius: 8, background: 'transparent', color: T.sec, cursor: 'pointer', transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease' },
  headerMoreWrap: { position: 'relative', flex: 'none', display: 'inline-flex' },
  /* 上下文菜单卡片：Menu.module.css `.list`（padding 4、radius-lg、elevation-prominent、l1 描边） */
  headerMenu: { position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 120, boxSizing: 'border-box', padding: 4, display: 'flex', flexDirection: 'column', minWidth: 196, maxWidth: 360, borderRadius: T.radiusLg10, background: 'var(--dsw-menu-surface-fill, rgba(255,255,255,0.72))', backdropFilter: T.menuBlur, WebkitBackdropFilter: T.menuBlur, boxShadow: 'var(--dsw-elevation-prominent, 0.5px 0 0 0 var(--dsw-alias-border-l1, #ececec), 0 12px 32px rgba(0,0,0,0.16))' },
  /* 行：Menu.module.css `.item` —— 34px 最小高、6px 8px、6px 间距、13/20 */
  headerMenuItem: { display: 'flex', alignItems: 'center', gap: 6, width: '100%', minHeight: 34, padding: '6px 8px', border: 'none', borderRadius: T.radiusMd, background: 'transparent', color: T.pri, cursor: 'pointer', fontSize: 13, lineHeight: '20px', textAlign: 'left' },
  headerMenuItemIcon: { display: 'inline-flex', flex: 'none', width: 14, height: 14, alignItems: 'center', justifyContent: 'center', color: 'var(--dsw-alias-menu-icon, #6f7377)' },
  headerMenuItemLabel: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  /* 分隔线：`.separator` —— 0.5px、margin 3px 8px、border-l2 */
  /* 复制结果 toast：shell.overlay 的浮层提示 */
  toastWrap: { position: 'absolute', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 200, padding: '8px 14px', borderRadius: T.radiusMd, background: 'var(--dsw-alias-bg-layer-3, rgba(30,30,30,0.86))', color: 'var(--dsw-alias-label-on-color, #fff)', fontSize: 13, lineHeight: '20px', boxShadow: T.elevationProminent },
  /* 页签行：25px 行高、10px 上距、8px 左内边距、32px 间距 —— ConversationRoot `.tabs` / `.viewTabs` / `.tab` */
  tabs: { display: 'flex', gap: 32, minHeight: 25, marginTop: 10, paddingLeft: 8, boxSizing: 'border-box' },
  tabActive: { position: 'relative', fontSize: 13, lineHeight: '16px', fontWeight: 500, color: 'var(--dsw-alias-state-business-primary, #1f6feb)', padding: '10px 10px 9px', marginTop: -10, borderBottom: '2px solid var(--dsw-alias-state-business-primary, #1f6feb)', cursor: 'default' },
  /* 正文滚动区：上下 16px、左右 = 输入卡留白 16 + 16 —— ChatView `.scroll` */
  convBody: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 32px', marginRight: 2, scrollbarGutter: 'stable' },
  /* 正文区（滚动区 + 右侧预览）整体 */
  bodyArea: { position: 'relative', flex: 1, minHeight: 0, display: 'flex', minWidth: 0 },
  /* 会话列本体：沉底按钮的定位上下文（只在左栏内，不跟着预览面板变宽） */
  chatPane: { position: 'relative', flex: '1 1 0', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' },
  /* 回到底部：ChatView `.toBottomSlot` / `.toBottom` 逐值 —— 34px 圆钮、floating-fill、panel 阴影、
     右边缘对齐消息列、距输入卡 16px */
  toBottom: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34,
    /* 槽高 0，靠 -34px 把圆钮整体抬到槽线上方 16px（原生 .toBottom 的 margin-top） */
    marginTop: -34,
    padding: 0, border: 0, borderRadius: 100, cornerShape: 'round',
    color: T.pri,
    background: 'var(--dsw-alias-button-floating-fill, #f1f2f4)',
    boxShadow: 'var(--dsw-elevation-panel, 0 0 0 0.5px var(--dsw-alias-border-l3, #e3e4e6), 0 4px 12px rgba(0,0,0,0.08))',
    cursor: 'pointer', pointerEvents: 'auto',
  },
  toBottomHover: { background: 'var(--dsw-alias-button-floating-hover, #e8eaec)' },
  /* 轮次导航：竖轨贴在会话列右侧 12px、垂直居中 —— TurnNavigator `.frame` */
  turnRailSlot: { position: 'absolute', top: 0, bottom: 0, right: 0, width: 48, pointerEvents: 'none', zIndex: 7 },
  turnRail: {
    position: 'absolute', top: '50%', right: 12, width: 28,
    transform: 'translateY(-50%)', overflowY: 'auto', overflowX: 'hidden',
    pointerEvents: 'auto', cursor: 'pointer', scrollbarWidth: 'none',
  },
  turnRailTrack: { position: 'relative', display: 'flex', flexDirection: 'column', padding: '6px 0' },
  turnRailMark: {
    position: 'relative', width: '100%', height: 10, padding: 0, border: 0,
    background: 'transparent', cursor: 'pointer', flex: 'none',
  },
  /* 刻度：20×2、右对齐、以右端为变换原点 */
  turnRailTick: {
    position: 'absolute', top: '50%', right: 0, width: 20, height: 2,
    borderRadius: 2, transformOrigin: 'right center',
    transition: 'transform 140ms ease, background-color 140ms ease',
  },
  /* 悬停预览卡：左移 10px、300px 宽、最多 100px 高 —— `.preview` */
  turnPreview: {
    position: 'absolute', right: 50, boxSizing: 'border-box', transition: 'top 140ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    width: 300, maxHeight: 100, overflow: 'hidden', padding: '10px 12px',
    borderRadius: 'var(--dsw-radius-lg, 16px)',
    color: 'var(--dsw-alias-label-primary, #1f2328)',
    background: 'var(--dsw-alias-bg-layer-1, #ffffff)',
    boxShadow: 'var(--dsw-elevation-panel, 0 0 0 0.5px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12))',
    pointerEvents: 'none', animation: 'dsh-rp-turn-preview-in 120ms ease-out',
  },
  turnPreviewPrompt: {
    display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1,
    overflow: 'hidden', fontSize: 13, fontWeight: 600, lineHeight: '20px',
  },
  turnPreviewResponse: {
    display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3,
    overflow: 'hidden', marginTop: 4, fontSize: 12, lineHeight: '18px',
    color: 'var(--dsw-alias-label-caption, #6b7280)',
  },
  /* 消息列：clamp(680px, 列宽 × 0.64, 920px)，与输入卡同一轴 —— `.column` */
  convColumn: { width: '100%', maxWidth: 'clamp(680px, 64%, 920px)', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 },
  /* 用户消息整体右对齐：气泡 + 6px 后的元信息行 —— MessageItem `.userRow` */
  userRow: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 0 },
  /* 历史边缘提示：居中一条 12px 药丸 —— ChatView `.older` / `.older button` */
  historyEdge: { display: 'flex', justifyContent: 'center', overflowAnchor: 'none' },
  historyEdgeButton: { display: 'grid', lineHeight: '18px', whiteSpace: 'nowrap', border: 'none', borderRadius: 'var(--dsw-radius-sm, 6px)', padding: '4px 12px', fontSize: 12, fontFamily: 'inherit', color: 'var(--dsw-alias-label-secondary, #4b5563)', background: 'var(--dsw-alias-interactive-bg-hover-solid, #f3f4f6)', cursor: 'pointer' },
  userStack: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 0, maxWidth: '70.2%' },
  /* 提问附件行：原生 `UserContent` 里附件在气泡上方、右对齐，图片 gap 10px。 */
  userAttachmentRow: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, maxWidth: '100%' },
  userImageGallery: { display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10, maxWidth: '100%' },
  userImageFrame: {
    boxSizing: 'border-box', display: 'grid', flex: '0 0 auto', placeItems: 'center',
    minWidth: 44, minHeight: 44, padding: 0, overflow: 'hidden', flexShrink: 0,
    border: '0.5px solid var(--dsw-alias-border-l2-darkmode-thin, #ececec)',
    borderRadius: 'var(--dsw-radius-xl, 16px)',
    background: 'var(--dsw-alias-interactive-bg-hover, #f5f5f7)',
  },
  userFileStack: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 },
  /* 图片灯箱：整屏半透明遮罩（仍能看见背后界面）+ 居中原图 + 右上角圆角按钮组 —— ImageLightbox */
  imageLightboxBackdrop: {
    position: 'fixed', zIndex: 1200, inset: 0, boxSizing: 'border-box',
    display: 'grid', placeItems: 'center', padding: 24,
    background: 'rgba(17, 19, 23, 0.55)', backdropFilter: 'blur(1.5px)',
  },
  imageLightboxImage: {
    maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', display: 'block',
    borderRadius: 'var(--dsw-radius-xl, 16px)', boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
    cursor: 'default',
  },
  imageLightboxTools: { position: 'fixed', top: 20, right: 20, display: 'flex', gap: 8 },
  imageLightboxTool: {
    boxSizing: 'border-box', display: 'grid', placeItems: 'center', width: 32, height: 32, padding: 0,
    border: '0.5px solid var(--dsw-alias-border-l1, #ececec)', borderRadius: T.radiusLg10,
    background: 'var(--dsw-alias-card-fill, #fff)', color: T.pri, fontSize: 15, fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)', cursor: 'pointer',
  },
  /* 提问里的文件卡：原生 `UserContent .fileCard` —— 240×64、0.5px l2 描边、lg 圆角、8/12 内距 */
  userFileCard: {
    boxSizing: 'border-box', display: 'inline-flex', flex: '0 0 240px', alignItems: 'center', gap: 10,
    width: 240, minHeight: 64, padding: '8px 12px',
    border: '0.5px solid var(--dsw-alias-border-l1, #ececec)', borderRadius: T.radiusLg10,
    background: 'var(--dsw-alias-card-fill, #fff)', color: T.pri,
  },
  userFileIcon: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, color: 'var(--dsw-alias-label-secondary, #55585f)' },
  userFileContent: { display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 },
  userFileName: { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--dsw-alias-label-primary, #1f2328)', fontSize: 14, fontWeight: 500, lineHeight: '22px' },
  userFileMeta: { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--dsw-alias-label-tertiary, #8f9399)', fontSize: 12, lineHeight: '15px' },
  userBubble: { maxWidth: '100%', background: 'var(--dsw-specific-bubble, #eef1f6)', borderRadius: 'var(--dsw-radius-xl, 16px)', padding: '10px 16px', fontSize: 14, lineHeight: '22px', color: T.pri, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  assistantBlock: { fontSize: 14, lineHeight: '24px', color: 'var(--dsw-alias-label-primary, #1f2328)' },
  /* 消息元信息行：28px 行、8px 间距 —— MessageIconActions `.actions` */
  msgActions: { display: 'flex', alignItems: 'center', gap: 8, height: 28 },
  msgAction: { boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 6, border: 'none', borderRadius: T.radiusSm8, background: 'transparent', color: T.ter, cursor: 'pointer' },
  msgActionIdle: { boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 6, border: 'none', borderRadius: T.radiusSm8, background: 'transparent', color: T.ter, cursor: 'default', opacity: 0.4 },
  /* 图标按钮外壳：给 tooltip 提供定位锚点 */
  iconActionWrap: { position: 'relative', display: 'inline-flex', flex: 'none' },
  /* 深色 tooltip：Tooltip.module.css `.bubble` 口径，side=bottom 偏移 6px 居中；fixed 绘制在内容之上 */
  iconTooltip: { position: 'fixed', transform: 'translateX(-50%)', zIndex: 1100, display: 'inline-flex', alignItems: 'center', boxSizing: 'border-box', width: 'max-content', padding: '3px 7px', borderRadius: T.radiusSm8, background: 'var(--dsw-alias-tooltip-bg, #2b2f36)', color: 'var(--dsw-alias-tooltip-label, #fff)', fontSize: 13, lineHeight: '20px', whiteSpace: 'nowrap', pointerEvents: 'none' },
  msgTime: { fontSize: 13, lineHeight: '24px', color: T.ter, whiteSpace: 'nowrap' },
  msgTimeEnd: { fontSize: 12, lineHeight: '24px', color: T.ter, whiteSpace: 'nowrap' },
  /* 助手尾部动作行：16px 上距、-6px 左缩进 —— AssistantMarkdown `.actions` */
  assistantActions: { display: 'flex', alignItems: 'center', gap: 8, height: 28, marginTop: 16, marginLeft: -6 },
  usagePill: { boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0, height: 28, padding: '6px 8px', border: 'none', borderRadius: T.radiusSm8, background: 'transparent', color: T.ter, fontSize: 12, lineHeight: '24px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', cursor: 'pointer' },
  usagePillHover: { background: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))' },
  /* 「本轮用量」浮层：stat-dialog `.panel` —— 16px 内边距、lg 圆角、菜单底 + 40px 模糊、prominent 阴影 */
  usageDialog: { position: 'fixed', zIndex: 1100, boxSizing: 'border-box', width: 'max-content', minWidth: 300, maxWidth: 440, padding: 16, border: '0', borderRadius: 'var(--dsw-radius-lg, 16px)', background: 'var(--dsw-specific-menu, rgba(255,255,255,0.9))', backdropFilter: T.menuBlur, WebkitBackdropFilter: T.menuBlur, boxShadow: T.elevationProminent, color: 'var(--dsw-alias-label-secondary, #5f6368)', fontSize: 12, lineHeight: '18px', maxHeight: 'calc(100vh - 24px)', overflowY: 'auto', cursor: 'default' },
  usageDialogTitle: { display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 8, color: T.pri, fontWeight: 500 },
  usageDialogTitleLabel: { display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 },
  usageDialogRule: { marginBottom: 10, borderTop: '0.5px solid var(--dsw-alias-border-l2, #e7e7e7)' },
  usageDialogDetails: { display: 'grid', gridTemplateColumns: 'minmax(76px, auto) minmax(0, 1fr)', gap: '6px 16px', margin: 0, color: T.ter },
  usageDialogDt: { minWidth: 0, margin: 0 },
  usageDialogDd: { minWidth: 0, margin: 0, color: 'var(--dsw-alias-label-secondary, #5f6368)', fontVariantNumeric: 'tabular-nums', textAlign: 'right', overflowWrap: 'anywhere' },
  /* turn 完成行：33px 高、8px 下内边距、0.5px l2 底边 —— TurnProcessNodeView `.root` */
  turnProcessRow: { display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', minWidth: 0, padding: '0 0 8px', border: 'none', borderBottom: '0.5px solid var(--dsw-alias-border-l2, #e7e7e7)', background: 'none', color: T.ter, font: 'inherit', fontSize: 14, lineHeight: '24px', textAlign: 'left', cursor: 'default' },
  turnProcessHeadLine: { display: 'flex', alignItems: 'center', height: 33, minWidth: 0 },
  turnProcessHead: { display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0, padding: 0, border: 'none', background: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer' },
  /* 展开后的第一层：分组行（可再点开一层）+ 第二层的逐步行 —— TurnProcessNodeView 明细 */
  processList: { display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0 10px' },
  processGroup: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, height: 30, padding: 0, border: 'none', background: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', textAlign: 'left' },
  processDetail: {
display: 'flex',
flexDirection: 'column',
gap: 2,
paddingLeft: 22,
paddingRight: 4,
// 原生 `ChatGroupSeat.module.css .body`：限高居内滚动，超高才出滚动条。
maxHeight: 'min(400px, 50vh)',
overflowY: 'auto',
overscrollBehaviorY: 'auto',
scrollbarGutter: 'stable',
  },
  processRow: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, height: 30, color: 'var(--dsw-alias-label-primary, #1f2328)', fontSize: 13, lineHeight: '20px' },
  processRowIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, flex: 'none', color: 'var(--dsw-alias-label-tertiary, #8a8f99)', fontSize: 11 },
  processRowLabel: { flex: 'none', color: 'var(--dsw-alias-label-secondary, #4b5563)', fontSize: 12, lineHeight: '20px' },
  processRowDot: { flex: 'none', color: 'var(--dsw-alias-label-tertiary, #8a8f99)', fontSize: 12 },
  processRowText: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--dsw-alias-label-secondary, #4b5563)', fontSize: 13 },
  heading: { fontSize: 15.5, fontWeight: 700, margin: '18px 0 8px' },
  bulletRow: { display: 'flex', gap: 8, marginBottom: 4 },
  code: { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5, background: 'var(--dsh-surface-weak, #f3f4f6)', borderRadius: 4, padding: '1px 5px' },
  /* ── present 卡片：Deliverables.module.css `.presented` / `.file` 逐值 ── */
  presentGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, minWidth: 0, marginTop: 4 },
  presentGridSingle: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10, minWidth: 0, marginTop: 4 },
  presentCard: {
    position: 'relative', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 10,
    minWidth: 0, height: 60, padding: '8px 10px', overflow: 'hidden',
    border: '0.5px solid var(--dsw-alias-border-l1, #ececec)',
    borderRadius: T.radiusLg10,
    background: 'var(--dsw-alias-card-fill, #f8f9fa)',
    color: T.pri,
    transition: 'background-color 120ms ease',
  },
  presentCardButton: { position: 'absolute', zIndex: 1, inset: 0, width: '100%', padding: 0, border: 0, borderRadius: 'inherit', background: 'transparent', cursor: 'pointer' },
  presentIcon: {
    position: 'relative', zIndex: 2, boxSizing: 'border-box', flex: '0 0 auto', display: 'grid', placeItems: 'center',
    width: 40, height: 40, overflow: 'hidden', pointerEvents: 'none',
    border: '0.5px solid var(--dsw-alias-border-l1, #ececec)', borderRadius: 10,
    background: 'var(--dsw-alias-card-tile-fill, #f1f3f5)', color: 'var(--dsw-alias-link, #1f6feb)',
  },
  presentBody: { position: 'relative', zIndex: 2, display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: 12, minWidth: 0, pointerEvents: 'none' },
  presentDetails: { display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 2, minWidth: 0 },
  presentName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500, lineHeight: '20px' },
  presentDesc: { overflow: 'hidden', color: T.ter, fontSize: 10, fontWeight: 400, lineHeight: '16px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  presentActions: { display: 'inline-flex', flex: 'none', pointerEvents: 'auto' },
  /* 卡片右侧分段按钮：原生 `ui-open-in-app` 的 图标 + caret 双格，24px 高、8px 圆角、发丝描边 */
  splitButton: { display: 'inline-flex', alignItems: 'stretch', flex: 'none', height: 24, border: '0.5px solid var(--dsw-alias-border-l2, #e3e4e6)', borderRadius: T.radiusMd, background: 'transparent', overflow: 'hidden' },
  /** 卡片里那排 12px 紧凑分段：按钮宽度由内容决定，不再固定 28。 */
  splitCompact: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'auto', minWidth: 0, border: 0, background: 'transparent', color: T.pri, cursor: 'pointer', padding: '0 9px', gap: 4, fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap' },
  /** 同上的「下载」格：多一层定位容器，用来贴底部 2px 进度线。 */
  splitCompactCell: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'auto', minWidth: 0, border: 0, background: 'transparent', color: T.pri, cursor: 'pointer', padding: '0 9px', gap: 4, fontSize: 12, lineHeight: '16px', whiteSpace: 'nowrap', position: 'relative', overflow: 'hidden' },
  /** 预览空态 / 路径页里 32px 的分段主格（打开、下载）。 */
  splitLarge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'auto', minWidth: 0, height: 32, border: 0, background: 'transparent', color: T.pri, cursor: 'pointer', padding: '0 14px', gap: 6, fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap' },
  splitDivider: { width: 0.5, flex: 'none', background: 'var(--dsw-alias-border-l2, #e3e4e6)' },
  splitCaret: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, border: 0, background: 'transparent', color: T.sec, cursor: 'pointer', padding: 0 },
  /* 「显示文件位置」菜单：同 Menu 卡片规格，浮在卡片之上（卡片自身 overflow:hidden，所以要 fixed 定位） */
  pathMenu: { position: 'fixed', zIndex: 220, boxSizing: 'border-box', padding: 4, minWidth: 188, borderRadius: T.radiusLg10, background: 'var(--dsw-menu-surface-fill, rgba(252,253,254,0.7))', backdropFilter: T.menuBlur, WebkitBackdropFilter: T.menuBlur, boxShadow: 'var(--dsw-elevation-prominent, 0.5px 0 0 0 var(--dsw-alias-border-l1, #ececec), 0 12px 32px rgba(0,0,0,0.16))' },
  pathMenuItem: { display: 'flex', alignItems: 'center', gap: 6, width: '100%', minHeight: 34, padding: '6px 8px', border: 'none', borderRadius: T.radiusMd, background: 'transparent', color: T.pri, cursor: 'pointer', fontSize: 13, lineHeight: '20px', textAlign: 'left' },
  /* 「视图选项」浮层里的分段标题、图标、勾选（与原生左栏那张菜单同规格） */
  viewMenuHead: { padding: '6px 10px 4px', fontSize: 12, lineHeight: '18px', color: T.ter },
  viewMenuIcon: { display: 'inline-flex', flex: 'none', width: 16, height: 16, alignItems: 'center', justifyContent: 'center', color: 'var(--dsw-alias-menu-icon, #6f7377)' },
  viewMenuCheck: { display: 'inline-flex', flex: 'none', width: 16, height: 16, alignItems: 'center', justifyContent: 'center', color: 'var(--dsw-alias-label-primary, #1f2329)' },
  viewMenuDivider: { height: 0.5, margin: '4px 6px', background: 'var(--dsw-alias-border-l2, #e3e4e6)' },
  /* 卡片标题右侧的图标钮：28×28，hover/激活给浅底（原生 `.tool` 同款） */
  ghostIconTool: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', width: 28, height: 28, padding: 0, border: 0, borderRadius: 6, background: 'transparent', color: T.sec, cursor: 'pointer' },
  ghostIconToolActive: { background: 'var(--dsw-alias-interactive-bg-hover, #f2f3f5)', color: T.pri },
  /* 会话搜索输入框：就地占工具条一段 240px / 28px 的方框（搜索图标 + 输入 + 清除） */
  sessionSearchField: { display: 'inline-flex', alignItems: 'center', gap: 6, flex: 'none', width: 240, height: 28, padding: '0 6px 0 8px', borderRadius: 8, border: '0.5px solid var(--dsw-alias-border-l2, #e3e4e6)', background: 'var(--dsw-alias-bg-base, #fff)' },
  sessionSearchIcon: { display: 'inline-flex', flex: 'none', color: T.ter },
  sessionSearchInput: { flex: 1, minWidth: 0, height: 26, padding: 0, border: 0, outline: 'none', background: 'transparent', color: T.pri, fontSize: 13, lineHeight: '20px', fontFamily: 'inherit' },
  sessionSearchClear: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', width: 20, height: 20, padding: 0, border: 0, borderRadius: 4, background: 'transparent', color: T.ter, cursor: 'pointer' },
  /* 远程端主界面头部：返回胶囊 + 标题 + 副标题 */
  peerPageHeader: { display: 'flex', flexDirection: 'column', gap: 10 },
  peerBackPill: { display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start', height: 32, padding: '0 14px 0 11px', border: '0.5px solid var(--dsw-alias-border-l2, #e3e4e6)', borderRadius: 8, background: 'var(--dsw-alias-bg-base, #fff)', color: T.pri, fontSize: 13, fontWeight: 500, lineHeight: '20px', cursor: 'pointer', transition: 'background-color 120ms ease, border-color 120ms ease' },
  peerTitle: { fontSize: 22, fontWeight: 600, lineHeight: '30px', margin: 0, color: T.pri },
  /* 卡片图标按钮的深色 tooltip（原生 hover 提示同款） */
  tooltipBox: { position: 'fixed', zIndex: 240, transform: 'translateX(-50%)', padding: '6px 10px', borderRadius: 6, background: 'rgba(28,28,30,0.92)', color: '#fff', fontSize: 12, lineHeight: '18px', whiteSpace: 'nowrap', pointerEvents: 'none' },
  /* 路径信息正文：对端原路径 + 解析后的绝对路径，两块等宽文本 */
  /** PDF 阅读器：工具条 + 连续滚动的页画布（pdfjs canvas 渲染）。 */
  pdfWrap: { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--dsw-alias-bg-base, #f6f7f8)' },
  pdfBar: { flex: 'none', display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 12px', borderBottom: '1px solid var(--dsw-alias-border-l2, #e3e4e6)', background: 'var(--dsw-alias-bg-base, #fff)' },
  pdfTool: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, padding: '0 6px', border: 0, borderRadius: 6, background: 'transparent', color: T.sec, fontSize: 14, lineHeight: '24px', cursor: 'pointer' },
  pdfToolLink: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 24, height: 24, padding: '0 6px', borderRadius: 6, color: T.sec, fontSize: 14, textDecoration: 'none' },
  pdfPageNo: { fontSize: 12, color: T.sec, minWidth: 46, textAlign: 'center' },
  pdfZoom: { fontSize: 12, color: T.sec, minWidth: 40, textAlign: 'center' },
  pdfDivider: { width: 1, height: 16, background: 'var(--dsw-alias-border-l2, #e3e4e6)', margin: '0 4px' },
  pdfScroll: { flex: '1 1 auto', minHeight: 0, overflow: 'auto' },
  pdfPages: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 24px 32px' },
  pdfCanvas: { display: 'block', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.12)', borderRadius: 2 },
  pdfError: { flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontSize: 13, color: 'var(--dsw-alias-state-error-primary, #c0392b)' },
  /** 不可预览空态：主体 `TextPreview` 的 `.empty`（列布局、16px 间距、居中、12% 底部留白）。 */
  unsupported: { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', padding: '0 24px 40px', color: 'var(--dsw-alias-label-secondary, #6b7280)', fontSize: 13, lineHeight: 1.6 },
  unsupportedLine: { margin: 0 },
  imgWrap: { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--dsw-alias-bg-base, #f6f7f8)' },
  imgScroll: { flex: '1 1 auto', minHeight: 0, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 16 },
  /** HTML：沙箱 iframe 铺满预览区（脚本可跑，但没有宿主同源权限）。 */
  previewHtmlFrame: { width: '100%', height: '100%', minHeight: 420, border: 0, background: '#fff' },
  pathInfoWrap: { flex: '1 1 auto', minHeight: 0, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14, whiteSpace: 'normal', fontFamily: 'var(--dsw-font, sans-serif)' },
  pathInfoHint: { fontSize: 12, lineHeight: '18px', color: T.ter },
  /** PDF / 音视频：转发路由直供字节，避免大文件走 JSON。 */
  previewMediaWrap: { flex: '1 1 auto', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--dsw-alias-bg-base, #fff)' },
  previewVideo: { maxWidth: '100%', maxHeight: '100%', borderRadius: T.radiusMd, background: '#000' },
  previewAudio: { width: '100%' },
  pathInfoLabel: { fontSize: 11, lineHeight: '16px', fontWeight: 500, color: T.ter },
  pathInfoValue: { marginTop: 6, padding: '8px 10px', borderRadius: T.radiusMd, border: '0.5px solid var(--dsw-alias-border-l1, #ececec)', background: 'var(--dsw-alias-card-fill, #f8f9fa)', fontFamily: 'var(--dsw-font-mono, ui-monospace, monospace)', fontSize: 12, lineHeight: '18px', wordBreak: 'break-all', userSelect: 'text' },
  /* ── 右侧预览面板：真侧窗（占满内容区高度，与左侧会话并排）── */
  pageRow: { display: 'flex', flex: 1, minHeight: 0, minWidth: 0 },
  conversationPane: { display: 'flex', flexDirection: 'column', flex: '1 1 0', minWidth: 0, minHeight: 0 },
  previewPane: {
    display: 'flex', flexDirection: 'column', flex: '0 0 54%', minWidth: 380,
    height: '100%', minHeight: 0,
    borderLeft: '0.5px solid var(--dsw-alias-border-l3, #e3e4e6)',
    background: 'var(--dsw-alias-bg-layer-1, #fff)',
  },
  previewPaneFull: { flex: '1 1 100%', width: '100%', borderLeft: 'none' },
  /* 目录视图（原生侧栏文件列表）：一行一项，名称在左、大小在右，hover 有底色 */
  dirList: { display: 'flex', flexDirection: 'column', padding: '6px 8px 16px' },
  dirRow: { display: 'flex', alignItems: 'center', gap: 8, height: 30, padding: '0 8px', border: 'none', background: 'transparent', borderRadius: T.radiusSm8, color: T.pri, fontSize: 13, textAlign: 'left', cursor: 'pointer' },
  dirIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, flex: 'none', color: 'var(--dsw-alias-text-secondary, #8a8f99)' },
  dirName: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  dirSize: { flex: 'none', color: 'var(--dsw-alias-text-tertiary, #a0a4ab)', fontSize: 12, fontVariantNumeric: 'tabular-nums' },
  dirEmpty: { padding: '12px 8px', color: 'var(--dsw-alias-text-tertiary, #a0a4ab)', fontSize: 13 },
  /* 页签条：原生 dockkit `.tabStrip` —— 28px 行 + 10px 上边距，`padding:10px 6px 0 10px`，gap 4 */
  previewTabStrip: { display: 'flex', flex: '0 0 auto', alignItems: 'center', gap: 4, boxSizing: 'border-box', height: 38, padding: '10px 6px 0 10px' },
  /* 激活页签：原生 `.tab` —— 28px 高、`0 10px`、radius 8、13/1.4、secondary 墨色、markdown-tag 底 */
  previewTab: { position: 'relative', display: 'flex', flex: '0 1 auto', alignItems: 'center', gap: 5, minWidth: 80, maxWidth: 170, boxSizing: 'border-box', height: 28, padding: '0 10px', borderRadius: T.radiusSm8, background: 'var(--dsw-alias-markdown-tag, rgba(0,0,0,0.04))', color: T.pri, fontSize: 13, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', cursor: 'pointer' },
  /* 非激活页签的 hover 底色（原生 `.tab:hover`）；激活页签保持 markdown-tag */
  previewTabHover: { background: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.06))' },
  previewTabName: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  /* 关闭按钮出现时标题在它下面淡出（原生 `.tabTitle` 的 mask） */
  previewTabNameYield: { maskImage: 'linear-gradient(to right, black calc(100% - 30px), transparent calc(100% - 14px))' },
  /* 关闭：20×20、距页签右侧/顶部各 4px、14px 字形、三级墨色 */
  previewTabClose: { position: 'absolute', top: 4, right: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, padding: 0, border: 0, borderRadius: T.radiusSm8, background: 'transparent', color: T.ter, cursor: 'pointer', lineHeight: 1 },
  stripFill: { flex: '1 1 0', minWidth: 0 },
  /* 页签条末端的面板控件：gap 8、28×28、15px 字形（原生 `.iconButton`） */
  paneChrome: { display: 'flex', flex: 'none', alignItems: 'center', gap: 8, height: 28, marginLeft: 4 },
  paneIconButton: { display: 'inline-flex', flex: 'none', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 6, boxSizing: 'border-box', color: T.sec, lineHeight: 1, background: 'transparent', border: 'none', borderRadius: T.radiusSm8, cursor: 'pointer' },
  /* 路径行：原生 TextPreview `.header` —— 38px、`0 6px 0 16px`、gap 4、底边 0.5px l3 */
  previewHeader: { display: 'flex', flex: '0 0 auto', gap: 4, alignItems: 'center', boxSizing: 'border-box', height: 38, padding: '0 6px 0 16px', borderBottom: '0.5px solid var(--dsw-alias-border-l3, #e3e4e6)' },
  previewPath: { display: 'flex', flex: '1 1 auto', justifyContent: 'flex-start', minWidth: 0, overflow: 'hidden', marginRight: 12, fontSize: 12, lineHeight: '18px', whiteSpace: 'nowrap' },
  /* 文字始终贴左：短路径不因弹性空隙被推到右边；超长时右侧省略。 */
  previewPathText: { flex: '0 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', marginRight: 'auto' },
  /* 文件夹分段按钮：24px 高、发丝描边（同卡片右侧同款） */
  previewFolderSplit: { flex: 'none', display: 'inline-flex', alignItems: 'center', height: 24, boxSizing: 'border-box', border: '0.5px solid var(--dsw-alias-border-l2, #e7e7e7)', borderRadius: T.radiusMd, overflow: 'hidden' },
  previewFolderMain: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 24, padding: 0, border: 0, background: 'transparent', color: T.sec, cursor: 'pointer' },
  previewFolderDivider: { width: 0.5, height: 24, background: 'var(--dsw-alias-border-l2, #e7e7e7)' },
  previewFolderCaret: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 24, padding: 0, border: 0, background: 'transparent', color: T.sec, cursor: 'pointer' },
  previewTool: { boxSizing: 'border-box', display: 'inline-flex', flex: 'none', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 6, color: T.sec, lineHeight: 1, background: 'transparent', border: 'none', borderRadius: T.radiusSm8, cursor: 'pointer' },
  /* 文档加载态：原生 `LoadingIndicator.module.css .loading`（列向、12px 间距、24px 内边距、14/1.5） */
  previewLoading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', gap: 12, width: '100%', height: '100%', minHeight: 0, padding: 24, color: T.sec, fontFamily: 'var(--dsw-font, sans-serif)', fontSize: 14, lineHeight: 1.5, textAlign: 'center', whiteSpace: 'normal' },
  previewSpinner: { flex: 'none', color: T.ter },
  previewSpinnerMotion: { transformOrigin: 'center', animation: 'dsh-rp-spin 1.5s linear infinite' },
  previewSpinnerArc: { animation: 'dsh-rp-dash 1.5s ease-in-out infinite' },
  /* 内容行：正文 + 可选文件树 */
  previewContentRow: { position: 'relative', display: 'flex', flex: '1 1 auto', minWidth: 0, minHeight: 0 },
  previewContent: { position: 'relative', display: 'flex', flex: '1 1 auto', minWidth: 0, minHeight: 0, background: 'var(--dsw-alias-bg-layer-1, #fff)' },
  /* ── 文件树：原生 `FileNavigator` push 态 —— 260px、左 0.5px l3、bg-base ── */
  navigator: { position: 'relative', display: 'flex', flex: 'none', flexDirection: 'column', boxSizing: 'border-box', width: 260, height: '100%', minWidth: 0, minHeight: 0, background: 'var(--dsw-alias-bg-base, #fff)', borderLeft: '0.5px solid var(--dsw-alias-border-l3, #e3e4e6)', color: T.pri, fontSize: 13, lineHeight: 1.5 },
  navSearchBar: { flex: '0 0 auto', boxSizing: 'border-box', height: 42, padding: '8px 8px 4px' },
  navSearchField: { display: 'flex', gap: 2, alignItems: 'center', boxSizing: 'border-box', height: '100%', padding: '0 2px', background: 'var(--dsw-alias-bg-layer-1, #fff)', border: '0.5px solid var(--dsw-alias-border-l4, #e3e4e6)', borderRadius: T.radiusMd },
  navSearchIcon: { display: 'inline-flex', flex: 'none', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, padding: 4, boxSizing: 'border-box', color: T.ter, lineHeight: 1 },
  navSearchInput: { flex: '1 1 auto', minWidth: 0, padding: '0 4px', color: T.pri, font: 'inherit', background: 'transparent', border: 'none', outline: 'none' },
  navSearchClear: { display: 'inline-flex', flex: 'none', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, padding: 4, boxSizing: 'border-box', border: 0, borderRadius: T.radiusSm8, background: 'transparent', color: T.ter, cursor: 'pointer', lineHeight: 1 },
  navBody: { flex: '1 1 auto', minHeight: 0, marginRight: 2, padding: '8px 0 8px 8px', overflow: 'auto', scrollbarGutter: 'stable' },
  navLevel: { margin: 0, padding: 0 },
  navLevelNested: { margin: 0, paddingLeft: 18 },
  navItem: { margin: 0, padding: 0 },
  navRow: { display: 'flex', gap: 6, alignItems: 'center', width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '5px 10px', border: 0, borderRadius: T.radiusMd, background: 'transparent', color: 'inherit', font: 'inherit', textAlign: 'left', cursor: 'pointer' },
  navRowCurrent: { background: 'var(--dsw-alias-interactive-bg-active, rgba(0,0,0,0.06))' },
  navRowHover: { background: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.04))' },
  navIcon: { display: 'inline-flex', flex: 'none', alignItems: 'center', justifyContent: 'center', color: T.ter },
  navName: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  navNote: { margin: 0, padding: '3px 10px', color: T.ter, fontSize: 12 },
  /* ── 本轮改动卡片：原生 `ChangedFiles.module.css` 逐值 ── */
  changedCard: { display: 'flex', flexDirection: 'column', minWidth: 0, marginTop: 4, overflow: 'hidden', border: '0.5px solid var(--dsw-alias-border-l2, #e3e4e6)', borderRadius: 'var(--dsw-radius-lg, 16px)', background: 'var(--dsw-alias-bg-layer-1, #fff)', color: T.pri },
  changedHeader: { display: 'flex', alignItems: 'center', gap: 10, boxSizing: 'border-box', width: '100%', minWidth: 0, height: 60, margin: 0, padding: '8px 10px', border: 0, background: 'var(--dsw-alias-card-fill, #fafafa)', color: 'inherit', font: 'inherit', textAlign: 'left', cursor: 'pointer' },
  changedTile: { display: 'grid', flex: 'none', placeItems: 'center', boxSizing: 'border-box', width: 40, height: 40, border: '0.5px solid var(--dsw-alias-border-l1, #ededed)', borderRadius: 10, background: 'var(--dsw-alias-card-tile-fill, #f2f3f5)' },
  changedTitles: { display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 },
  changedTitle: { overflow: 'hidden', fontSize: 13, fontWeight: 500, lineHeight: '20px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  changedStat: { display: 'inline-flex', fontSize: 10, lineHeight: '16px', color: T.ter },
  changedPreviewHint: { display: 'none', fontSize: 10, lineHeight: '16px' },
  changedList: { margin: 0, padding: 0, listStyle: 'none', borderTop: '0.5px solid var(--dsw-alias-border-l2, #e3e4e6)' },
  changedRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, boxSizing: 'border-box', width: '100%', minWidth: 0, minHeight: 24, margin: 0, padding: '7px 18px 7px 14px', border: 0, background: 'transparent', color: T.ter, cursor: 'pointer', fontFamily: 'var(--ds-font-family-code, ui-monospace, monospace)', fontSize: 11, lineHeight: '18px', textAlign: 'left' },
  changedPath: { minWidth: 0, overflow: 'hidden', fontFamily: 'var(--dsw-font-family, sans-serif)', fontSize: 12, textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  changedToggle: { display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', gap: 4, boxSizing: 'border-box', width: '100%', margin: 0, padding: '10px 18px 10px 14px', border: 0, background: 'transparent', color: T.ter, cursor: 'pointer', font: 'inherit', fontSize: 12, lineHeight: '18px', textAlign: 'left' },
  /* 深色 tooltip 的快捷键 keycap：原生 Tooltip 的 `ShortcutKeys` */
  previewScroller: {
    position: 'relative', flex: '1 1 auto', minHeight: 0, margin: 0, padding: 0, overflow: 'auto',
    overflowAnchor: 'none',
    color: T.pri,
    fontSize: 13, fontFamily: 'var(--dsw-font-mono, ui-monospace, monospace)',
    lineHeight: 1.6, whiteSpace: 'pre',
  },
  previewTextDoc: { boxSizing: 'border-box', minWidth: '100%', minHeight: '100%', padding: 8 },
  previewLine: { padding: '0 10px' },
  previewImg: { maxWidth: '100%', maxHeight: '100%', height: 'auto', objectFit: 'contain', borderRadius: 8 },
  /* 图片读取中的覆盖层：盖住旧图，铺满内容区（原生 loading 态就是整块空白 + spinner） */
  previewCsvBody: { display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, minWidth: 0, whiteSpace: 'normal', fontFamily: 'var(--dsw-font, sans-serif)' },
  csvBar: { display: 'flex', flex: '0 0 auto', alignItems: 'center', gap: 6, height: 28, padding: '0 8px', borderBottom: '0.5px solid var(--dsw-alias-border-l1, #ececec)', fontSize: 12, color: T.sec },
  csvCellRef: { flex: 'none', minWidth: 34, padding: '0 6px', lineHeight: '20px', textAlign: 'center', borderRight: '0.5px solid var(--dsw-alias-border-l1, #ececec)' },
  csvFx: { flex: 'none', fontStyle: 'italic', opacity: 0.7 },
  csvGridWrap: { flex: '1 1 auto', minHeight: 0, overflow: 'auto' },
  csvGrid: { display: 'grid', fontFamily: 'var(--dsw-font, sans-serif)', fontSize: 12, lineHeight: '20px', borderCollapse: 'collapse', minWidth: '100%' },
  csvColHead: { position: 'sticky', top: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 22, background: 'var(--dsw-alias-bg-layer-2, #f3f4f6)', borderRight: '0.5px solid var(--dsw-alias-border-l1, #ececec)', borderBottom: '0.5px solid var(--dsw-alias-border-l1, #ececec)', fontSize: 11, color: T.ter },
  csvRowHead: { position: 'sticky', left: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 22, background: 'var(--dsw-alias-bg-layer-2, #f3f4f6)', borderRight: '0.5px solid var(--dsw-alias-border-l1, #ececec)', borderBottom: '0.5px solid var(--dsw-alias-border-l1, #ececec)', fontSize: 11, color: T.ter },
  csvCell: { height: 22, padding: '0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'pre', borderRight: '0.5px solid var(--dsw-alias-border-l1, #ececec)', borderBottom: '0.5px solid var(--dsw-alias-border-l1, #ececec)' },
  csvFooter: { display: 'flex', flex: '0 0 auto', alignItems: 'center', gap: 10, height: 26, padding: '0 10px', borderTop: '0.5px solid var(--dsw-alias-border-l1, #ececec)', fontSize: 11, color: T.ter },
  csvFooterText: { fontSize: 11, color: T.ter },
  /** Excel：底部 Sheet 页签（原生 fortune-sheet 的 tab 条位置在底边）。 */
  excelTabs: { display: 'flex', flex: '0 0 auto', alignItems: 'center', gap: 4, height: 30, padding: '0 8px', borderTop: '0.5px solid var(--dsw-alias-border-l1, #ececec)', overflowX: 'auto' },
  excelTab: { flex: 'none', height: 22, padding: '0 10px', border: 0, borderRadius: 6, background: 'transparent', color: T.sec, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' },
  excelTabActive: { background: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.06))', color: 'var(--dsw-alias-label-primary, #1f2329)', fontWeight: 500 },
  /* 输入卡座位：原生 InputBar `.root` 的 `padding: 0 16px 4px`（侧留白 16、底 4） */
  composerWrap: { padding: '0 16px 4px', display: 'flex', flexDirection: 'column', gap: 0 },
  convApprovals: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 'calc(clamp(680px, 64%, 920px) + 32px)', margin: '0 auto', width: '100%' },
  approvalCard: { border: '1px solid var(--dsw-alias-border-l2, #e5e5e5)', borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 },
  /* 输入卡片：照 InputBar.module.css 的 .card —— panel 圆角、input-major 底色、soft 阴影、8px 顶距、12px 内间距 */
  composerPill: {
    position: 'relative',
    maxWidth: 'calc(clamp(680px, 64%, 920px) + 32px)',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingTop: 8,
    borderRadius: 'var(--dsw-radius-panel, 12px)',
    background: 'var(--dsw-specific-input-major, #fff)',
    boxShadow: 'var(--dsw-elevation-soft, 0 1px 2px rgba(0,0,0,0.06))',
  },
  /* 草稿区：14px / 24px 行高、4px 8px 0 14px 内距、36px 最小高度 */
  composerInput: {
    boxSizing: 'border-box',
    minHeight: 36,
    padding: '4px 8px 0 14px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    background: 'transparent',
    fontFamily: 'var(--dsw-font-family, inherit)',
    fontSize: 14,
    lineHeight: '24px',
    color: T.pri,
    caretColor: 'var(--dsw-alias-state-business-primary, #1f6feb)',
  },
  /* 工具行：2px 8px 6px、12px 间距（attach / modes / trailing 同源间距） */
  composerRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '2px 8px 6px', minWidth: 0 },
  /* 卡片顶边零高覆盖锚点：菜单以卡片整宽为基准（同 InputBar .overlayAnchor） */
  overlayAnchor: { position: 'absolute', inset: '0 0 auto', height: 0, zIndex: 100 },
  plusCircle: { display: 'grid', placeItems: 'center', flex: 'none', width: 28, height: 28, border: 'none', borderRadius: 999, cornerShape: 'round', background: 'var(--dsw-specific-selector, #f2f3f5)', color: T.pri, cursor: 'pointer', padding: 0 },
  plusCircleOpen: { background: 'var(--dsw-alias-interactive-bg-hover, #ececec)' },
  /* 输入触发菜单：照 MenuView.module.css .menu —— 贴输入卡片同宽、bottom+4、4px 内距、400px 上限、lg 圆角、prominent 阴影 */
  plusMenu: { position: 'absolute', left: 0, right: 0, bottom: 'calc(100% + 4px)', zIndex: 100, boxSizing: 'border-box', padding: 4, maxHeight: 400, overflowY: 'auto', borderRadius: T.radiusLg10, background: 'var(--dsw-menu-surface-fill, rgba(255,255,255,0.72))', backdropFilter: T.menuBlur, WebkitBackdropFilter: T.menuBlur, boxShadow: T.elevationProminent },
  /* 分组标题：.sectionTitle —— 23px 最小高、5px 8px 2px、11/16 中等、第三级文字色 */
  plusSection: { flex: 'none', minHeight: 23, padding: '5px 8px 2px', color: T.ter, fontSize: 11, fontWeight: 500, lineHeight: '16px' },
  /* 选项行：.item —— 34px 最小高、6px 8px、6px 间距、13/20 */
  plusRow: { display: 'flex', alignItems: 'center', gap: 6, width: '100%', minHeight: 34, padding: '6px 8px', border: 'none', borderRadius: T.radiusMd, background: 'transparent', color: T.pri, cursor: 'pointer', fontSize: 13, lineHeight: '20px', textAlign: 'left' },
  plusLabel: { flex: 'none', maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  plusEn: { flex: 'none', maxWidth: '20%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: T.ter, fontSize: 12, lineHeight: '18px' },
  plusHint: { flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'right', color: T.ter, fontSize: 12, lineHeight: '18px' },
  /* 待发附件行：原生 `ComposerAttachments .rail` —— 2px 10px 顶距、10px 间距、横向滚动
     （卡片 flex gap 12 会顺手把它和草稿拉开，往上回 6px）。 */
  attachRail: { minWidth: 0, display: 'flex', alignItems: 'stretch', gap: 10, padding: '2px 10px 0', marginBottom: -6, overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' },
  /* 图片草稿：原生 `.imageItem` 64×64（缩略图 64 圆角 xl、右上 18px ✕、底部 2px 进度） */
  attachImageItem: { position: 'relative', flex: 'none', width: 64, height: 64 },
  attachThumb: { boxSizing: 'border-box', width: 64, height: 64, padding: 0, overflow: 'hidden', border: '0.5px solid var(--dsw-alias-border-l2-darkmode-thin, #ececec)', borderRadius: 'var(--dsw-radius-xl, 16px)', background: 'var(--dsw-alias-interactive-bg-hover, #f5f5f7)', cursor: 'zoom-in' },
  attachThumbImg: { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
  /* 失败图整体压暗（原生 `.thumbnailFailed img` opacity .4） */
  attachThumbImgDim: { opacity: 0.4 },
  attachThumbFailed: { cursor: 'pointer', borderColor: 'var(--dsw-alias-state-error-primary, #e5484d)' },
  /* 失败图标盖在缩略图正中（原生 `.failureGlyph` inset 0 + place-items center） */
  attachFailureGlyph: { position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--dsw-alias-state-error-primary, #e5484d)', pointerEvents: 'none' },
  /* 缩略图的 ✕：18px、内缩 4px、默认透明，悬停整块才浮出来（原生 `.remove`） */
  attachRemove: { position: 'absolute', top: 4, right: 4, zIndex: 1, display: 'grid', placeItems: 'center', width: 18, height: 18, padding: 0, border: 'none', borderRadius: '50%', cornerShape: 'round', background: 'var(--dsw-alias-button-contrast-fill, rgba(0,0,0,0.55))', color: 'var(--dsw-alias-label-primary-inverted, #fff)', opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s ease-in-out' },
  attachRemoveShown: { opacity: 1 },
  attachRemoveFailed: { opacity: 1, background: 'var(--dsw-alias-state-error-primary, #e5484d)', color: 'var(--dsw-alias-label-on-color, #fff)' },
  /* 非图片草稿：原生 `ReferenceChip` 的蓝字 chip —— 14px 文件图标 + ≤240px 省略号名字、
     4px 圆角、透明底，悬停才铺一层浅蓝；失败态转红加删除线，点一下重传。 */
  attachChipRow: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '2px 14px 0', marginBottom: -6 },
  attachChip: { display: 'inline-flex', alignItems: 'center', gap: 3, maxWidth: 240, minHeight: 24, padding: '0 4px', border: 'none', borderRadius: 'var(--dsw-radius-sm, 4px)', background: 'transparent', color: 'var(--dsw-alias-state-business-primary, #3964FE)', fontSize: 14, lineHeight: '22px', userSelect: 'none', transition: 'background 0.15s ease-in-out' },
  attachChipHover: { background: 'var(--dsw-alias-state-business-tertiary, rgba(57,100,254,0.08))' },
  attachChipInvalid: { color: 'var(--dsw-alias-state-error-primary, #e5484d)', textDecoration: 'line-through', opacity: 0.7, cursor: 'pointer' },
  attachChipIcon: { display: 'inline-flex', flex: 'none', alignItems: 'center' },
  attachChipLabel: { overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
  attachChipSpinner: { display: 'inline-flex', flex: 'none', alignItems: 'center', marginLeft: 2, opacity: 0.6 },
  attachChipRemove: { flex: 'none', display: 'inline-grid', placeItems: 'center', width: 14, height: 14, marginLeft: 2, padding: 0, border: 'none', borderRadius: '50%', cornerShape: 'round', background: 'transparent', color: 'inherit', cursor: 'pointer' },
  /* 进度条：缩略图内距 8/6（原生 `ComposerAttachments .progressTrack`） */
  attachThumbProgress: { position: 'absolute', left: 8, right: 8, bottom: 6, height: 2, overflow: 'hidden', borderRadius: 1, background: 'var(--dsw-specific-file-upload-track, #ececec)', pointerEvents: 'none' },
  attachProgressBar: { display: 'block', width: '35%', height: '100%', borderRadius: 'inherit', background: 'var(--dsw-alias-brand-primary, #3964FE)', animation: 'dsh-rp-upload 1.2s ease-in-out infinite alternate' },
  commandToken: { position: 'absolute', left: 0, top: 0, fontSize: 14, fontWeight: 500, color: 'var(--dsw-alias-state-business-primary, #3964FE)', pointerEvents: 'none', lineHeight: '24px', paddingTop: 4, paddingLeft: 14 },
  commandRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, opacity: 0.8 },
  commandCaret: { opacity: 0.45, fontFamily: 'ui-monospace, Menlo, monospace' },
  commandName: { fontWeight: 600, opacity: 0.7 },
  commandDot: { opacity: 0.35 },
  commandText: { opacity: 0.65 },
  commandError: { color: '#c0392b' },
  darkButton: { minWidth: 72, height: 32, padding: '0 12px', borderRadius: 'var(--dsw-radius-sm, 6px)', border: 'none', background: 'var(--dsw-alias-button-primary-fill, #1f2328)', color: 'var(--dsw-alias-label-on-color, #fff)', cursor: 'pointer', fontSize: 13 },
  sendCircle: { display: 'grid', placeItems: 'center', flex: 'none', width: 34, height: 34, border: 'none', borderRadius: 999, cornerShape: 'round', background: 'var(--dsw-alias-button-info-fill, #3964FE)', color: 'var(--dsw-alias-label-on-color, #fff)', fontSize: 16, cursor: 'pointer', transform: 'translateY(-2px)' },
  modelButton: { display: 'flex', alignItems: 'center', gap: 4, height: 28, padding: '0 4px 0 8px', border: 'none', borderRadius: 'var(--dsw-radius-sm, 6px)', background: 'transparent', color: T.sec, cursor: 'pointer', fontSize: 13, lineHeight: '20px', fontWeight: 400, whiteSpace: 'nowrap' },
  modelValue: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  modelEffort: { flexShrink: 1000, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--dsw-alias-label-caption, #81858C)' },
  /* 权限 chip：PermissionSelect .trigger —— 28px、13/20 中等、右侧 4px、图标 14 */
  permissionButton: { display: 'flex', alignItems: 'center', gap: 4, height: 28, maxWidth: 220, padding: '0 4px 0 8px', border: 'none', borderRadius: 'var(--dsw-radius-sm, 6px)', background: 'transparent', color: T.sec, cursor: 'pointer', fontSize: 13, lineHeight: '20px', fontWeight: 500, whiteSpace: 'nowrap' },
  /* 权限菜单：Menu.module.css .list + .item */
  permissionMenu: { position: 'absolute', left: 0, bottom: 'calc(100% + 4px)', zIndex: 100, boxSizing: 'border-box', padding: 4, minWidth: 144, maxWidth: 260, borderRadius: T.radiusLg10, background: 'var(--dsw-menu-surface-fill, rgba(255,255,255,0.72))', backdropFilter: T.menuBlur, WebkitBackdropFilter: T.menuBlur, boxShadow: T.elevationProminent },
  permissionRow: { display: 'flex', alignItems: 'center', gap: 6, width: '100%', minHeight: 34, padding: '6px 8px', border: 'none', borderRadius: T.radiusMd, background: 'transparent', color: T.pri, cursor: 'pointer', fontSize: 13, lineHeight: '20px', textAlign: 'left' },
  permissionCheck: { flex: 'none', marginLeft: 'auto', display: 'inline-flex', color: T.pri, fontSize: 14, lineHeight: 1 },
  /* 风险确认弹窗：Modal.module.css .dialog + RiskConfirmation .confirmation(440px) */
  permDialogOverlay: { position: 'fixed', inset: 0, background: 'var(--dsw-alias-bg-mask-1, rgba(0,0,0,0.3))', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  permDialog: { boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20, width: 'min(440px, 100%)', maxHeight: 'calc(100dvh - 48px)', overflow: 'hidden', borderRadius: 'var(--dsw-radius-panel, 12px)', background: 'var(--dsw-alias-bg-layer-2, #fff)', boxShadow: 'var(--dsw-elevation-prominent, 0 18px 48px rgba(0,0,0,0.22))', padding: '0 0 24px' },
  permDialogHead: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '22px 14px 12px 24px', fontSize: 16, lineHeight: '24px', fontWeight: 500, color: T.pri },
  /* Modal .content：标题与正文同属一列，内部不再叠加 dialog 的 20px gap */
  permDialogContent: { display: 'flex', flexDirection: 'column', width: '100%' },
  permWarn: { flex: 'none', marginTop: 3, color: 'var(--dsw-alias-state-warn-primary, #e08c1f)', display: 'inline-flex' },
  /* Modal .body：padding 0 24，warning 语气下 margin-top 0（与标题同属 .content，中间不加 gap） */
  permDialogBody: { display: 'flex', flexDirection: 'column', minWidth: 0, margin: 0, padding: '0 24px', fontSize: 14, lineHeight: '22px', color: T.sec },
  riskRow: { display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 16, border: 'none', background: 'transparent', color: T.sec, cursor: 'pointer', padding: 0, fontSize: 14, fontWeight: 400, lineHeight: '20px', textAlign: 'left' },
  permDialogFooter: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '0 24px' },
  /* Button：md 36px、radius-md、14/22、padding 0 14；outline 用内发光发丝边；primary 禁用态用整体 opacity 0.4 */
  permCancel: { boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 72, height: 36, padding: '0 14px', borderRadius: T.radiusMd, border: '0.5px solid transparent', background: 'transparent', boxShadow: 'inset 0 0 0 var(--dsh-hairline-width, 0.5px) var(--dsw-alias-border-l3, #d0d0d0)', color: T.pri, cursor: 'pointer', fontSize: 14, lineHeight: '22px' },
  permConfirm: { boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 136, height: 36, padding: '0 14px', borderRadius: T.radiusMd, border: 'none', background: 'var(--dsw-alias-button-primary-fill, #1f2328)', color: 'var(--dsw-alias-label-primary-foreground, #fff)', cursor: 'pointer', fontSize: 14, lineHeight: '22px' },
  permConfirmDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  /* 模型菜单：ModelSelect.module.css .menu + .settingsMenu —— fit-content、240~420、4px 内距、prominent 阴影 */
  modelMenu: { position: 'absolute', right: 0, bottom: 'calc(100% + 8px)', zIndex: 100, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', width: 'fit-content', minWidth: 240, maxWidth: 420, maxHeight: 360, overflowY: 'auto', padding: 4, borderRadius: T.radiusLg10, background: 'var(--dsw-menu-surface-fill, rgba(255,255,255,0.72))', backdropFilter: T.menuBlur, WebkitBackdropFilter: T.menuBlur, boxShadow: T.elevationProminent, color: T.pri },
  /* 根行：.cell —— 34px、0 8px、13/20 */
  modelCell: { boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 6, width: 'auto', minWidth: '100%', height: 34, padding: '0 8px', border: 'none', borderRadius: T.radiusMd, background: 'transparent', color: T.pri, fontSize: 13, lineHeight: '20px', textAlign: 'left', cursor: 'pointer' },
  modelCellLabel: { flex: '0 0 auto', whiteSpace: 'nowrap' },
  modelCellValue: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right', color: T.ter },
  /* provider 分组标题：MenuGroup .heading */
  modelGroupHeading: { padding: '4px 7px 2px', fontSize: 11, lineHeight: '16px', fontWeight: 500, color: T.ter },
  /* 选项行：.option —— 34px、5px 7px、13/18，选中只在右侧打勾 */
  modelOption: { boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 6, width: 'auto', minWidth: '100%', minHeight: 34, padding: '5px 7px', border: 'none', borderRadius: T.radiusMd, background: 'transparent', color: 'inherit', fontSize: 13, lineHeight: '18px', textAlign: 'left', cursor: 'pointer' },
  modelOptionName: { flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, lineHeight: '18px' },
  modelCheck: { display: 'grid', placeItems: 'center', flex: '0 0 14px', color: T.pri, fontSize: 14, lineHeight: 1 },
  bulletMark: { opacity: 0.6, width: 16, flex: 'none', textAlign: 'left' },
  bulletText: { flex: 1, minWidth: 0 },
  paragraph: { marginBottom: 8 },
  codeBlock: { background: 'var(--dsh-surface-weak, #f6f7f9)', borderRadius: 10, padding: '10px 12px', overflowX: 'auto', fontSize: 12.5, lineHeight: 1.6, fontFamily: 'ui-monospace, Menlo, monospace', margin: '4px 0 8px' },
  /* 统计行：原生 InputBar `.dock` —— 居中、gap 12、22px 最小高、顶部 4px */
  statusLine: { width: '100%', margin: '0 auto', paddingTop: 4, minHeight: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  /* 编排统计药丸：StatsPills `.pill` —— 1px 8px、sm 圆角、12px、6px 图标间距 */
  statusPill: { boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%', padding: '1px 8px', border: 'none', borderRadius: T.radiusSm8, background: 'transparent', color: T.ter, font: 'inherit', fontSize: 12, lineHeight: '20px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', cursor: 'pointer' },
  statusPillOpen: { background: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))', color: 'var(--dsw-alias-label-secondary, #5f6368)' },
  /* 上下文浮层：ContextMeter `.panel` —— 264px 宽、12px 内边距、12/20 */
  contextPanel: { position: 'fixed', zIndex: 1100, boxSizing: 'border-box', width: 264, padding: 12, border: 0, borderRadius: 'var(--dsw-radius-lg, 16px)', background: 'var(--dsw-specific-menu, rgba(255,255,255,0.9))', backdropFilter: T.menuBlur, WebkitBackdropFilter: T.menuBlur, boxShadow: T.elevationProminent, color: 'var(--dsw-alias-label-secondary, #5f6368)', fontSize: 12, lineHeight: '20px', cursor: 'default', maxHeight: 'calc(100vh - 24px)', overflowY: 'auto' },
  contextHeader: { display: 'flex', alignItems: 'center', gap: 6 },
  contextHeadline: { color: T.ter },
  contextPercent: { color: T.pri, fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  contextFigures: { marginLeft: 'auto', color: T.pri, fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  contextBar: { display: 'flex', gap: 1, margin: '10px 0 12px', height: 4, borderRadius: 999, cornerShape: 'round', background: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))', overflow: 'hidden' },
  contextRows: { margin: '6px 0 0' },
  contextRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '2px 0' },
  contextRowLabel: { display: 'inline-flex', alignItems: 'center', color: 'var(--dsw-alias-label-secondary, #5f6368)' },
  contextRowValue: { fontVariantNumeric: 'tabular-nums', color: T.pri },
  contextSwatch: { display: 'inline-block', marginRight: 6, width: 8, height: 8, borderRadius: 2, flex: 'none' },
}
