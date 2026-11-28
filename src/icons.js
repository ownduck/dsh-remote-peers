/** 图标层：内联 SVG 字形（取原生 artwork 的原路径）集中在这里，只依赖 react 与样式令牌。 */
import { createElement } from 'react'
import { styles, T } from './theme.js'

const h = createElement
/** 宿主原生图标（文件夹开/合等）：取不到时退回自绘路径。 */
let hostPrimitives = null
try {
  hostPrimitives = require('@deepseek-ai/dsh-client-ui-primitives') ?? null
} catch {
  hostPrimitives = null
}

/** 复制图标：ui-primitives `copy-outline`（16 视图框、regular 线重）。 */
export function copyGlyph(size = 14) {
  return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', strokeWidth: 1 },
    h('rect', { x: 1.52075, y: 4.07373, width: 10.3932, height: 10.3932, rx: 2, stroke: 'currentColor' }),
    h('path', {
      d: 'M11.9792 1.53296C13.36 1.53296 14.4792 2.65225 14.4792 4.03296V9.42847C14.4792 10.3756 13.9521 11.1987 13.1755 11.6228V10.3298C13.3652 10.0787 13.4792 9.7674 13.4792 9.42847V4.03296C13.4792 3.20453 12.8077 2.53296 11.9792 2.53296H6.58374C6.27966 2.53301 5.99684 2.6235 5.7605 2.77905H4.42358C4.85652 2.03463 5.66056 1.53304 6.58374 1.53296H11.9792Z',
      fill: 'currentColor',
    }),
  )
}

/** 复制成功后的勾选图标（check-outline）。 */
export function checkGlyph(size = 15) {
  return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M3 8.6l3.2 3.2 6.6-8' }))
}

/** 用量（database-outline，15px）。 */
export function databaseGlyph(size = 15) {
  return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 },
    h('ellipse', { cx: 8, cy: 3.6, rx: 5, ry: 1.9 }),
    h('path', { d: 'M3 3.6v8.8c0 1 2.2 1.9 5 1.9s5-.9 5-1.9V3.6' }),
    h('path', { d: 'M3 8c0 1 2.2 1.9 5 1.9s5-.9 5-1.9' }))
}

/** 速度表盘（gauge-outline）。 */
export function gaugeGlyph(size = 14) {
  return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' },
    h('path', { d: 'M2.6 12.2a6 6 0 1 1 10.8 0' }),
    h('path', { d: 'M8 8.4l2.8-2.4' }),
    h('circle', { cx: 8, cy: 8.6, r: 0.9 }))
}

/** 上下文占用环：26% 这类读数，按百分比画弧。 */
export function contextGlyph(percent, size = 14) {
  const value = Math.max(0, Math.min(100, percent))
  const radius = 5.8
  const circumference = 2 * Math.PI * radius
  return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' },
    h('circle', { cx: 8, cy: 8, r: radius, stroke: 'var(--dsw-alias-border-l3, #e3e4e6)' }),
    h('circle', {
      cx: 8, cy: 8, r: radius, stroke: T.ter,
      strokeDasharray: `${(circumference * value) / 100} ${circumference}`,
      transform: 'rotate(-90 8 8)',
    }))
}

export function downloadGlyph() {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', strokeWidth: 1 },
    h('path', { d: 'M8 1.95317V10.0469', stroke: 'currentColor' }),
    h('path', { d: 'M4.25 6.29688L8 10.0469L11.75 6.29688', stroke: 'currentColor' }),
    h('path', { d: 'M1.5 10.0469V13.158C1.5 13.3937 1.60536 13.6198 1.79289 13.7865C1.98043 13.9532 2.23478 14.0469 2.5 14.0469H13.5C13.7652 14.0469 14.0196 13.9532 14.2071 13.7865C14.3946 13.6198 14.5 13.3937 14.5 13.158V10.0469', stroke: 'currentColor' }),
  )
}

/** 「打开」图标：原生 `IconRightUpOutlineRegular`（应用内打开用这个箭头，不是文件夹）。 */
export function openInAppGlyph(size = 13) {
  return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', style: { flex: 'none', color: 'inherit' } },
    h('path', {
      d: 'M11.7256 2.77441C12.5538 2.77469 13.2256 3.44616 13.2256 4.27441V10.1416H12.2256V4.27441C12.2256 3.99844 12.0015 3.77469 11.7256 3.77441H5.7207V2.77441H11.7256Z',
      fill: 'currentColor',
    }),
    h('path', { d: 'M2.77441 13.2255L12.3756 3.62427', stroke: 'currentColor', strokeWidth: 1 }))
}

export function folderGlyph(size = 14) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M2.4 12.6V4.6a1 1 0 0 1 1-1h3l1.4 1.8h4.8a1 1 0 0 1 1 1v6.2a1 1 0 0 1-1 1H3.4a1 1 0 0 1-1-1Z', ...stroke }))
}

/** 文件树开关：原生 `IconFolderCloseRegular` / `IconFolderOpenRegular`。 */
export function navFolderGlyph(open) {
  const icon = open ? hostPrimitives?.IconFolderOpenRegular : hostPrimitives?.IconFolderCloseRegular
  if (icon !== undefined && icon !== null) return h(icon, null)
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16' },
    h('path', { d: 'M1.9 12.4V4.4a1 1 0 0 1 1-1h3.2l1.3 1.7h6.7a1 1 0 0 1 1 1v6.3a1 1 0 0 1-1 1H2.9a1 1 0 0 1-1-1Z', ...stroke }),
    open ? h('path', { d: 'M2.2 8.2h11.6', ...stroke }) : null)
}

/** 分段按钮右格的下拉箭头（原生 12px chevron-down）。 */
export function caretDownGlyph() {
  return h('svg', { width: 12, height: 12, viewBox: '0 0 12 12', style: { flex: 'none', color: 'inherit' } },
    h('path', { d: 'M3 4.5L6 7.5L9 4.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))
}

export function refreshGlyph() {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
    h('path', { d: 'M13 8a5 5 0 1 1-1.6-3.7', ...stroke }),
    h('path', { d: 'M13 2.6v3h-3', ...stroke }))
}

/** 面板控件：全屏（原生 SidebarRight `FullscreenGlyph` 的四角弧块，16px，非 ui-primitives 的 fullscreen-outline）。 */
export function fullscreenGlyph() {
  return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none' },
    h('path', {
      d: 'M2.33203 10.4054V13.1681C2.33229 13.444 2.55605 13.6681 2.83203 13.6681H5.49512V14.6681H2.83203C2.00376 14.6681 1.33229 13.9963 1.33203 13.1681V10.4054H2.33203ZM14.6689 13.1681C14.6687 13.996 13.9968 14.6676 13.1689 14.6681H10.4951V13.6681H13.1689C13.4445 13.6676 13.6687 13.4437 13.6689 13.1681V10.4054H14.6689V13.1681ZM13.1689 1.33118C13.9969 1.33163 14.6688 2.00315 14.6689 2.83118V5.4054H13.6689V2.83118C13.6688 2.55544 13.4446 2.33162 13.1689 2.33118H10.4951V1.33118H13.1689ZM5.49512 2.33118H2.83203C2.55598 2.33118 2.33218 2.55516 2.33203 2.83118V5.4054H1.33203V2.83118C1.33218 2.00288 2.00369 1.33118 2.83203 1.33118H5.49512V2.33118Z',
      fill: 'currentColor',
    }))
}

/** 面板控件：退出全屏（原生 `ExitFullscreenGlyph`）。 */
export function exitFullscreenGlyph() {
  return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor' },
    h('path', { d: 'M9 2.5V6C9 6.26522 9.10536 6.51957 9.29289 6.70711C9.48043 6.89464 9.73478 7 10 7H13.5' }),
    h('path', { d: 'M7 13.5V10C7 9.73478 6.89464 9.48043 6.70711 9.29289C6.51957 9.10536 6.26522 9 6 9H2.5' }))
}

/** 面板控件：收起侧边栏（原生 `IconPanelLeftOutlineRegular` 镜像；图标组件不吃 style，镜像放在外壳上）。 */
export function collapseGlyph() {
  const icon = hostPrimitives?.IconPanelLeftOutlineRegular
  return h('span', { style: { display: 'inline-flex', transform: 'scaleX(-1)' } },
    icon !== undefined && icon !== null
      ? h(icon, { size: 15 })
      : h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
          h('rect', { x: 1.5, y: 2.5, width: 13, height: 11, rx: 2 }),
          h('path', { d: 'M6 2.5v11', stroke: 'currentColor' }),
          h('path', { d: 'M1.5 4.5C1.5 3.4 2.4 2.5 3.5 2.5H6v11H3.5C2.4 13.5 1.5 12.6 1.5 11.5V4.5Z', fill: 'currentColor', stroke: 'none' })))
}

/** 树行左侧的展开箭头（原生 12px chevron，展开时旋转 90°）。 */
export function caretRightGlyph(open) {
  return h('svg', { width: 12, height: 12, viewBox: '0 0 12 12', style: { flex: 'none', color: 'inherit', transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 120ms' } },
    h('path', { d: 'M4.5 3L7.5 6L4.5 9', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }))
}

/** 文件夹行的 hover 三角：原生 `IconTriangleRightFillRegular`（实心、14px，展开时旋转 90°）。 */
export function triangleFillGlyph(open) {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', style: { flex: 'none', display: 'block', color: 'inherit', transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 150ms var(--ds-ease-in-out, ease-in-out)' } },
    h('path', { d: 'M5.5 4.5C5.5 4.40714 5.52586 4.31612 5.57467 4.23713C5.62349 4.15815 5.69334 4.09431 5.77639 4.05279C5.85945 4.01126 5.95242 3.99368 6.0449 4.00202C6.13738 4.01036 6.22572 4.04429 6.3 4.1L10.967 7.6C11.0291 7.64657 11.0795 7.70697 11.1142 7.77639C11.1489 7.84582 11.167 7.92238 11.167 8C11.167 8.07762 11.1489 8.15418 11.1142 8.22361C11.0795 8.29303 11.0291 8.35343 10.967 8.4L6.3 11.9C6.22572 11.9557 6.13738 11.9896 6.0449 11.998C5.95242 12.0063 5.85945 11.9887 5.77639 11.9472C5.69334 11.9057 5.62349 11.8419 5.57467 11.7629C5.52586 11.6839 5.5 11.5929 5.5 11.5V4.5Z', fill: 'currentColor' }))
}

/** 菜单里的「重命名」：原生 `IconEditOutlineRegular` 的原路径（方框 + 斜笔），14px。 */
export function renameGlyph(size = 14) {
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M8.85596 2.69971H4.19971C3.37141 2.69971 2.69992 3.37146 2.69971 4.19971V11.8003C2.69992 12.6285 3.37141 13.3003 4.19971 13.3003H11.8003C12.6283 13.2999 13.3001 12.6283 13.3003 11.8003V7.89893H14.3003V11.8003C14.3001 13.1806 13.1806 14.2999 11.8003 14.3003H4.19971C2.81913 14.3003 1.69992 13.1808 1.69971 11.8003V4.19971C1.69992 2.81918 2.81913 1.69971 4.19971 1.69971H8.85596V2.69971Z', fill: 'currentColor' }),
    h('path', { d: 'M7.7849 8.23878L13.888 2.13574', fill: 'none', stroke: 'currentColor', strokeWidth: 1 }))
}

/** 「置顶」：原生 `IconPinOutlineRegular`（空心图钉）；`filled` 用 `IconPinFillRegular` 的实心路径。 */
export function pinGlyph(size = 14, filled = false) {
  const body = 'M9.96976 1.70572L13.1554 3.93629L10.9019 8.12317L11.5158 11.605L10.7192 12.7427L2.52767 7.00693L3.3243 5.86922L6.80612 5.25528L9.96976 1.70572Z'
  const pin = 'M6.05285 9.47511C6.27284 9.16094 6.70586 9.08458 7.02003 9.30457C7.3342 9.52455 7.41055 9.95757 7.19057 10.2717L3.98587 14.4708L3.21223 13.9291L6.05285 9.47511Z'
  return h('svg', { width: size, height: size, ...styles.iconBox },
    filled
      ? [h('path', { key: 'b', d: body, fill: 'currentColor', stroke: 'currentColor', strokeLinejoin: 'round' }),
          h('path', { key: 'p', d: pin, fill: 'currentColor' })]
      : [h('path', { key: 'b', d: body, fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinejoin: 'round' }),
          h('path', { key: 'p', d: pin, fill: 'currentColor' })])
}

/** 「新会话」：原生 `IconNewChatOutlineRegular` 的原路径（气泡 + 十字），14px、1px 描边。 */
export function newChatGlyph(size = 14) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M2.37091 11.2501C1.58745 9.89288 1.32067 8.29835 1.61969 6.76006C1.91872 5.22177 2.76342 3.8433 3.99826 2.87846C5.2331 1.91362 6.77494 1.42737 8.33988 1.50925C9.90482 1.59113 11.3875 2.23562 12.5149 3.32406C13.6425 4.41269 14.3387 5.87206 14.4754 7.4334C14.612 8.99474 14.18 10.5529 13.2587 11.8209C12.3375 13.0888 10.9891 13.9813 9.46194 14.3337C8.18691 14.628 6.85895 14.5294 5.64989 14.0605C5.1712 13.8748 4.76962 13.4932 4.26534 13.3967C3.67413 13.2835 2.95257 13.5598 2.03794 14.3337', ...stroke }),
    h('path', { d: 'M8 5V11', ...stroke }),
    h('path', { d: 'M5 8H11', ...stroke }))
}

export function searchGlyph(size = 14) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('circle', { cx: 7, cy: 7, r: 4.4, ...stroke }),
    h('path', { d: 'M10.4 10.4L13.6 13.6', ...stroke }))
}

/** 「视图选项」字形：两条带滑块的横线（原生左栏 filters 图标）。 */
export function slidersGlyph(size = 15) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M2.6 5.4h10.8', ...stroke }),
    h('circle', { cx: 6.2, cy: 5.4, r: 1.5, ...stroke }),
    h('path', { d: 'M2.6 10.6h10.8', ...stroke }),
    h('circle', { cx: 10, cy: 10.6, r: 1.5, ...stroke }))
}

/** 单列表字形：三行等长横线。 */
export function listGlyph(size = 14) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M2.8 4.4h10.4', ...stroke }),
    h('path', { d: 'M2.8 8h10.4', ...stroke }),
    h('path', { d: 'M2.8 11.6h10.4', ...stroke }))
}

/** 隐藏已归档字形：带斜杠的眼睛。 */
export function eyeOffGlyph(size = 14) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M2.4 8c1.4-2.6 3.4-4 5.6-4s4.2 1.4 5.6 4c-1.4 2.6-3.4 4-5.6 4S3.8 10.6 2.4 8Z', ...stroke }),
    h('circle', { cx: 8, cy: 8, r: 1.7, ...stroke }),
    h('path', { d: 'M3 13L13 3', ...stroke }))
}

/** 全部对话字形：对话气泡。 */
export function chatGlyph(size = 14) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M13.2 8.4a4.6 4.6 0 0 1-4.6 4.6H6.2L3.4 14.2v-2.4A4.6 4.6 0 0 1 8.6 3.8a4.6 4.6 0 0 1 4.6 4.6Z', ...stroke }))
}

/** 已归档字形：带盖的盒子。 */
export function archiveGlyph(size = 14) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M2.6 5.4h10.8v7.2a.8.8 0 0 1-.8.8H3.4a.8.8 0 0 1-.8-.8Z', ...stroke }),
    h('path', { d: 'M2.2 2.8h11.6v2.6H2.2Z', ...stroke }),
    h('path', { d: 'M6.2 8.4h3.6', ...stroke }))
}

/** 返回字形：细箭头（返回远程端列表用）。 */
export function backArrowGlyph(size = 15) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M13 8H3.4', ...stroke }),
    h('path', { d: 'M7 3.8L3 8l4 4.2', ...stroke }))
}

/** 目录项里的文件字形（文档折角，14px）。 */
export function fileGlyph(size = 14) {
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return h('svg', { width: size, height: size, ...styles.iconBox },
    h('path', { d: 'M8.6 2.4H4.6a1 1 0 0 0-1 1v9.2a1 1 0 0 0 1 1h6.8a1 1 0 0 0 1-1V6.2Z', ...stroke }),
    h('path', { d: 'M8.6 2.4V6.2h3.8', ...stroke }))
}

/** 12px 细叉：原生 `IconCloseFillRegular` 的尺寸与观感（静止时透明、悬停才露出来）。 */
export function closeGlyph(size = 12) {
  return h('svg', { width: size, height: size, ...styles.iconBox, 'aria-hidden': 'true' },
    h('path', {
      d: 'M3.4 3.4 12.6 12.6M12.6 3.4 3.4 12.6',
      fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round',
    }))
}

/** 16px 三角警告：对端明说拒绝了这份附件时盖在缩略图正中。 */
export function warningGlyph(size = 16) {
  return h('svg', { width: size, height: size, ...styles.iconBox, 'aria-hidden': 'true' },
    h('path', { d: 'M8 2.4 14.4 13.2H1.6Z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }),
    h('path', { d: 'M8 6.2v3.2', stroke: 'currentColor', strokeWidth: 1.3 }),
    h('circle', { cx: 8, cy: 11.3, r: 0.85, fill: 'currentColor' }))
}

/** 16px 重试箭头：普通上传失败时盖在缩略图正中。 */
export function retryGlyph(size = 16) {
  return h('svg', { width: size, height: size, ...styles.iconBox, 'aria-hidden': 'true' },
    h('path', { d: 'M13 8a5 5 0 1 1-1.5-3.6', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }),
    h('path', { d: 'M13.2 2.4v3.4h-3.4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }))
}

/** 发送箭头：照搬 InputBar.tsx 的 16px 实心箭头（不是描边版 send-outline）。 */
export function sendGlyph() {
  return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', style: { display: 'block' } },
    h('path', {
      d: 'M8.3125 0.980183C8.66767 1.0531 8.97902 1.20418 9.2627 1.43233C9.48724 1.61297 9.73029 1.85793 9.97949 2.10714L14.707 6.83468L13.293 8.24874L9 3.95577V15.0417H7V3.95577L2.70703 8.24874L1.29297 6.83468L6.02051 2.10714C6.26971 1.85793 6.51277 1.61297 6.7373 1.43233C6.97662 1.23986 7.28445 1.04402 7.6875 0.980183C7.8973 0.947006 8.1031 0.95516 8.3125 0.980183Z',
      fill: 'currentColor',
    }))
}

/** 按钮内的转圈指示器：底环 + 旋转弧，沿用原生 1.5s 周期。 */
export function spinnerGlyph(size = 12) {
  const box = { display: 'block', flex: 'none' }
  return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: box, 'aria-hidden': 'true' },
    h('g', { style: { transformOrigin: 'center', animation: 'dsh-rp-spin 1s linear infinite' } },
      h('circle', { cx: 8, cy: 8, r: 6, fill: 'none', stroke: 'currentColor', strokeOpacity: 0.3, strokeWidth: 2 }),
      h('path', { d: 'M8 2a6 6 0 0 1 6 6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' })))
}

/** 发送中的转圈（同 InputBar .sendingSpinner：底环 35% + 2px 弧）。 */
export function sendingGlyph() {
  return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', style: { display: 'block' } },
    h('circle', { cx: 8, cy: 8, r: 6, fill: 'none', stroke: 'currentColor', strokeOpacity: 0.35, strokeWidth: 2 }),
    h('path', { d: 'M8 2a6 6 0 0 1 6 6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }))
}

/** 回到底部的 chevron-down（14px、1.3 stroke，同 IconChevronDownOutlineRegular）。 */
export function toBottomGlyph() {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M4 6.4L8 10.4L12 6.4' }))
}

/** 「+」控件图标：照搬 ui-primitives plus-outline（16px、stroke 1）。 */
export function plusGlyph() {
  return h('svg', {
    width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', strokeWidth: 1.3,
    style: { display: 'block' },
  },
  h('path', { d: 'M8 2V14', stroke: 'currentColor' }),
  h('path', { d: 'M2 8H14', stroke: 'currentColor' }))
}
