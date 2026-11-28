/** 源码入口（esbuild 打桩前）：不带上 ModuleLoader 外壳，构建脚本统一加 banner/footer。 */
const react = require('react')
import { SCROLL_SKIN, T, styles } from './theme.js'
import { copyGlyph, checkGlyph, databaseGlyph, gaugeGlyph, contextGlyph, downloadGlyph, openInAppGlyph, folderGlyph, navFolderGlyph, caretDownGlyph, refreshGlyph, fullscreenGlyph, exitFullscreenGlyph, collapseGlyph, caretRightGlyph, triangleFillGlyph, renameGlyph, pinGlyph, newChatGlyph, searchGlyph, slidersGlyph, listGlyph, eyeOffGlyph, chatGlyph, archiveGlyph, backArrowGlyph, fileGlyph, closeGlyph, warningGlyph, retryGlyph, sendGlyph, spinnerGlyph, sendingGlyph, toBottomGlyph, plusGlyph } from './icons.js'
import { diagNote, codeLanguageOf, isImagePath, PdfPreview, ImagePreview, ExcelPreview, renderPreviewLoading, formatBytes, renderCsvBody, previewModeOf, extOf } from './preview.js'
import { modelNameOf, permissionLabel, permissionOf, presetNameOf, selectionOf, metricsOf, effortOf, processToolLabelOf, processToolKind, processKindLabelOf, processToolSummary, processLiveLabelOf, processLiveDetailOf, oneLine, speedText, cacheHitText, formatTokens, formatExactTokens, formatDurationCompact } from './conversation.js'
/** 第二层逐行左侧图标的原生 SVG 内联（ui-primitives artwork 的 1px regular 版，14px 显示）。 */
const PROCESS_ROW_ICONS = {
  think: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M10.2854 5.71481C12.9673 8.39663 14.1182 11.5938 12.8562 12.8559C11.5942 14.1179 8.39706 12.9669 5.71518 10.2851C3.03333 7.60323 1.88236 4.40608 3.14441 3.14403C4.40644 1.882 7.6036 3.03297 10.2854 5.71481Z" stroke="currentColor"></path><path d="M10.2854 10.2851C7.6036 12.9669 4.40644 14.1179 3.14441 12.8559C1.88236 11.5938 3.03333 8.39663 5.71518 5.71481C8.39706 3.03297 11.5942 1.882 12.8562 3.14403C14.1182 4.40608 12.9673 7.60323 10.2854 10.2851Z" stroke="currentColor"></path><path d="M8.86291 8.0002C8.86291 8.47549 8.47762 8.86087 8.00224 8.86087C7.52694 8.86087 7.1416 8.47549 7.1416 8.0002C7.1416 7.52485 7.52694 7.13953 8.00224 7.13953C8.47762 7.13953 8.86291 7.52485 8.86291 8.0002Z" fill="currentColor"></path></svg>',
  commands: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M3 4L7 8L3 12" stroke="currentColor"></path><path d="M9 12H13" stroke="currentColor"></path></svg>',
  browse: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M4.9375 5.90295H11.0625" stroke="currentColor"></path><path d="M4.9375 9.02991H8.27841" stroke="currentColor"></path><path d="M12.5 1.32617C13.3039 1.32617 14 1.95171 14 2.77637V13.2246C13.9996 14.0489 13.3036 14.6738 12.5 14.6738H3.5C2.69637 14.6738 2.00042 14.0489 2 13.2246V2.77637C2 1.95171 2.69613 1.32617 3.5 1.32617H12.5ZM3.5 2.32617C3.1993 2.32617 3 2.55186 3 2.77637V13.2246C3.00044 13.4489 3.19963 13.6738 3.5 13.6738H12.5C12.8004 13.6738 12.9996 13.4489 13 13.2246V2.77637C13 2.55186 12.8007 2.32617 12.5 2.32617H3.5Z" fill="currentColor"></path></svg>',
  search: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M6.58727 11.8586C9.55061 11.8586 11.9529 9.45637 11.9529 6.49304C11.9529 3.5297 9.55061 1.12744 6.58727 1.12744C3.62394 1.12744 1.22168 3.5297 1.22168 6.49304C1.22168 9.45637 3.62394 11.8586 6.58727 11.8586Z" stroke="currentColor"></path><path d="M10.2991 10.3933L14.7783 14.8725" stroke="currentColor"></path></svg>',
  edit: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M8.85596 2.69971H4.19971C3.37141 2.69971 2.69992 3.37146 2.69971 4.19971V11.8003C2.69992 12.6285 3.37141 13.3003 4.19971 13.3003H11.8003C12.6283 13.2999 13.3001 12.6283 13.3003 11.8003V7.89893H14.3003V11.8003C14.3001 13.1806 13.1806 14.2999 11.8003 14.3003H4.19971C2.81913 14.3003 1.69992 13.1808 1.69971 11.8003V4.19971C1.69992 2.81918 2.81913 1.69971 4.19971 1.69971H8.85596V2.69971Z" fill="currentColor"></path><path d="M7.7849 8.23878L13.888 2.13574" stroke="currentColor"></path></svg>',
  code: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M6.27612 1.5L4.52612 14.5" stroke="currentColor"></path><path d="M11.4739 1.5L9.72388 14.5" stroke="currentColor"></path><path d="M2.39868 5.5H14.0681" stroke="currentColor"></path><path d="M1.93188 10.5H13.6013" stroke="currentColor"></path></svg>',
  globe: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M7.99986 14.0887C11.3626 14.0887 14.0886 11.3627 14.0886 7.99998C14.0886 4.63727 11.3626 1.91125 7.99986 1.91125C4.63715 1.91125 1.91113 4.63727 1.91113 7.99998C1.91113 11.3627 4.63715 14.0887 7.99986 14.0887Z" stroke="currentColor"></path><path d="M2.34619 8H13.6538" stroke="currentColor" stroke-linecap="square"></path><path d="M7.99976 14.0889C9.23509 14.0889 10.1743 11.3629 10.1743 8.00006C10.1743 4.63739 9.23509 1.91138 7.99976 1.91138" stroke="currentColor"></path><path d="M7.99973 14.0889C6.76445 14.0889 5.8252 11.3629 5.8252 8.00006C5.8252 4.63739 6.76445 1.91138 7.99973 1.91138" stroke="currentColor"></path></svg>',
  subagents: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M6.51867 12.3282C7.29816 12.6011 8.16475 12.6514 9.02269 12.4216C9.57879 12.2726 10.0784 12.0185 10.5087 11.6888C10.7819 12.0555 11.1606 12.3304 11.5913 12.4805C10.9688 13.029 10.2149 13.4478 9.35911 13.6771C8.13946 14.0038 6.90632 13.8971 5.82126 13.4533C6.15821 13.1562 6.4021 12.7652 6.51867 12.3282ZM9.17629 2.89409C11.1101 3.34433 12.739 4.81872 13.2889 6.87043C13.4219 7.3665 13.4811 7.8649 13.4774 8.35466C13.0924 8.13213 12.6422 8.01837 12.1741 8.05276L12.1711 8.05257C12.1539 7.77199 12.109 7.48889 12.0334 7.20684C11.6363 5.72533 10.5048 4.6372 9.13549 4.22844C9.25559 3.87667 9.29214 3.49087 9.22309 3.09892C9.2108 3.02922 9.19451 2.96108 9.17629 2.89409ZM4.7311 3.89107L4.78302 4.11879C4.87648 4.4488 5.04146 4.74263 5.25579 4.98896C3.98078 6.01355 3.35848 7.72904 3.8089 9.41059C3.81828 9.44559 3.82866 9.48025 3.83885 9.51479C3.38217 9.61268 2.98548 9.84137 2.68107 10.1556C2.63414 10.022 2.5897 9.88632 2.55244 9.74726C1.93301 7.43489 2.86717 5.07173 4.71504 3.76697L4.7311 3.89107Z" fill="currentColor"></path><path d="M7.99136 5.28105C8.87501 5.28105 9.59136 4.56471 9.59136 3.68105C9.59136 2.7974 8.87501 2.08105 7.99136 2.08105C7.1077 2.08105 6.39136 2.7974 6.39136 3.68105C6.39136 4.56471 7.1077 5.28105 7.99136 5.28105Z" stroke="currentColor"></path><path d="M3.94009 12.9417C4.82374 12.9417 5.54009 12.2254 5.54009 11.3417C5.54009 10.458 4.82374 9.7417 3.94009 9.7417C3.05643 9.7417 2.34009 10.458 2.34009 11.3417C2.34009 12.2254 3.05643 12.9417 3.94009 12.9417Z" stroke="currentColor"></path><path d="M12.0851 12.9417C12.9688 12.9417 13.6851 12.2254 13.6851 11.3417C13.6851 10.458 12.9688 9.7417 12.0851 9.7417C11.2015 9.7417 10.4851 10.458 10.4851 11.3417C10.4851 12.2254 11.2015 12.9417 12.0851 12.9417Z" stroke="currentColor"></path></svg>',
  plan: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M4.9375 5.90295H11.0625" stroke="currentColor"></path><path d="M4.9375 9.02991H8.27841" stroke="currentColor"></path><path d="M12.5 1.32617C13.3039 1.32617 14 1.95171 14 2.77637V7.61328L13 8.68164V2.77637C13 2.55186 12.8007 2.32617 12.5 2.32617H3.5C3.1993 2.32617 3 2.55186 3 2.77637V13.2246C3.00044 13.4489 3.19963 13.6738 3.5 13.6738H8.32812L7.39258 14.6738H3.5C2.69637 14.6738 2.00042 14.0489 2 13.2246V2.77637C2 1.95171 2.69613 1.32617 3.5 1.32617H12.5Z" fill="currentColor"></path><path d="M8.97212 14.3693C9.17511 14.5723 9.37811 14.7753 9.5811 14.9783C9.67012 14.8953 9.75914 14.8123 9.84815 14.7293C11.4505 13.2352 13.0528 11.7411 14.6551 10.247C14.7441 10.164 14.8331 10.081 14.9221 9.99803C14.5989 9.6748 14.2756 9.35157 13.9524 9.02834C13.8694 9.11736 13.7864 9.20637 13.7034 9.29539C12.2093 10.8977 10.7152 12.5 9.22113 14.1023C9.13813 14.1913 9.05513 14.2803 8.97212 14.3693Z" fill="currentColor"></path><path d="M11.6323 13.7841C11.6323 14.0395 11.6323 14.295 11.6323 14.5504C11.6812 14.5523 11.7301 14.5543 11.779 14.5562C12.659 14.5913 13.539 14.6263 14.419 14.6614C14.4679 14.6633 14.5168 14.6653 14.5657 14.6672C14.5657 14.3339 14.5657 14.0006 14.5657 13.6672C14.5168 13.6692 14.4679 13.6711 14.419 13.6731C13.539 13.7081 12.659 13.7432 11.779 13.7783C11.7301 13.7802 11.6812 13.7821 11.6323 13.7841Z" fill="currentColor"></path></svg>',
  questions: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5Z" stroke="currentColor"></path><path d="M5.75 6.69646C5.75 6.29865 5.88196 5.90976 6.12919 5.57899C6.37643 5.24821 6.72783 4.99041 7.13896 4.83817C7.5501 4.68593 8.0025 4.6461 8.43895 4.72371C8.87541 4.80132 9.27632 4.99289 9.59099 5.27419C9.90566 5.55549 10.12 5.91388 10.2068 6.30406C10.2936 6.69423 10.249 7.09866 10.0787 7.4662C9.90843 7.83373 9.62004 8.14787 9.25003 8.36889C9.19476 8.4019 9.13803 8.43262 9.08004 8.46099C8.52566 8.73217 8 9.20817 8 9.82532" stroke="currentColor"></path><path d="M8 10.7416V11.7416" stroke="currentColor"></path></svg>',
  tools: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M5.875 3C5.875 6.33333 7.54167 8 10.875 8C7.54167 8 5.875 9.66667 5.875 13C5.875 9.66667 4.20833 8 0.875 8C4.20833 8 5.875 6.33333 5.875 3Z" stroke="currentColor"></path><path d="M12.375 1.55823C12.375 3.39156 13.2917 4.30823 15.125 4.30823C13.2917 4.30823 12.375 5.22489 12.375 7.05823C12.375 5.22489 11.4583 4.30823 9.625 4.30823C11.4583 4.30823 12.375 3.39156 12.375 1.55823Z" stroke="currentColor"></path><path d="M12.375 10.4418C12.375 11.7751 13.0417 12.4418 14.375 12.4418C13.0417 12.4418 12.375 13.1084 12.375 14.4418C12.375 13.1084 11.7083 12.4418 10.375 12.4418C11.7083 12.4418 12.375 11.7751 12.375 10.4418Z" stroke="currentColor"></path></svg>',
  context: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke-width="1"><path d="M5 2.5H3.5C3.23478 2.5 2.98043 2.60536 2.79289 2.79289C2.60536 2.98043 2.5 3.23478 2.5 3.5V13.5C2.5 13.7652 2.60536 14.0196 2.79289 14.2071C2.98043 14.3946 3.23478 14.5 3.5 14.5H12.5C12.7652 14.5 13.0196 14.3946 13.2071 14.2071C13.3946 14.0196 13.5 13.7652 13.5 13.5V3.5C13.5 3.23478 13.3946 2.98043 13.2071 2.79289C13.0196 2.60536 12.7652 2.5 12.5 2.5H11" stroke="currentColor"></path><path d="M8 0.5V7.5" stroke="currentColor"></path><path d="M5.5 5L8 7.5L10.5 5" stroke="currentColor"></path><path d="M5.5 11H10.5" stroke="currentColor"></path></svg>',
}
    const h = react.createElement
    const { useState, useEffect, useLayoutEffect, useCallback, useRef } = react

    /**
     * 下载任务放在模块级：Host 一旦认领这条下载，前端重启多少次都只是「重新贴上去看进度」，
     * 所以这里存的是从 `download/status` 同步来的快照，不持有任何句柄。
     */
    const LIVE_DOWNLOADS = new Map()
    /** 已经提示过失败的 Host 任务（`key:startedAt`），避免每轮轮询都弹一次。 */
    const FAILED_NOTICE = new Set()
    /**
     * 文案里对「另一台机器」的简称：界面只认这一处，换称呼改这一行即可。
     * 实现笔记与代码注释仍沿用「对端 / 他端」这两个技术代称，不进界面。
     */
    const PEER_NOUN = '节点'
    /** 一个工作区默认露出的会话行数，其余折在「展开其余 N 个会话」一行里（原生 `SESSION_WATERMARK_BASE`）。 */
    const SESSION_WATERMARK_BASE = 5
    /** 刚点过取消的本地 key → 时间戳：Host 清理有延迟，这段时间内不把任务贴回来。 */
    const CANCELLING = new Map()
    /** `<peerId>:<对端路径>` → 本机是否已有副本（「显示文件位置」据此决定是否可点、要不要置灰）。 */
    const REVEAL_READY = new Map()
    /** 「显示文件位置」点下去后固定显示「正在打开…」的时长：explorer 起窗本身就在 2 秒上下。 */
    const REVEAL_FEEDBACK_MS = 2000
    /**
     * 刚点了「下载」、字节还没开始流动的窗口：`<peerId>:<对端路径>` → `{ key, path, startedAt }`。
     * 卡片在这段时间显示 loading（转圈），第一块字节写下去才切进度。
     */
    const STARTING = new Map()
    /**
     * 点了「打开」但本机还没有副本：`<peerId>:<对端路径>` → `{ id, path }`。
     * 打开要走同一条取字节链路，下载格照常转圈/走进度；下完由轮询这一侧回手去开。
     */
    const OPEN_WHEN_READY = new Map()
    /** 等不到第一条 status 的「刚点下载」窗口上限：超时就没收，不让卡片一直转圈。 */
    const STARTING_TIMEOUT_MS = 8000
    /**
     * 下载记账键：卡片给的是拼接后的展示路径，Host 给的是对端原始路径，两者在 `\` 与 `/`
     * 上可能不一致（`join` 会混出 `C:\a/b`）。键必须收敛成同一个，否则失败/完成状态贴不到卡片上。
     */
    function transferKeyOf(peerId, path) {
      const peer = typeof peerId === 'string' ? peerId : ''
      const clean = typeof path === 'string' ? path.replace(/[/\\]+/gu, '\\') : String(path ?? '')
      return `${peer}:${clean}`
    }

    /**
     * 下载失败的文案：Host 旧版本只回裸的 HTTP 码，这里补成人能读的说明
     * （404 就是对端那份文件已经不在了，通常是清理 / 移动过）。
     */
    function downloadFailureText(failure) {
      const text = String(failure ?? '未知错误')
      if (/HTTP 404/u.test(text)) return '对端上没有这份文件（可能已被清理或移动）'
      return text
    }
    /**
     * 单例视口观察器：卡片/图片进视口才回调一次 `onEnter`（结果由各自的缓存兜住，
     * 重复挂载只会在缓存命中时立刻出值，不再产生请求）。`rootMargin` 提前 320px 预取，
     * 滚到边缘时图/大小已经就位，看起来不像懒加载。
     */
    const VISION = (() => {
      let observer = null
      /** `Element → { key, onEnter }`：同一元素换了内容（列表重建复用节点）时按 key 重新观察。 */
      const watched = new Map()
      function ensure() {
        if (observer !== null) return observer
        if (typeof IntersectionObserver !== 'function') return null
        observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const item = watched.get(entry.target)
            if (item === undefined) continue
            // 只触发一次：触发后取消观察，元素再次进视口时由调用方的缓存决定要不要再问。
            watched.delete(entry.target)
            observer.unobserve(entry.target)
            item.onEnter()
          }
        }, { rootMargin: '320px 0px' })
        return observer
      }
      return {
        /**
         * @param element - 要观察的 DOM 节点
         * @param key - 内容标识（换内容时即使复用同一节点也要重新观察）
         * @param onEnter - 进入（含贴近）视口时调用一次
         */
        watch(element, key, onEnter) {
          if (element === null || element === undefined) return
          const shared = ensure()
          if (shared === null) { onEnter(); return }
          const item = watched.get(element)
          if (item !== undefined && item.key === key) return
          if (item !== undefined) shared.unobserve(element)
          watched.set(element, { key, onEnter })
          shared.observe(element)
        },
        /** 卸载时撤掉观察（`null` 节点直接忽略）。 */
        release(element) {
          if (element === null || element === undefined) return
          watched.delete(element)
          if (observer !== null) observer.unobserve(element)
        },
      }
    })()

    /**
     * 提问里的图片要按 `session/attachment` 从对端取字节，取到后是一次性的 blob URL。
     * 放在模块级：切会话或关面板重进时不必再向对端要一遍同一张图；
     * `PEER_IMAGE_READY` 再存一份可直接用的 URL，让重新挂载的那一帧就有图、不必先闪一下占位。
     */
    const PEER_IMAGE_URLS = new Map()
    const PEER_IMAGE_READY = new Map()
    /** 就绪图片 URL 的上限：超出后淘汰最久未用的（只丢引用，不 revoke，免得正在显示的那张白屏）。 */
    const PEER_IMAGE_READY_LIMIT = 120
    const downloadWatchers = new Set()
    const downloadSnapshot = () => {
      const jobs = [...LIVE_DOWNLOADS.values()].map((job) => ({
        key: job.key, path: job.path, loaded: job.loaded, total: job.total, phase: job.phase, startedAt: job.startedAt ?? 0,
      }))
      for (const item of STARTING.values()) {
        if (jobs.some((job) => job.key === item.key)) continue
        jobs.push({ key: item.key, path: item.path, loaded: 0, total: item.total, phase: 'starting', startedAt: item.startedAt ?? 0 })
      }
      return jobs
    }
    const notifyDownloads = () => { for (const watcher of downloadWatchers) watcher() }

    /** 浮层通用关闭：打开时监听空白点击与 Esc，关闭即摘监听。 */
    function useDismiss(active, close) {
      useEffect(() => {
        if (!active) return
        const onKeyDown = (event) => { if (event.key === 'Escape') close() }
        // 打开浮层的那一次点击还在冒泡：React 会在离散事件末尾同步跑 effect，
        // 直接挂 window click 会当场把刚打开的浮层关掉，所以延后一拍再挂。
        const timer = setTimeout(() => { window.addEventListener('click', close) }, 0)
        window.addEventListener('keydown', onKeyDown)
        return () => {
          clearTimeout(timer)
          window.removeEventListener('click', close)
          window.removeEventListener('keydown', onKeyDown)
        }
      }, [active])
    }

    /**
     * 浮层关闭（原生 `useDismissOnOutsidePointer` 口径）：捕获阶段听 `pointerdown`，
     * 点在锚点（`[data-rp-anchor]`）或浮层自身（`[data-dsh-popup]`）里就不关。
     * 这样点了别的面包屑、行、按钮都会关掉，不像 `click` 那样被 `stopPropagation` 挡掉。
     */
    function useDismissOutside(active, close) {
      useEffect(() => {
        if (!active) return
        const onKeyDown = (event) => { if (event.key === 'Escape') close() }
        const onPointerDown = (event) => {
          const target = event.target
          if (target instanceof Element && (target.closest('[data-rp-anchor]') !== null || target.closest('[data-dsh-popup]') !== null)) return
          close()
        }
        window.addEventListener('pointerdown', onPointerDown, true)
        window.addEventListener('keydown', onKeyDown)
        return () => {
          window.removeEventListener('pointerdown', onPointerDown, true)
          window.removeEventListener('keydown', onKeyDown)
        }
      }, [active])
    }

    /** 菜单项/列表项的 hover 底色：进场刷一层 token，离场回透明（原生 `.menuItem:hover` 的等价写法）。 */
    function hoverBackdrop(token) {
      return {
        onMouseEnter: (event) => { event.currentTarget.style.background = token },
        onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent' },
      }
    }

    /** 宿主共享的 Markdown 渲染器与文件类型图标：能取到就复用原生实现。 */
    let hostPrimitives = null
    try {
      hostPrimitives = require('@deepseek-ai/dsh-client-ui-primitives') ?? null
    } catch {
      // 未物化该模块时退回本地极简渲染。
      hostPrimitives = null
    }
    const hostMarkdown = hostPrimitives?.MarkdownText ?? null
    const MarkdownDelegateProvider = hostPrimitives?.MarkdownDelegateProvider ?? null
    /**
     * `MarkdownText` 只在有 `fileImages` 委托时才把图片包成按钮（点击开 `ImageLightbox`、
     * 悬停手形）。这里声明一份空拖拽实现：拖动图片不接管，点了照常开原图。
     */
    const NOOP_FILE_DRAG = {
      prepare: () => Promise.resolve({ start: () => false, release: () => {} }),
      reportFailure: () => {},
    }
    const HostFileTypeIcon = hostPrimitives?.FileTypeIcon ?? null
    /* 原生聊天里的 Markdown 文案（`ui-chat/src/client/markdown-labels.ts`）：带 `toolbarLabels`
   才会走共享代码卡片的标题栏（语言名或「代码块」+ 换行/复制图标），否则是旧的纯文本「复制」。 */
const markdownLabels = {
  code: {
    copyLabel: '复制',
    copiedLabel: '已复制',
    toolbarLabels: { codeLabel: '代码块', wrapLabel: '自动换行', unwrapLabel: '取消自动换行' },
  },
  footnotes: '脚注',
}



    /** 原生宽度偏好键（`ConversationWidthControls` 写的同一个 localStorage）。 */
    const WIDTH_PREF_KEY = 'dsh.conversation.contentWidth'
    const CONTENT_MIN = 640
    const CONTENT_EDGE_BUDGET = 176

    /**
     * 算出消息列的内容宽度（px），与原生 `resolveContentWidth` 同一步骤：
     * 有用户偏好就用偏好（夹在 640 与 列宽 - 176 之间），否则 clamp(680, 列宽 × 0.64, 920)。
     */
    function resolveContentWidth(column) {
      if (!(column > 0)) return 920
      const max = Math.max(CONTENT_MIN, column - CONTENT_EDGE_BUDGET)
      let preference = null
      try {
        const raw = window.localStorage.getItem(WIDTH_PREF_KEY)
        if (raw !== null) {
          const value = Number(raw)
          if (Number.isFinite(value) && value > 0) preference = value
        }
      } catch {
        /* 隐私模式禁用 localStorage 时退回默认轴。 */
      }
      if (preference !== null) return Math.min(Math.max(preference, CONTENT_MIN), max)
      return Math.max(680, Math.min(column * 0.64, 920))
    }

    /** 注入滚动条/占位等只能写成 CSS 的皮肤；已存在的旧标签直接改写内容，插件热重载后新规则才能落地。 */
    function ensureScrollSkin() {
      if (typeof document === 'undefined') return
      const existing = document.querySelector('style[data-remote-peers-skin]')
      if (existing !== null) {
        if (existing.textContent !== SCROLL_SKIN) existing.textContent = SCROLL_SKIN
        return
      }
      const element = document.createElement('style')
      element.setAttribute('data-remote-peers-skin', '')
      element.textContent = SCROLL_SKIN
      document.head.appendChild(element)
    }

    const PANEL_ID = 'remote-peers'
    /**
     * 左栏入口的 order 基数：`sidebar.panellist` 按 order 升序、同值按注册顺序，
     * 原生入口只用到 0/10 这种小值，所以给本插件一个远离它们的大基数 ——
     * 「远程端」占 base，各他端占 base+1+index，保证这一块紧挨着且整体在该槽位最末。
     */
    const PANEL_ORDER_BASE = 1_000_000

    /** 面板宽度约定：与 main 列一致，自身负责滚动。 */

    /** 面板组件：所有数据经本机 Host 的 /remote-peers 通道取得。 */
    /** 类组件基类：宿主 react 一定有 `Component`，探针桩可能没有，缺就退化成最小基类。 */
    const ComponentBase = react.Component ?? class { constructor(props) { this.props = props; this.state = null } }

    /**
     * 面板的错误边界：渲染抛异常时原生只会留一块空白，这里换成可读的错误卡（含消息与首行栈），
     * 同时把异常经 Host 的 `diag` 端点写进 stateDir/diag.log（渲染器没有控制台可看）。
     */
    class PanelBoundary extends ComponentBase {
      static isReactComponent = true

      static getDerivedStateFromError(failure) {
        return { failure }
      }

      constructor(props) {
        super(props)
        this.state = { failure: null }
      }

      componentDidCatch(failure) {
        this.props.onFailure?.(failure)
      }

      render() {
        if (this.state.failure === null) return this.props?.children
        const failure = this.state.failure
        return h('div', { style: { padding: 16, fontFamily: 'inherit', fontSize: 13, color: T.pri, whiteSpace: 'pre-wrap' } },
          h('div', { style: { fontWeight: 600, marginBottom: 8 } }, '远程端面板渲染失败'),
          h('div', { style: { color: T.sec, marginBottom: 8 } }, String(failure?.message ?? failure)),
          h('div', { style: { color: T.ter, fontSize: 12 } }, String(failure?.stack ?? '')),
        )
      }
    }

    /** 把渲染器一侧的异常落到 Host 的 diag.log（失败就静默，不能反过来影响界面）。 */
    function reportClientFailure(api, kind, failure) {
      try {
        void api.call('diag', {
          kind,
          message: String(failure?.message ?? failure).slice(0, 400),
          stack: String(failure?.stack ?? '').slice(0, 2000),
        }).catch(() => {})
      } catch { /* 上报失败不影响界面 */ }
    }

    function RemotePeersPanel(injected) {
      /** 由左栏「远程 · 机器名」入口传入：为真时直接进入该端，只显示会话区。 */
      const focusPeer = injected.focusPeer
      const onPeersChanged = injected.onPeersChanged
      const [status, setStatus] = useState(null)
      const [peers, setPeers] = useState([])
      const [error, setError] = useState('')
      const [busy, setBusy] = useState('')
      const [tokenVisible, setTokenVisible] = useState(false)
      const [editing, setEditing] = useState(null)
      /** 待删除的他端：非 null 时弹确认框（删除不可逆，不直接执行）。 */
      const [peerDelete, setPeerDelete] = useState(null)
      /** 重置共享密钥前先确认（重置会让已登记本机的他端全部失效）。 */
      const [tokenResetAsk, setTokenResetAsk] = useState(false)
      /** 待确认取消的下载：非 null 时弹确认框（大文件点错就没了，先问一句）。 */
      const [downloadCancelAsk, setDownloadCancelAsk] = useState(null)
      /** 复制密钥的回执：短暂把按钮换成「已复制 ✓」。 */
      const [tokenCopied, setTokenCopied] = useState(false)
      /** 他端表单的必填校验提示：只有点过保存才显示。 */
      const [peerFormError, setPeerFormError] = useState('')
      /** 局域网地址逐条复制的回执：记下刚复制的那一条。 */
      const [copiedAddress, setCopiedAddress] = useState('')
      /** 「打开 / 显示位置」的结果提示：动作发生在对端桌面，本机必须给一句回执。 */
      const [openNotice, setOpenNotice] = useState(null)
      const openNoticeTimer = useRef(0)
      const tokenCopiedTimer = useRef(0)
      const addressCopiedTimer = useRef(0)
      useEffect(() => () => {
        clearTimeout(tokenCopiedTimer.current)
        clearTimeout(addressCopiedTimer.current)
        clearTimeout(openNoticeTimer.current)
      }, [])
      /** 统一回执 toast：成功 2.4s；失败默认 8s（失败内容要看得清，不能一闪就没）。 */
      const notice = useCallback((text, ok, holdMs) => {
        setOpenNotice({ text, ok })
        clearTimeout(openNoticeTimer.current)
        openNoticeTimer.current = setTimeout(() => setOpenNotice(null), holdMs ?? (ok ? 2400 : 8000))
      }, [])
      const [activePeer, setActivePeer] = useState('')
      /**
       * 正文图片的对端字节缓存：原生 `MarkdownText` 的 `pathImages` 只接受
       * 绝对 URL（http/https/blob/data 或 `dsh-app://app/api/file?`），
       * 本机转发路由是相对路径，所以先把对端字节取回来做成 `blob:` URL。
       * 键是 `<peer>|<对端绝对路径>`，取回来之前一律留 alt 文本。
       */
      const [imageUrls, setImageUrls] = useState({})
      /** 已发出的图片字节请求（同路径只取一次）与 blob URL 的同步镜像（供卸载时回收）。 */
      const imagePendingRef = useRef(new Set())
      const imageUrlsRef = useRef({})
      /** 每轮产出文件的扫描缓存（键带事件条数，翻页/流式都会自然失效）。 */
      const turnFilesCacheRef = useRef(new Map())
      /** 换对端或离开时回收上一批 blob URL（否则每张图都会常驻内存）。 */
      useEffect(() => {
        for (const url of Object.values(imageUrlsRef.current)) URL.revokeObjectURL(url)
        imageUrlsRef.current = {}
        imagePendingRef.current.clear()
        setImageUrls((previous) => (Object.keys(previous).length === 0 ? previous : {}))
      }, [activePeer])
      const [ping, setPing] = useState({})
      const [sessions, setSessions] = useState([])
      const [openSession, setOpenSession] = useState(null)
      const [messages, setMessages] = useState([])
      const [liveText, setLiveText] = useState('')
      /** 正在流的思考原文：原生渲染成 24px 的「思考」折叠行，正文区不出现。 */
      const [liveReasoning, setLiveReasoning] = useState('')
      const [liveReasoningOpen, setLiveReasoningOpen] = useState(false)
      /** 草稿按会话分开存（原生 draft 属于该会话）：切走再切回来还在框里。 */
      const [draftBySession, setDraftBySession] = useState({})
      const draftKey = `${activePeer}:${openSession}`
      const promptText = draftBySession[draftKey] ?? ''
      function setPromptTextFor(peerId, sessionId, value) {
        const key = `${peerId}:${sessionId}`
        setDraftBySession((previous) => {
          if ((previous[key] ?? '') === value) return previous
          if (value === '') {
            if (previous[key] === undefined) return previous
            const next = { ...previous }
            delete next[key]
            return next
          }
          return { ...previous, [key]: value }
        })
      }
      function setPromptText(value) { setPromptTextFor(activePeer, openSession, value) }
      const [sending, setSending] = useState(false)
      /** 对端正在跑的这一轮起始时间（ms），0 表示空闲；用来画「正在分析请求 / 正在思考，用时 N 秒…」。 */
      const [turnStartedAt, setTurnStartedAt] = useState(0)
      /** 每秒 +1，只为让「用时 N 秒」这行重新渲染一次。 */
      const [clockTick, setClockTick] = useState(0)
      /** 对端请求的审批/提问（forwarded waterfall）。 */
      const [interactions, setInteractions] = useState([])
      /** 对端工作区基线：分组用它的 title/path/sessionIds。 */
      const [workspaces, setWorkspaces] = useState([])
      const [archivedIds, setArchivedIds] = useState([])
      /** 置顶集合（原生 `WorkspaceBaseline.pinnedSessionIds`，最近的在前）。 */
      const [pinnedIds, setPinnedIds] = useState([])
      /** 会话列表的视图选项：分组方式 `workspace`（按工作区）| `tree`（按工作区树）| `list`（单列表）。 */
      const [groupMode, setGroupMode] = useState('workspace')
      /** 筛选会话：`hide` 隐藏已归档（默认）| `all` 全部对话 | `only` 仅显示已归档。 */
      const [archiveFilter, setArchiveFilter] = useState('hide')
      /** 会话搜索：开关 + 关键词（原生「搜索会话名称」输入框）。 */
      const [sessionSearchOpen, setSessionSearchOpen] = useState(false)
      const [sessionQuery, setSessionQuery] = useState('')
      /** 「视图选项」浮层：`{ top, right }`，null 表示关闭。 */
      const [viewMenu, setViewMenu] = useState(null)
      /**
       * 远程端页面的去向：`null` 跟随宿主注入的 `focusPeer`；`'list'` 回到远程端列表；
       * 其他值是本地点「进入」后要看的那个他端 id。
       */
      const [focusNav, setFocusNav] = useState(null)
      /** 会话树的折叠状态：key 不存在即展开（默认看得到会话）。 */
      const [sessionTreeOpen, setSessionTreeOpen] = useState({})
      /** present 卡片上要显示的对端文件大小：`<peerId>:<绝对路径>` → 字节数。 */
      const [fileSizes, setFileSizes] = useState({})
      /**
       * `<peerId>:<对端路径>` → 本机已有完整副本。与 `fileSizes` 一起从同一次 `file/sizes`
       * 批量探回来（Host 顺带做本地 stat，不额外走网络）；命中的卡片按钮显示「已下载」。
       */
      const [localCopies, setLocalCopies] = useState({})
      /** 已经问过「本机有没有副本」的 key，避免每帧重复探（结果在 `localCopies` 里）。 */
      const localProbedRef = useRef(new Set())
      /** `<peerId>:<对端路径>` → 正在等资源管理器把窗口弹出来（菜单项就地显示「正在打开…」）。 */
      const [revealing, setRevealing] = useState({})
      /** 正在问大小的键，避免每次渲染重复发起。 */
      const sizePendingRef = useRef(new Set())
      /** 刚报过失败的 `<peerId>:<路径>`：任务从 Host 表里消失时据此区分「成功落盘」和「失败退场」。 */
      const failedKeysRef = useRef(new Set())
      /** 下完就打开：轮询到任务落盘时回调（ref 里始终是最新的打开函数）。 */
      const openIntentRef = useRef(null)
      /** 「打开」复用「下载」的取字节链路（ref 里始终是最新的 downloadPeerPath）。 */
      const downloadPeerRef = useRef(null)
      /** 正在为哪个工作区建新会话（工作区 id），空串表示没有在飞。 */
      const [creatingIn, setCreatingIn] = useState('')
      /** 打开的工作区 ⋯ 菜单：`{ workspaceId, title, top, left }`，null 表示关着。 */
      const [wsMenu, setWsMenu] = useState(null)
      /** 打开的会话行 ⋯ 菜单：`{ sessionId, title, top, left }`，null 表示关着。 */
      const [sessionMenu, setSessionMenu] = useState(null)
      /** 各工作区的会话水位：`{ [groupKey]: 露出条数 }`；缺省按 `SESSION_WATERMARK_BASE`，`Infinity` 表示全展开。 */
      const [sessionMarks, setSessionMarks] = useState({})
      /** 重命名工作区对话框：`{ workspaceId, title }`（title 是确认时的基线，不是草稿）。 */
      const [renameAsk, setRenameAsk] = useState(null)
      /** 重命名会话对话框：`{ sessionId, title }`（与工作区共用草稿/忙碌/错误三个状态）。 */
      const [sessionRenameAsk, setSessionRenameAsk] = useState(null)
      const [renameDraft, setRenameDraft] = useState('')
      const [renaming, setRenaming] = useState(false)
      const [renameError, setRenameError] = useState('')
      /** 对端模型目录（session/modelCatalog），用于输入区右侧的模型名与切换。 */
      const [catalog, setCatalog] = useState(null)
      /** 对端 Agent 预设清单（agentPresets/list），用来把 agentPreset id 显示成名字。 */
      const [presets, setPresets] = useState([])
      /** 对端权限预设（沙箱模式）：catalog + 当前会话选中的那条。 */
      const [permissionOptions, setPermissionOptions] = useState([])
      const [permissionPreset, setPermissionPreset] = useState(null)
      /** 目录里的默认档：会话没有 `permission/preset` 事件时按它显示（原生同样常显）。 */
      const [permissionDefault, setPermissionDefault] = useState(null)
      const [permissionOpen, setPermissionOpen] = useState(false)
      const [permissionBusy, setPermissionBusy] = useState(false)
      /** 待确认的危险档（完全权限要二次确认，与原生一致）。 */
      const [permissionPending, setPermissionPending] = useState(null)
      /** 「我已了解风险」勾选：不勾选时确认按钮禁用。 */
      const [permissionRiskAck, setPermissionRiskAck] = useState(false)
      /** 当前远端会话的模型选择 {provider, model, reasoningEffort}。 */
      const [selection, setSelection] = useState(null)
      const [modelBusy, setModelBusy] = useState(false)
      const [pickerOpen, setPickerOpen] = useState(false)
      const [pickerSection, setPickerSection] = useState('root')
      /** 会话原始事件（快照 + 实时），用于轮/步/用量/缓存/上下文这些状态指标。 */
      const [rawEvents, setRawEvents] = useState([])
      /** 对端 `session/projections` 的投影值（sessionStats / tokenUsage / contextPressure）。 */
      const [projections, setProjections] = useState(null)
      /**
       * 派生摘要的增量状态，按 `${session}:${turn}` 缓存：`{ scanned, lastEvent, calls, files, summary }`。
       * 必须与其它 hooks 一起声明 —— 放在组件提前 `return` 之后会因未初始化而在会话页抛 TDZ。
       */
      const derivedChangesRef = useRef(new Map())
      /** 已向前翻页的历史记录（`session/events` 的 `beforeSeq` 页），比当前窗口更早。 */
      const olderRecordsRef = useRef([])
      /** 向前翻页状态：`loading` 防重入，`hasMore` 来自对端 `hasMore`。 */
      const olderStateRef = useRef({ loading: false, hasMore: false })
      /** `hasMore` 的可渲染镜像 —— 顶部那条 `加载更早的消息 / 已到会话开头` 提示要跟着变。 */
      const [historyMore, setHistoryMore] = useState(false)
      /** `rawEvents` 的同步镜像，供回调里重建消息列表（避免闭包读到旧值）。 */
      const eventsMirrorRef = useRef([])
      /** 已由 `session/follow` 快照接管消息的会话；首屏那次 `session/events` 晚到时不得覆盖它。 */
      const snapshotSessionRef = useRef('')
      /** 轮次导航：当前视口所在的轮（高亮那一根刻度）。 */
      const [railTurn, setRailTurn] = useState(null)
      /** 轮次导航：鼠标悬停/聚焦的轮（显示预览卡）。 */
      const [railPreview, setRailPreview] = useState(null)
      /** 「已完成」行的展开态，按轮号记 —— 原生 `turnProcess.open`。 */
      const [processOpen, setProcessOpen] = useState({})
      /** 第一层分组（`执行了命令` 那行）的展开态，同样按轮号记。 */
      const [processGroupOpen, setProcessGroupOpen] = useState({})
      /**
       * 第二层明细块的限高滚动位置（原生 `useProcessScroll` 的 `edges`），按轮号记：
       * 只有上下还有内容时才在该侧压一条 24px 渐隐，避免截断处像被生硬切掉。
       */
      const [processScroll, setProcessScroll] = useState({})
      /**
       * 切窗口、失焦、指针离开窗口时都没有 `pointerleave` 事件，
       * 悬停态会留在 state 里让预览卡挂住不消失 —— 统一在窗口级事件上清掉。
       */
      useEffect(() => {
        const clear = () => setRailPreview(null)
        document.addEventListener('pointerleave', clear)
        window.addEventListener('blur', clear)
        document.addEventListener('visibilitychange', clear)
        return () => {
          document.removeEventListener('pointerleave', clear)
          window.removeEventListener('blur', clear)
          document.removeEventListener('visibilitychange', clear)
        }
      }, [])
      /** 实时流里的当前轮：用户消息本身不带 turn，用它补齐，供轮次导航与跳转定位。 */
      const currentTurnRef = useRef(null)
      /** 右侧文件预览页签：`{path(对端原路径), absolutePath, description, info}`，null 表示收起。 */
      const [previewTab, setPreviewTab] = useState(null)
      /** 预览面板是否最大化（原生右侧栏的“全屏”控件）。 */
      const [previewFull, setPreviewFull] = useState(false)
      /** 右侧预览里的文件树（原生 `FileNavigator`）开关、搜索词、已加载目录与展开状态。 */
      const [navOpen, setNavOpen] = useState(false)
      const [navQuery, setNavQuery] = useState('')
      const [navDirs, setNavDirs] = useState({})
      const [navExpanded, setNavExpanded] = useState({ '.': true })
      /** 文件树 hover 行（原生 `.row:hover` 的 interactive-bg-hover）。 */
      const [navHover, setNavHover] = useState('')
      /** 预览内容：`{status:'loading'|'ready'|'error', mode?, text?, bytes?, eof?, message?}`。 */
      const [previewState, setPreviewState] = useState({ status: 'idle' })
      const [previewNonce, setPreviewNonce] = useState(0)
      /**
       * 预览组件的类型缓存：`PdfPreview` / `ImagePreview` / `ExcelPreview` 都定义在本组件体内，
       * 每次渲染都会新建函数对象；若直接把新函数当元素类型交给 React，会按「类型变了」整棵卸载重建
       * （表现为预览每隔一次渲染闪一次、像在重新加载）。这里固定第一次拿到的引用。
       */
      const previewTypesRef = useRef(null)
      if (previewTypesRef.current === null) {
        previewTypesRef.current = { pdf: PdfPreview, image: ImagePreview, excel: ExcelPreview }
      }
      /** 页签 hover：原生 `.tab:hover` 的底色与关闭钮显现都由它驱动。 */
      const [previewTabHover, setPreviewTabHover] = useState(false)
      /** 卡片右侧 caret 的位置菜单：`{file, top, right}`。 */
      const [pathMenu, setPathMenu] = useState(null)
      /** 卡片按钮的深色 tooltip：`{text, top, left}`。 */
      const [tooltip, setTooltip] = useState(null)
      /** 刚复制过的消息 key，短暂显示勾选。 */
      const [copiedKey, setCopiedKey] = useState('')
      /** 图标动作行的深色 tooltip：`{key, label, top, left}`，null 表示没有。 */
      const [iconHint, setIconHint] = useState(null)
      /** 「本轮用量」浮层：`{turn, usage, bottom, left}`，null 表示关闭。 */
      const [usageDialog, setUsageDialog] = useState(null)
      /** 底部统计浮层：`{kind:'activity'|'usage'|'context', bottom, left}`，null 表示关闭。 */
      const [statDialog, setStatDialog] = useState(null)
      /** 进行中的卡片下载（模块级任务表的快照）：`[{key, path, loaded, total}]`。 */
      const [downloads, setDownloads] = useState(() => downloadSnapshot())
      useEffect(() => {
        const refresh = () => setDownloads(downloadSnapshot())
        downloadWatchers.add(refresh)
        refresh()
        return () => { downloadWatchers.delete(refresh) }
      }, [])
      /**
       * 落盘的字节由 Host 写，前端只负责「看」：常驻轮询 `download/status`（1.2s），
       * 把 Host 的任务表同步成卡片上的进度。页面/插件重载后新实例第一轮就能长回来，
       * 因为权威数据本来就不在渲染器里。
       */
      useEffect(() => {
        let live = true
        let timer = null
        /** 上一轮同步出去的指纹：内容没变就不 setState —— 整个面板一次重渲染很贵，轮询不能白烧。 */
        let signature = ''
        const sync = async () => {
          if (!live) return
          let list = []
          try {
            const value = await call('download/status')
            list = Array.isArray(value?.transfers) ? value.transfers : []
          } catch {
            timer = setTimeout(sync, 2000)
            return
          }
          if (!live) return
          for (const entry of list) {
            if (typeof entry?.key !== 'string' || typeof entry?.path !== 'string') continue
            const localKey = transferKeyOf(entry.peerId, entry.path)
            const cancelledAt = CANCELLING.get(localKey)
            if (cancelledAt !== undefined) {
              if (Date.now() - cancelledAt < 8000) continue
              CANCELLING.delete(localKey)
            }
            if (entry.phase === 'failed') {
              // Host 已经把失败原样留在任务里 6 秒，这里只负责提示一次。
              STARTING.delete(localKey)
              if (!FAILED_NOTICE.has(`${localKey}:${entry.startedAt}`)) {
                FAILED_NOTICE.add(`${localKey}:${entry.startedAt}`)
                failedKeysRef.current.add(localKey)
                notice(`下载失败：${downloadFailureText(entry.failure)}`, false)
              }
              // 失败多半是「对端已经没有这份文件」：撤回过期的「已下载」标记，这一格恢复成「下载」。
              setLocalCopies((previous) => {
                if (previous[localKey] !== true) return previous
                const next = { ...previous }
                delete next[localKey]
                return next
              })
              LIVE_DOWNLOADS.delete(localKey)
              OPEN_WHEN_READY.delete(localKey)
              // 必须显式通知：这一支只删表不产生新的进度指纹，不通知的话卡片读到的还是旧快照（一直转圈）。
              notifyDownloads()
              continue
            }
            const loaded = Number(entry.loaded) || 0
            const total = Number(entry.total) || 0
            // 还没写出第一块字节：仍是 loading，不算进度（重载后进来看不到 STARTING 时也靠这条兜住）。
            const phase = loaded > 0 ? 'downloading' : 'loading'
            if (loaded > 0) STARTING.delete(localKey)
            const existing = LIVE_DOWNLOADS.get(localKey)
            if (existing !== undefined && existing.loaded === loaded && existing.total === total && existing.phase === phase) continue
            LIVE_DOWNLOADS.set(localKey, {
              key: localKey,
              path: entry.path,
              loaded,
              total,
              phase,
              remote: true,
              startedAt: Number(entry.startedAt) || Date.now(),
              remoteKey: entry.key,
              localPath: typeof entry.localPath === 'string' ? entry.localPath : '',
            })
          }
          for (const localKey of [...LIVE_DOWNLOADS.keys()]) {
            if (list.some((entry) => transferKeyOf(entry.peerId, entry.path) === localKey)) continue
            const gone = LIVE_DOWNLOADS.get(localKey)
            LIVE_DOWNLOADS.delete(localKey)
            // 任务从 Host 表里退场 = 写完改名成功（取消先进 CANCELLING，失败另有标记），
            // 这时本机副本已经是真的，卡片按钮可以直接切到「已下载」。
            if (gone === undefined || gone.loaded <= 0) continue
            if (CANCELLING.has(localKey) || failedKeysRef.current.has(localKey)) continue
            setLocalCopies((previous) => (previous[localKey] === true ? previous : { ...previous, [localKey]: true }))
            // 这一格是「打开」点下来的：字节齐了，回手打开本机副本。
            const intent = OPEN_WHEN_READY.get(localKey)
            if (intent !== undefined) {
              OPEN_WHEN_READY.delete(localKey)
              void openIntentRef.current?.(intent)
            }
          }
          const next = [...LIVE_DOWNLOADS.values()].map((job) => `${job.key}|${job.phase}|${job.loaded}|${job.total}`).join(',')
          // 兜底：点了「下载」但 Host 始终没有认领出这条任务（对端已无此文件、Host 仍在旧版本、
          // 或记账键对不上）。超时就撤掉 loading，卡片恢复成可点的「下载」，绝不一直转圈。
          for (const [localKey, job] of [...STARTING.entries()]) {
            if (Date.now() - (Number(job?.startedAt) || 0) < STARTING_TIMEOUT_MS) continue
            if (list.some((entry) => transferKeyOf(entry.peerId, entry.path) === localKey)) continue
            STARTING.delete(localKey)
            OPEN_WHEN_READY.delete(localKey)
            notifyDownloads()
          }
          // 有任务在跑的 key 一律撤回「已下载」：那只可能是副本被删了在重取（或刚点了下载），
          // 完成后再由上面的退场分支重新标回来。
          if (LIVE_DOWNLOADS.size > 0) {
            setLocalCopies((previous) => {
              let next2 = previous
              for (const localKey of LIVE_DOWNLOADS.keys()) {
                if (next2[localKey] !== true) continue
                if (next2 === previous) next2 = { ...previous }
                delete next2[localKey]
              }
              return next2
            })
          }
          if (next !== signature) {
            signature = next
            notifyDownloads()
          }
          timer = setTimeout(sync, 1200)
        }
        void sync()
        return () => { live = false; if (timer !== null) clearTimeout(timer) }
      }, [])
      /** 正文滚动容器 + 是否跟随尾部（原生 `followingTail`）。 */
      const bodyRef = useRef(null)
      /** 会话列实测宽度 + 内容宽度轴。原生 `ConversationWidthControls` 的做法： 量 body 的 offsetWidth 写成 `--dsh-conversation-column-width`， 内容宽 = clamp(680, 列宽 × 0.64, 920)，并优先沿用用户拖拽过的 l... */
      const [columnWidth, setColumnWidth] = useState(0)
      const paneRef = useRef(null)
      const columnRef = useRef(null)
      /** 消息列实际渲染宽度：宽度轴与输入卡都必须落在这条真实边界上。 */
      const [renderedColumn, setRenderedColumn] = useState(0)
      const contentWidth = resolveContentWidth(columnWidth)
      const columnPx = renderedColumn > 0 && Number.isFinite(renderedColumn) ? renderedColumn : contentWidth
      const cardWidth = `${Math.round(columnPx + 32)}px`
      useEffect(() => {
        const pane = paneRef.current
        if (pane === null || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => { setColumnWidth(pane.offsetWidth) })
        observer.observe(pane)
        setColumnWidth(pane.offsetWidth)
        return () => { observer.disconnect() }
      }, [])
      useEffect(() => {
        const column = columnRef.current
        if (column === null || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => { setRenderedColumn(column.offsetWidth) })
        observer.observe(column)
        setRenderedColumn(column.offsetWidth)
        return () => { observer.disconnect() }
      }, [])
      const followRef = useRef(true)
      /** 最近一次内容变高的时刻（ms）：用来区分「内容长高把滚动位置挤走」和「用户自己上翻」。 */
      const growAtRef = useRef(0)
      /** 上一次 scroll 事件的 scrollTop，用来判断这次位移是往上还是往下。 */
      const lastScrollTopRef = useRef(0)
      /** 用户主动上翻的判据：滚轮上滑 / 触摸 / 上翻键 / 按住拖动的时间戳，只有它们才关闭跟随。 */
      const gestureAtRef = useRef(0)
      const draggingRef = useRef(false)
      useEffect(() => {
        const body = bodyRef.current
        if (body === null) return
        const mark = () => { gestureAtRef.current = Date.now() }
        const onWheel = (event) => { if (event.deltaY < 0) mark() }
        const onKey = (event) => {
          if (event.key === 'ArrowUp' || event.key === 'PageUp' || event.key === 'Home') mark()
        }
        const onDown = () => { draggingRef.current = true; mark() }
        const onUp = () => { draggingRef.current = false }
        body.addEventListener('wheel', onWheel, { passive: true })
        body.addEventListener('touchmove', mark, { passive: true })
        body.addEventListener('keydown', onKey)
        body.addEventListener('pointerdown', onDown)
        window.addEventListener('pointerup', onUp)
        return () => {
          body.removeEventListener('wheel', onWheel)
          body.removeEventListener('touchmove', mark)
          body.removeEventListener('keydown', onKey)
          body.removeEventListener('pointerdown', onDown)
          window.removeEventListener('pointerup', onUp)
        }
      }, [openSession])
      /**
       * 跟随尾部时，内容一变高就把滚动条压回最底：宿主 Markdown 延迟排版、图片载入、
       * 过程行收起展开都会在 rAF 之后才改变高度，只在消息变化时补一次 rAF 跟不上。
       */
      useEffect(() => {
        const column = columnRef.current
        const body = bodyRef.current
        if (column === null || body === null || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => {
          if (!followRef.current) return
          growAtRef.current = Date.now()
          body.scrollTop = body.scrollHeight
        })
        observer.observe(column)
        return () => { observer.disconnect() }
      }, [openSession])
      const [showToBottom, setShowToBottom] = useState(false)
      const [toBottomHover, setToBottomHover] = useState(false)
      /** turn → present 文件清单，实时流里凑到 turn/end 才落卡片。 */
      const presentsRef = useRef(new Map())
      /** turn → `workspace/changes` 事件 seq，用来向对端取该轮改动摘要。 */
      const changesRef = useRef(new Map())
      /** `${sessionId}:${seq}` → 改动摘要 JSON（或 'error'）。 */
      const [changesSummaries, setChangesSummaries] = useState({})
      /** `${sessionId}:${seq}` → 是否展开全部文件（原生 COLLAPSED_ROWS = 4）。 */
      const [changesExpanded, setChangesExpanded] = useState({})
      /** turn → turn/start 时间戳，用来算「已完成，用时 …」。 */
      const turnStartsRef = useRef(new Map())
      /** 「+」添加菜单：文件 / 目标 / 计划 / 压缩 / 下载日志。 */
      const [plusOpen, setPlusOpen] = useState(false)
      /** 待插入的指令（目标、计划）按会话分开存：原生 claim 属于该会话的草稿，切会话各看各的。 */
      const [pendingCommandBySession, setPendingCommandBySession] = useState({})
      /** 草稿在输入框里滚上去了吗：chip 与幽灵提示属于首行，滚动后一起隐藏。 */
      const [chipScrolled, setChipScrolled] = useState(false)
      /** chip 标签的真实排版宽度（canvas 按 chip 自身字体量一次），宽度固定但不留估宽的余量。 */
      const [chipLabelWidth, setChipLabelWidth] = useState(null)
      const pendingCommand = pendingCommandBySession[`${activePeer}:${openSession}`] ?? null
      /** 写入某个会话的 claim；不传 session 就写当前会话（发送/取消只动自己那条）。 */
      function setPendingCommandFor(peerId, sessionId, value) {
        const key = `${peerId}:${sessionId}`
        setPendingCommandBySession((previous) => {
          if (value === null) {
            if (previous[key] === undefined) return previous
            const next = { ...previous }
            delete next[key]
            return next
          }
          return { ...previous, [key]: value }
        })
      }
      function setPendingCommand(value) {
        setPendingCommandFor(activePeer, openSession, value)
      }
      /** 待发附件：图片是缩略图草稿（原生 image draft），其余是文件卡 —— 选中即开始跨端上传。 */
      const [pendingFiles, setPendingFiles] = useState([])
      /** 导出开始的提示弹窗。 */
      const [exportNotice, setExportNotice] = useState(null)
      /** 标题栏「⋯」菜单（复制会话为 Markdown / 下载 Session 日志）。 */
      const [headerOpen, setHeaderOpen] = useState(false)
      /** 复制会话为 Markdown 的结果提示：'success' | 'preparationFailed' | 'clipboardFailed'。 */
      const [copyToast, setCopyToast] = useState(null)
      const fileInputRef = useRef(null)
      const inputRef = useRef(null)
      /** 输入框行内容器（chip + 幽灵提示 + textarea），用来量 chip 右边缘。 */
      const chipLineRef = useRef(null)
      /** commandId → 命令名，用来把 command/done 归属回正确的指令。 */

      const workspaceStreamRef = useRef(null)
      /** 已收过的事件 seq，避免历史与实时流重复。 */
      const seenRef = useRef(new Set())
      /** 当前远端会话的 EventSource。 */
      const streamRef = useRef(null)
      /** 对端 forwarded-event 流的 EventSource 与其 clientId。 */
      const eventsRef = useRef(null)
      const eventClientRef = useRef('')
      const eventsPeerRef = useRef('')

      /** 点空白处收起已弹出的浮层（捕获阶段，同 PopupSelectView / Menu 的 dismiss）。 */
      useEffect(() => {
        if (!plusOpen && !permissionOpen && !pickerOpen && !headerOpen) return
        const onPointerDown = (event) => {
          const target = event.target
          if (target instanceof Element && target.closest('[data-dsh-popup]') !== null) return
          setPlusOpen(false)
          setPermissionOpen(false)
          setPickerOpen(false)
          setHeaderOpen(false)
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        return () => { document.removeEventListener('pointerdown', onPointerDown, true) }
      }, [plusOpen, permissionOpen, pickerOpen, headerOpen])

      /** 复制结果 toast：同一提示停留 3s 后自行消失（准备中的提示不自动消失）。 */
      useEffect(() => {
        if (copyToast === null || copyToast === 'preparing') return undefined
        const timer = setTimeout(() => setCopyToast(null), 3000)
        return () => clearTimeout(timer)
      }, [copyToast])

      const call = injected.api.call
      /** 网关密钥的最新值：SSE 请求头要用它，闭包里可能拿到旧 state。 */
      const tokenRef = useRef('')

      /**
       * 一次转发调用走本机网关的 HTTP 出口（不经浏览器 RPC 通道）：大页历史在这里不会被体积上限截断。
       * `request` 与 RPC 的 `proxy` 同形：`{ id, method, payload }`。
       */
      async function callViaHttp(request) {
        const query = new URLSearchParams({ payload: JSON.stringify(request) })
        const response = await fetch(`/api/remote-peers/call?${query.toString()}`, {
          headers: tokenRef.current === '' ? {} : { authorization: `Bearer ${tokenRef.current}` },
        })
        if (!response.ok) throw new Error(`本机网关返回 ${response.status}`)
        return await response.json()
      }

      /**
       * 读本机网关的 SSE：`EventSource` 无法带 `Authorization`（会 401），
       * 所以统一走 fetch 流，按 `data:` 帧解析后逐帧回调。
       */
      async function openSse(controller, url, onFrame) {
        // 面板刚挂载时 `refresh` 可能还没回来；缺密钥就先补一次，避免流被 401 拦掉。
        if (tokenRef.current === '') {
          try {
            const next = await call('status')
            tokenRef.current = typeof next?.token === 'string' ? next.token : ''
          } catch {
            /* 取不到密钥时照旧发请求，失败由调用方 catch 呈现 */
          }
        }
        const token = tokenRef.current
        const response = await fetch(url, {
          headers: token === '' ? {} : { authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!response.ok || response.body === null) throw new Error(`流连接失败 ${response.status}`)
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (true) {
          const { value, done } = await reader.read()
          if (done) return
          buffer += decoder.decode(value, { stream: true }).replace(/\r\n/gu, '\n')
          const blocks = buffer.split('\n\n')
          buffer = blocks.pop() ?? ''
          for (const block of blocks) {
            const line = block.split('\n').find((part) => part.startsWith('data:'))
            if (line === undefined) continue
            let frame
            try { frame = JSON.parse(line.slice(5).trim()) } catch { continue }
            onFrame(frame)
          }
        }
      }

      const refresh = useCallback(async () => {
        setBusy('status')
        try {
          const next = await call('status')
          setStatus(next)
          tokenRef.current = typeof next?.token === 'string' ? next.token : ''
          const list = await call('peers/list')
          setPeers(list.peers ?? [])
          if (typeof onPeersChanged === 'function') onPeersChanged(list.peers ?? [])
          setError('')
        } catch (failure) {
          setError(errorText(failure))
        } finally {
          setBusy('')
        }
      }, [call, onPeersChanged])

      useEffect(() => { void refresh() }, [refresh])

      const closeStream = useCallback(() => {
        if (streamRef.current !== null) {
          streamRef.current.abort()
          streamRef.current = null
        }
        setLiveText('')
        setLiveReasoning('')
        setTurnStartedAt(0)
        setPreviewTab(null)
        setPreviewState({ status: 'idle' })
        presentsRef.current = new Map()
        changesRef.current = new Map()
        setChangesSummaries({})
        setChangesExpanded({})
        followRef.current = true
        setShowToBottom(false)
      }, [])

      /** 订阅对端 forwarded events：审批与提问都从这里来。 */
      const closeEvents = useCallback(() => {
        if (eventsRef.current !== null) {
          eventsRef.current.abort()
          eventsRef.current = null
        }
        eventClientRef.current = ''
        eventsPeerRef.current = ''
        setInteractions([])
      }, [])

      const openEvents = useCallback((peerId) => {
        closeEvents()
        eventsPeerRef.current = peerId
        const url = streamUrlOf(peerId, '$events')
        const controller = new AbortController()
        eventsRef.current = controller
        void openSse(controller, url, (frame) => {
          if (frame?.type === 'ready') {
            eventClientRef.current = frame.clientId ?? ''
            return
          }
          if (frame?.type === 'cancel') {
            setInteractions((previous) => previous.filter((item) => item.eventId !== frame.eventId))
            return
          }
          if (frame?.type !== 'waterfall') return
          const entry = describeWaterfall(frame)
          if (entry === undefined) return
          setInteractions((previous) => previous.some((item) => item.eventId === entry.eventId)
            ? previous
            : [...previous, entry])
        }).catch(() => { /* 审批/提问流断开：不重试，重开会话或刷新面板会重建 */ })
      }, [closeEvents])

      /** 订阅对端工作区流：拿工作区名与手动顺序，会话列表据此分组。 */
      const closeWorkspaceStream = useCallback(() => {
        if (workspaceStreamRef.current !== null) {
          workspaceStreamRef.current.abort()
          workspaceStreamRef.current = null
        }
        setWorkspaces([])
        setArchivedIds([])
      }, [])

      const openWorkspaceStream = useCallback((peerId) => {
        closeWorkspaceStream()
        const url = streamUrlOf(peerId, 'workspace/follow')
        const controller = new AbortController()
        workspaceStreamRef.current = controller
        const applyBaseline = (value) => {
          setWorkspaces(Array.isArray(value?.items) ? value.items : [])
          setArchivedIds(Array.isArray(value?.archivedSessionIds) ? value.archivedSessionIds : [])
          setPinnedIds(Array.isArray(value?.pinnedSessionIds) ? value.pinnedSessionIds : [])
        }
        void openSse(controller, url, (frame) => {
          switch (frame?.type) {
            case 'baseline':
            case 'replace':
              applyBaseline(frame.value)
              break
            case 'upsert':
              // 就地替换，保持原有顺序；只有新工作区才追加到末尾
              setWorkspaces((previous) => {
                const index = previous.findIndex((item) => item.workspaceId === frame.workspace?.workspaceId)
                if (index < 0) return [...previous, frame.workspace]
                return previous.map((item, at) => (at === index ? frame.workspace : item))
              })
              break
            case 'remove':
              setWorkspaces((previous) => previous.filter((item) => item.workspaceId !== frame.workspaceId))
              break
            case 'order':
              setWorkspaces((previous) => {
                const byId = new Map(previous.map((item) => [item.workspaceId, item]))
                return frame.workspaceIds.map((id) => byId.get(id)).filter((item) => item !== undefined)
              })
              break
            case 'archived':
              setArchivedIds(Array.isArray(frame.archivedSessionIds) ? frame.archivedSessionIds : [])
              break
            case 'pinned':
              setPinnedIds(Array.isArray(frame.pinnedSessionIds) ? frame.pinnedSessionIds : [])
              break
            default:
              break
          }
        }).catch(() => { /* 工作区流断开：沿用已拉到的分组，重新打开面板会重建 */ })
      }, [closeWorkspaceStream])

      /** 回传一个 waterfall 决定：允许一次 / 拒绝 / 交给下一个处理器。 */
      const answerInteraction = useCallback(async (item, choice) => {
        const clientId = eventClientRef.current
        if (clientId === '') return
        const outcome = choice === 'next'
          ? { kind: 'next' }
          : { kind: 'result', value: choice }
        try {
          await call('proxy', {
            id: eventsPeerRef.current,
            method: '$events/result',
            payload: { args: { clientId, eventId: item.eventId, outcome } },
          })
          setInteractions((previous) => previous.filter((entry) => entry.eventId !== item.eventId))
        } catch (failure) {
          setError(errorText(failure))
        }
      }, [call])

      const loadSessions = useCallback(async (peerId) => {
        setBusy('sessions')
        closeStream()
        setOpenSession(null)
        setMessages([])
        try {
          const result = await call('proxy', { id: peerId, method: 'session/list', payload: { args: { _request: {} } } })
          const envelope = envelopeOf(result, '对端返回失败')
          setSessions(envelope.value?.items ?? [])
          setError('')
          // 会话能读能写之后，立刻挂上审批/提问通道。
          openEvents(peerId)
          // 同时取工作区基线，会话列表按工作区分组。
          openWorkspaceStream(peerId)
        } catch (failure) {
          setSessions([])
          setError(errorText(failure))
          closeEvents()
          closeWorkspaceStream()
        } finally {
          setBusy('')
        }
      }, [call, closeStream, openEvents, closeEvents, openWorkspaceStream, closeWorkspaceStream])

      /** 只刷新会话清单（不动流、不动选中态）：新建/首条消息之后标题与 blank 才会更新。 */
      const refreshSessions = useCallback(async (peerId) => {
        try {
          const result = await call('proxy', { id: peerId, method: 'session/list', payload: { args: { _request: {} } } })
          const envelope = envelopeOf(result, '对端返回失败')
          setSessions(envelope.value?.items ?? [])
        } catch (failure) {
          setError(errorText(failure))
        }
      }, [call])

      /** 回到会话列表（`openSession` 变空）时刷新一次清单，刚建的会话随之带上标题与 blank 状态。 */
      useEffect(() => {
        if (openSession !== null || activePeer === '') return
        void refreshSessions(activePeer)
      }, [openSession === null, activePeer, refreshSessions])

      /** 本轮进行中时每秒重绘一次，让「用时 N 秒」跟着走。 */
      useEffect(() => {
        if (turnStartedAt === 0) return
        const timer = setInterval(() => setClockTick((value) => value + 1), 1000)
        return () => { clearInterval(timer) }
      }, [turnStartedAt])

      /**
       * 跟随尾部时，新消息、流式思考、流式正文都要把滚动条留在最底（原生 follow-tail）。
       * 思考（`liveReasoning`）与折叠态也会改变高度，漏了它们就会出现「思考刚出现就被
       * 输入框挡住、滚动条不动」；正文走宿主 Markdown 时高度是稍后才长出来的，
       * 所以落底后补一帧 rAF 与 120ms 一次的复检。
       */
      useEffect(() => {
        if (!followRef.current) return
        const stick = () => {
          const element = bodyRef.current
          if (element === null || !followRef.current) return
          element.scrollTop = element.scrollHeight
          setShowToBottom(false)
        }
        stick()
        const raf = requestAnimationFrame(() => { stick(); requestAnimationFrame(stick) })
        const timer = setTimeout(stick, 120)
        return () => { cancelAnimationFrame(raf); clearTimeout(timer) }
      }, [messages, liveText, liveReasoning, liveReasoningOpen, turnStartedAt])

      /**
       * 侧窗开合 / 最大化切换会改变会话列宽，正文重新折行后内容变高，
       * `scrollTop` 不变就不再贴底。原本就在底部时，重排后补一次沉底。
       */
      useEffect(() => {
        const stick = () => {
          const element = bodyRef.current
          if (element === null || !followRef.current) return
          element.scrollTop = element.scrollHeight
        }
        stick()
        const raf = requestAnimationFrame(() => { stick(); requestAnimationFrame(stick) })
        const timer = setTimeout(stick, 120)
        return () => { cancelAnimationFrame(raf); clearTimeout(timer) }
      }, [previewTab, previewFull, contentWidth, renderedColumn])

      /** 预览关闭时一并收起文件树（原生侧边栏收起后不保留树态可见），并清掉面板控件的 tooltip。 */
      useEffect(() => {
        setIconHint(null)
        if (previewTab === null) setNavOpen(false)
      }, [previewTab, previewFull])

      /** 浮层（卡片 caret 菜单、「本轮用量」、「底部统计」）点空白或按 Esc 关闭。 */
      useDismiss(pathMenu !== null, () => setPathMenu(null))
      useDismissOutside(wsMenu !== null, () => setWsMenu(null))
      useDismissOutside(sessionMenu !== null, () => setSessionMenu(null))
      useDismissOutside(viewMenu !== null, () => setViewMenu(null))
      useDismissOutside(usageDialog !== null, () => setUsageDialog(null))
      useDismissOutside(statDialog !== null, () => setStatDialog(null))

      /**
       * 本轮改动摘要：`workspace/changes` 只给出 seq，摘要要按 seq 去对端取
       * `GET /api/changes.summary`（本机 `/api/remote-peers/changes` 转发）。
       */
      useEffect(() => {
        if (activePeer === null || openSession === null) return
        const missing = []
        for (const item of messages) {
          if (typeof item.changeSeq !== 'number') continue
          const key = `${openSession}:${item.changeSeq}`
          if (changesSummaries[key] !== undefined) continue
          missing.push({ key, seq: item.changeSeq })
        }
        if (missing.length === 0) return
        let cancelled = false
        setChangesSummaries((previous) => {
          const next = { ...previous }
          for (const { key } of missing) if (next[key] === undefined) next[key] = 'loading'
          return next
        })
        for (const { key, seq } of missing) {
          const params = new URLSearchParams({
            id: activePeer,
            sessionId: openSession,
            seq: String(seq),
          })
          fetch(`/api/remote-peers/changes?${params.toString()}`)
            .then((response) => response.ok ? response.json() : Promise.reject(new Error(String(response.status))))
            .then((value) => {
              if (!cancelled) setChangesSummaries((previous) => ({ ...previous, [key]: value }))
            })
            .catch(() => {
              if (!cancelled) setChangesSummaries((previous) => ({ ...previous, [key]: 'error' }))
            })
        }
        return () => { cancelled = true }
      }, [messages, activePeer, openSession, changesSummaries])

      /**
       * 卡片上的文件大小：**视口驱动 + 批量**。卡片进（或贴近）视口时才登记需求，
       * 120ms 内攒到的需求合并成一次 `file/sizes`（Host 侧小并发向阳端 stat），
       * 不再是每张卡片一次 RPC 的全量预取。只需要个人尺寸时用卡片上的 `file/sizes` 兜底。
       */
      /**
       * 旧 Host 兜底：`file/sizes` 还没有 `locals` 时，逐条问 `local/copy`
       * （只探这一批（视口内）的几个路径，Host 侧只是本地 stat，不碰网络）。
       * @param peer - 他端 id
       * @param batch - `[[key, path], …]`
       * @returns 与 `file/sizes` 的 `locals` 同构：`{ [path]: true }`
       */
      async function probeLocalCopies(peer, batch) {
        const locals = {}
        for (const [, path] of batch) {
          try {
            const state = await call('local/copy', { id: peer, path })
            if (state?.exists === true) locals[path] = true
          } catch { /* 探不到就当没有副本：卡片照旧显示「下载」，点了会走一次复用 */ }
        }
        diagNote(`local probe fallback ${Object.keys(locals).length}/${batch.length}`)
        return locals
      }

      const flushSizes = useCallback(async (batch) => {        if (batch.length === 0) return
        const peer = activePeer
        if (peer === null || peer === '') return
        const paths = batch.map(([, path]) => path)
        for (const [key] of batch) sizePendingRef.current.add(key)
        try {
          const value = await call('file/sizes', { id: peer, paths, sessionId: openSession ?? '' })
          const sizes = value?.sizes ?? {}
          // 对端明确回「文件已不在」的路径：记成 'missing'，卡片据此不再发起下载。
          const missing = value?.missing ?? {}
          // Host 还是旧版本时没有 `locals`：退回一张卡一次 `local/copy`（只探这几张视口内的，代价很小），
          // 这样「插件没重载」也不会出现「文件明明在、按钮却还写下载」。
          const locals = value?.locals ?? await probeLocalCopies(peer, batch)
          setLocalCopies((previous) => {
            let next = previous
            for (const [key, path] of batch) {
              if (next[key] === true) continue
              if (locals[path] !== true) continue
              if (next === previous) next = { ...previous }
              next[key] = true
            }
            return next
          })
          setFileSizes((previous) => {
            let next = previous
            for (const [key, path] of batch) {
              if (next[key] !== undefined) continue
              const size = sizes[path]
              // `missing` = 对端说出「没有这个文件」：卡片据此直接提示不存在，不再尝试下载。
              // `null` = 这一项对端答不上来：记成 `error` 占位，免得滚回去又重问一遍。
              const settled = missing[path] === true ? 'missing' : typeof size === 'number' && size > 0 ? size : 'error'
              if (next === previous) next = { ...previous }
              next[key] = settled
            }
            return next
          })
        } catch (failure) {
          diagNote(`size batch failed ${paths.length}: ${errorText(failure)}`)
          setFileSizes((previous) => {
            const next = { ...previous }
            for (const [key] of batch) if (next[key] === undefined) next[key] = 'error'
            return next
          })
        } finally {
          for (const [key] of batch) {
            sizePendingRef.current.delete(key)
            localProbedRef.current.add(key)
          }
        }
      }, [call, activePeer, openSession])

      /** 单张卡片进视口时的登记入口（内部 120ms 合并，重复登记同 key 会被去重）。 */
      const sizeQueueRef = useRef({ items: new Map(), timer: 0 })
      const askSizeOf = useCallback((key, path) => {
        if (key === '' || path === '') return
        // 大小与本机副本一起探：只要还有一项没问过就排进这一批。
        if (fileSizes[key] !== undefined && localProbedRef.current.has(key)) return
        if (sizePendingRef.current.has(key)) return
        const queue = sizeQueueRef.current
        if (queue.items.has(key)) return
        queue.items.set(key, path)
        diagNote(`size ask ${path}`)
        if (queue.timer !== 0) return
        queue.timer = setTimeout(() => {
          queue.timer = 0
          const batch = [...queue.items.entries()]
          queue.items = new Map()
          void flushSizes(batch)
        }, 120)
      }, [fileSizes, flushSizes])

      /** 从左栏「远程 · 机器名」入口进来时，直接打开这个端。 */
      useEffect(() => {
        if (focusPeer === undefined || focusPeer === null) return
        setActivePeer(focusPeer.id)
        void loadSessions(focusPeer.id)
      }, [focusPeer === undefined || focusPeer === null ? '' : focusPeer.id, loadSessions])

      /** 取对端会话投影：`sessionStats`（轮/步/解码速度）、`tokenUsage`（三个计费桶）、 `contextPressure`（prompt 规模与上下文容量）。统计行只用这三个权威值， 不再从窗口内事件折叠（窗口只有前 500 条消息，累计必然偏小）。 */
      const loadProjections = useCallback(async (peerId, sessionId) => {
        try {
          const result = await call('proxy', {
            id: peerId,
            method: 'session/projections',
            payload: { args: { request: { sessionId } } },
          })
          const envelope = envelopeOf(result, '取会话投影失败')
          const values = envelope.value?.values ?? null
          setProjections(values)
          return values
        } catch (failure) {
          setProjections(null)
          return null
        }
      }, [call])

      /** 打开 `session/follow`：先快照，随后是提交事件与 assistant 实时分片。 */
      const openStream = useCallback((peerId, sessionId) => {
        closeStream()
        setProjections(null)
        void loadProjections(peerId, sessionId)
        const payload = {
          args: {
            request: {
              address: { kind: 'session', sessionId },
              // 与原生 `HISTORY_PAGE_OPTIONS` 一致：500 条 + 至少 50 条/2 轮，先给足首屏，
              // 再靠 `beforeSeq` 向前翻页补更早的历史。
              maxMessages: 500,
              turnWindow: { minMessages: 50, minTurns: 2 },
              assistantStream: true,
            },
          },
        }
        const url = streamUrlOf(peerId, 'session/follow', payload)
        const controller = new AbortController()
        streamRef.current = controller
        void openSse(controller, url, (frame) => {
          if (frame?.type === 'snapshot') {
            const collected = collectMessages(frame.records ?? [])
            const snapshotEvents = (frame.records ?? [])
              .filter((record) => record?.type === 'event')
              .map((record) => record.event)
            snapshotSessionRef.current = sessionId
            presentsRef.current = new Map()
            turnStartsRef.current = new Map()
            seenRef.current = new Set(collected.map((item) => item.seq))
            olderRecordsRef.current = []
            olderStateRef.current = { loading: false, hasMore: frame.hasMore === true }
            setHistoryMore(frame.hasMore === true)
            setMessages(collected)
            setRawEvents(snapshotEvents)
            // 窗口关掉再进来时对端那一轮可能还在跑：快照里「有 turn/start 没有 turn/end」就是
            // 仍在进行的轮次，把它的起始时间接回来，否则界面会当成已经收尾（动作行与用量直接挂上）。
            const runningTurn = runningTurnOf(snapshotEvents)
            if (runningTurn === undefined) {
              setTurnStartedAt(0)
            } else {
              turnStartsRef.current.set(runningTurn.turn, runningTurn.time)
              currentTurnRef.current = runningTurn.turn
              setTurnStartedAt(typeof runningTurn.time === 'number' && runningTurn.time > 0 ? runningTurn.time : Date.now())
            }
            return
          }
          if (frame?.type === 'event') {
            const item = messageOf(frame.event)
            if (frame.event !== undefined) setRawEvents((previous) => [...previous, frame.event])
            if (frame.event?.type === 'permission/preset' && typeof frame.event.data?.preset === 'string') {
              setPermissionPreset(frame.event.data.preset)
            }
            // present 卡片：工具调用时先记下，等这个 turn 结束再落到正文尾部。
            const presentFiles = presentOf(frame.event)
            if (presentFiles !== undefined) {
              presentsRef.current.set(frame.event.data?.turn, { files: presentFiles, seq: frame.event.seq })
              return
            }
            // 本轮改动摘要：记下 `workspace/changes` 的 seq，卡片靠它去对端取摘要。
            if (frame.event?.type === 'workspace/changes') {
              const turn = frame.event.data?.turn
              if (typeof turn === 'number') changesRef.current.set(turn, frame.event.seq)
              return
            }
            // 队列插话：`inserted` 是新塞进队列的待发提问，`removedCount` 是它被消费（真正
            // 成为 `user/message`）后撤回的条数。排队的提问不占轮次，只有真正提交的那条
            // 才带轮次号 —— 混为一谈会让提问挂到上一轮，刻度跳转整排错位。
            if (frame.event?.type === 'agent/inbox/spliced') {
              const data = frame.event.data ?? {}
              const removed = typeof data.removedCount === 'number' ? data.removedCount : 0
              const added = pendingPromptsOf(data.inserted)
              if (removed === 0 && added.length === 0) return
              setMessages((previous) => {
                let next = previous
                if (removed > 0) {
                  let left = removed
                  next = next.filter((entry) => {
                    if (entry.role !== 'user' || entry.pending !== true || left <= 0) return true
                    left -= 1
                    return false
                  })
                }
                return added.length === 0 ? next : [...next, ...added]
              })
              return
            }
            if (frame.event?.type === 'turn/start') {
              turnStartsRef.current.set(frame.event.data?.turn, frame.event.time)
              currentTurnRef.current = frame.event.data?.turn
              // 对端开跑：本端立刻显示「正在分析请求 / 正在思考…」两行动态，不再是一片静默
              setTurnStartedAt((previous) => (previous === 0 ? Date.now() : previous))
              return
            }
            if (frame.event?.type === 'turn/end') {
              void loadProjections(peerId, sessionId)
              setTurnStartedAt(0)
              const turn = frame.event.data?.turn
              const pending = presentsRef.current.get(turn)
              if (pending !== undefined) presentsRef.current.delete(turn)
              const changeSeq = changesRef.current.get(turn)
              if (changeSeq !== undefined) changesRef.current.delete(turn)
              const processItem = turnProcessItem(turn, turnStartsRef.current.get(turn), {
                time: frame.event.time,
                reason: frame.event.data?.reason?.kind,
              })
              setMessages((previous) => {
                const at = previous.findIndex((item) => item.role === 'assistant' && item.turn === turn)
                if (at === -1) {
                  const tail = [
                    ...pending === undefined ? [] : [{ role: 'present', files: pending.files, seq: pending.seq }],
                    ...changeSeq === undefined ? [] : [{ role: 'changes', changeSeq, changeTurn: turn }],
                  ]
                  return [...previous, ...tail, processItem]
                }
                // 卡片挂到该轮最后一条助手消息上，于是渲染顺序是 正文 → 卡片 → 动作行。
                let tailAt = at
                for (let cursor = previous.length - 1; cursor >= 0; cursor -= 1) {
                  if (previous[cursor].role === 'assistant' && previous[cursor].turn === turn) { tailAt = cursor; break }
                }
                const merged = {
                  ...previous[tailAt],
                  ...pending === undefined ? {} : { cards: pending.files, cardsSeq: pending.seq },
                  ...changeSeq === undefined ? {} : { changeSeq, changeTurn: turn },
                }
                const next = previous.slice()
                next[tailAt] = merged
                next.splice(at, 0, processItem)
                return next
              })
              return
            }
            if (item === undefined || seenRef.current.has(item.seq)) return
            if (item.role === 'user' && typeof item.turn !== 'number') item.turn = currentTurnRef.current
            seenRef.current.add(item.seq)
            setMessages((previous) => [...previous, item])
            return
          }
          if (frame?.type === 'assistant-stream') {
            const inner = frame.frame
            if (inner?.type === 'chunk') {
              const chunk = inner.chunk
              const kind = typeof chunk?.type === 'string' ? chunk.type : ''
              if (/reasoning|thinking|thought/u.test(kind)) {
                const piece = typeof chunk?.text === 'string' ? chunk.text : ''
                if (piece !== '') setLiveReasoning((previous) => previous + piece)
              } else {
                const text = chunkText(chunk)
                if (text !== '') setLiveText((previous) => previous + text)
              }
            }
            if (inner?.type === 'end') {
              setLiveText('')
              setLiveReasoning('')
              setLiveReasoningOpen(false)
            }
          }
        }).catch(() => { /* 流断开：重新打开会话即可，消息不受影响 */ })
      }, [closeStream, loadProjections])

      /** `rawEvents` 镜像，供 `loadOlderHistory` 重建消息列表。 */
      useEffect(() => { eventsMirrorRef.current = rawEvents }, [rawEvents])

      /** 向前翻页：原生 `events.prepend({ beforeSeq })` —— 走 `session/events` 读一页更早的 记录，拼到当前窗口前面，再按新窗口重建消息列表，并把滚动位置补偿回原来那一屏。 对端返回 `hasMore` 时还能继续翻。 */
      const loadOlderHistory = useCallback(async (peerId, sessionId) => {
        const state = olderStateRef.current
        if (state.loading || !state.hasMore) return
        const mirror = eventsMirrorRef.current
        const firstSeq = olderRecordsRef.current[0]?.event?.seq ?? mirror[0]?.seq
        if (typeof firstSeq !== 'number') return
        state.loading = true
        const body = bodyRef.current
        const before = body === null ? 0 : body.scrollHeight
        try {
          const envelope = await callViaHttp({
            id: peerId,
            method: 'session/events',
            payload: {
              args: {
                request: {
                  address: { kind: 'session', sessionId },
                  beforeSeq: firstSeq,
                  maxMessages: 200,
                  turnWindow: { minMessages: 50, minTurns: 2 },
                },
              },
            },
          })
          if (envelope?.ok !== true) return
          const value = envelope.value ?? {}
          const records = Array.isArray(value.records) ? value.records : []
          state.hasMore = value.hasMore === true
          setHistoryMore(state.hasMore)
          if (records.length === 0) return
          olderRecordsRef.current = [...records, ...olderRecordsRef.current]
          const rebuilt = collectMessages([
            ...olderRecordsRef.current,
            ...mirror.map((event) => ({ type: 'event', event })),
          ])
          seenRef.current = new Set(rebuilt.map((item) => item.seq))
          setMessages(rebuilt)
          requestAnimationFrame(() => {
            const element = bodyRef.current
            if (element !== null && body !== null) element.scrollTop += element.scrollHeight - before
          })
        } catch (failure) {
        } finally {
          state.loading = false
        }
      }, [call])

      /** 从对端取模型目录；失败只影响模型名显示，不影响会话本体。 */
      const loadCatalog = useCallback(async (peerId) => {
        try {
          const result = await call('proxy', {
            id: peerId,
            method: 'session/modelCatalog',
            payload: { args: {} },
          })
          const envelope = envelopeOf(result, '取模型目录失败')
          setCatalog(envelope.value ?? null)
          return envelope.value ?? null
        } catch (failure) {
          setCatalog(null)
          return null
        }
      }, [call])




      /** 取对端可选权限预设。 */
      const loadPermissionCatalog = useCallback(async (peerId) => {
        try {
          const result = await call('proxy', {
            id: peerId,
            method: 'permissionPresets/catalog',
            payload: { args: {} },
          })
          const envelope = envelopeOf(result, '取权限预设失败')
          setPermissionOptions(envelope.value?.options ?? [])
          setPermissionDefault(envelope.value?.defaultPreset ?? null)
          return envelope.value ?? null
        } catch (failure) {
          setPermissionOptions([])
          return null
        }
      }, [call])

      /** 取对端 Agent 预设清单；拿不到时只影响模式名显示。 */
      const loadPresets = useCallback(async (peerId) => {
        try {
          const result = await call('proxy', {
            id: peerId,
            method: 'agentPresets/list',
            payload: { args: {} },
          })
          const envelope = envelopeOf(result, '取预设清单失败')
          const list = envelope.value?.presets ?? []
          setPresets(list)
          return list
        } catch (failure) {
          setPresets([])
          return []
        }
      }, [call])


      /** 当前会话的模式名，取 session/list 的 agentPreset 投影。 */
      function presetOfSession(sessionId, roster) {
        const item = sessions.find((session) => session.sessionId === sessionId)
        const id = item?.projections?.values?.agentPreset
        return presetNameOf(typeof id === 'string' ? id : null, roster)
      }




      /** 切换远端会话的模型/推理等级：写的是对端真实会话选择，对端界面同样会变。 */
      const changeModel = useCallback(async (peerId, sessionId, group, model, effort) => {
        setModelBusy(true)
        setPickerOpen(false)
        try {
          const request = { sessionId, provider: group.id, model: model.id }
          const selectedEffort = effort ?? model.reasoning?.defaultEffort
          if (selectedEffort !== undefined) request.reasoningEffort = selectedEffort
          const result = await call('proxy', {
            id: peerId,
            method: 'session/selectModel',
            payload: { args: { request } },
          })
          const envelope = envelopeOf(result, '对端拒绝了这次模型切换')
          const selected = envelope.value?.selected ?? { provider: group.id, model: model.id, reasoningEffort: selectedEffort }
          setSelection({
            provider: selected.provider ?? group.id,
            model: selected.model ?? model.id,
            reasoningEffort: selected.reasoningEffort ?? selectedEffort,
          })
          setError('')
        } catch (failure) {
          setError(`切换模型失败：${String(failure.message ?? failure)}`)
        } finally {
          setModelBusy(false)
        }
      }, [call])

      /** 只改推理等级：沿用当前 provider/model，补一个新的 effort。 */
      const changeEffort = useCallback(async (peerId, sessionId, effort) => {
        const group = catalog?.groups?.find((item) => item.id === selection?.provider)
        const model = group?.models?.find((item) => item.id === selection?.model)
        if (group === undefined || model === undefined) return
        await changeModel(peerId, sessionId, group, model, effort)
      }, [catalog, selection, changeModel])

      const openRemoteSession = useCallback(async (peerId, sessionId) => {
        setBusy('history')
        setOpenSession(sessionId)
        setLiveText('')
        setPickerOpen(false)
        setSelection(null)
        setUsageDialog(null)
        setStatDialog(null)
        snapshotSessionRef.current = ''
        try {
          const result = await call('proxy', {
            id: peerId,
            method: 'session/events',
            payload: {
              args: {
                request: {
                  address: { kind: 'session', sessionId },
                  // 只取一小页拿模型/权限的兜底元数据：历史窗口由 `session/follow` 快照给，
                  // 大页走 RPC 通道会被体积限制卡住。
                  maxMessages: 20,
                },
              },
            },
          })
          const envelope = envelopeOf(result, '对端返回失败')
          const records = envelope.value?.records ?? []
          olderRecordsRef.current = []
          olderStateRef.current = { loading: false, hasMore: false }
          setHistoryMore(false)
          // 这一小页只作元数据兜底，正文与窗口交给 `session/follow` 快照。
          const eventList = records.map((record) => record.event ?? record)
          const nextCatalog = catalog ?? await loadCatalog(peerId)
          const projected = sessions.find((session) => session.sessionId === sessionId)
            ?.projections?.values?.modelSelection?.next
          const base = typeof projected?.model === 'string'
            ? { provider: typeof projected.provider === 'string' ? projected.provider : '', model: projected.model }
            : selectionOf(eventList, nextCatalog)
          const effort = effortOf(eventList)
          setSelection(base === null || base === undefined ? null : { ...base, reasoningEffort: effort })
          const permissionCatalog = permissionOptions.length === 0 ? await loadPermissionCatalog(peerId) : null
          setPermissionPreset(permissionOf(eventList) ?? permissionCatalog?.defaultPreset ?? null)
          if (presets.length === 0) void loadPresets(peerId)
          setError('')
          openStream(peerId, sessionId)
        } catch (failure) {
          setMessages([])
          setRawEvents([])
          setError(errorText(failure))
          closeStream()
        } finally {
          setBusy('')
        }
      }, [call, openStream, closeStream, catalog, loadCatalog, loadPresets, loadPermissionCatalog,
        permissionOptions.length, presets.length, sessions])

      /**
       * 在一个工作区里新建对端会话并立刻打开 —— 原生工作区行右侧的「新会话」。
       * @param workspaceId - 对端工作区 id（`session/create` 的 `workspaceId`，与 `cwd` 互斥）
       */
      const createSessionIn = useCallback(async (workspaceId) => {
        if (creatingIn !== '') return
        setCreatingIn(workspaceId)
        try {
          const result = await call('proxy', {
            id: activePeer,
            method: 'session/create',
            payload: { args: { request: { workspaceId } } },
          })
          const envelope = envelopeOf(result, '节点没能新建会话')
          const sessionId = String(envelope.value?.sessionId ?? '')
          if (sessionId === '') throw new Error('节点没有返回会话 id')
          await loadSessions(activePeer)
          await openRemoteSession(activePeer, sessionId)
        } catch (failure) {
          setError(errorText(failure))
        } finally {
          setCreatingIn('')
        }
      }, [activePeer, call, creatingIn, loadSessions, openRemoteSession])

      /** 打开重命名工作区对话框：草稿预填当前名字（原生 Modal 里全选待改）。 */
      const openRenameAsk = useCallback((workspaceId, title) => {
        setWsMenu(null)
        setRenameAsk({ workspaceId, title })
        setRenameDraft(title)
        setRenameError('')
      }, [])

      const closeRename = useCallback(() => {
        if (renaming) return
        setRenameAsk(null)
        setRenameDraft('')
        setRenameError('')
      }, [renaming])

      /** 提交重命名：`workspace/rename` 只改标题，成功后就地替换列表里的那一行（工作区流也会推 upsert）。 */
      const confirmRename = useCallback(async () => {
        if (renameAsk === null || renaming) return
        const title = renameDraft.trim()
        if (title === '' || title === renameAsk.title) return
        setRenaming(true)
        setRenameError('')
        try {
          const result = await call('proxy', {
            id: activePeer,
            method: 'workspace/rename',
            payload: { args: { request: { workspaceId: renameAsk.workspaceId, title } } },
          })
          const envelope = envelopeOf(result, '节点没能重命名工作区')
          const workspace = envelope.value?.workspace
          if (workspace?.workspaceId !== undefined) {
            setWorkspaces((previous) => previous.map((item) => (item.workspaceId === workspace.workspaceId ? workspace : item)))
          }
          setRenameAsk(null)
          setRenameDraft('')
        } catch (failure) {
          setRenameError(errorText(failure))
        } finally {
          setRenaming(false)
        }
      }, [activePeer, call, renameAsk, renameDraft, renaming])

      /** 打开重命名会话对话框：草稿预填当前标题（原生 `rename.session.title` 那道 Modal）。 */
      const openSessionRename = useCallback((sessionId, title) => {
        setSessionMenu(null)
        setSessionRenameAsk({ sessionId, title })
        setRenameDraft(title)
        setRenameError('')
      }, [])

      const closeSessionRename = useCallback(() => {
        if (renaming) return
        setSessionRenameAsk(null)
        setRenameDraft('')
        setRenameError('')
      }, [renaming])

      /** 提交会话重命名：`session/rename` 只改标题，成功后就地替换列表里那一行。 */
      const confirmSessionRename = useCallback(async () => {
        if (sessionRenameAsk === null || renaming) return
        const title = renameDraft.trim()
        if (title === '' || title === sessionRenameAsk.title) return
        setRenaming(true)
        setRenameError('')
        try {
          const result = await call('proxy', {
            id: activePeer,
            method: 'session/rename',
            payload: { args: { request: { sessionId: sessionRenameAsk.sessionId, title } } },
          })
          envelopeOf(result, '节点没能重命名会话')
          setSessions((previous) => previous.map((item) => (
            String(item.sessionId) === String(sessionRenameAsk.sessionId) ? { ...item, title } : item
          )))
          setSessionRenameAsk(null)
          setRenameDraft('')
        } catch (failure) {
          setRenameError(errorText(failure))
        } finally {
          setRenaming(false)
        }
      }, [activePeer, call, renameDraft, renaming, sessionRenameAsk])

      /** 复制会话 ID（原生 `menu.sessionId`）：剪贴板写失败按复制失败回执。 */
      const copySessionIdText = useCallback((sessionId) => {
        const text = String(sessionId)
        if (typeof navigator?.clipboard?.writeText !== 'function') {
          notice('复制失败，请重试', false)
          return
        }
        navigator.clipboard.writeText(text).then(
          () => notice('Session ID 已复制', true),
          () => notice('复制失败，请重试', false),
        )
      }, [notice])

      /**
       * 会话两种集合状态的切换（原生 `PinSession.tsx` / `ArchiveSession.tsx` 的按钮行为）：
       * 调 `workspace/pinSession|unpinSession|archiveSession|unarchiveSession`，回包是完整集合，整体替换即可。
       */
      const toggleSessionFlag = useCallback(async (method, field, sessionId) => {
        try {
          const result = await call('proxy', {
            id: activePeer,
            method,
            payload: { args: { request: { sessionId } } },
          })
          const envelope = envelopeOf(result, '节点没能更新会话状态')
          const next = envelope.value?.[field]
          if (Array.isArray(next)) {
            if (field === 'pinnedSessionIds') setPinnedIds(next)
            else setArchivedIds(next)
          }
        } catch (failure) {
          setError(errorText(failure))
        }
      }, [activePeer, call])

      /**
       * 执行一条斜杠命令（走宿主 `commands/execute`，与原生 composer 一致）。
       * @param peerId - 目标他端
       * @param sessionId - 对端会话
       * @param line - 完整命令行
       * @param attachments - 该次提交附件收据（原生 `submittedAttachments` 同字段）
       */
      const runCommand = useCallback(async (peerId, sessionId, line, attachments = []) => {
        setSending(true)
        try {
          const result = await call('proxy', {
            id: peerId,
            method: 'commands/execute',
            payload: { args: { agentId: sessionId, line, submittedAttachments: attachments } },
          })
          const envelope = envelopeOf(result, '对端拒绝了这条指令')
          const outcome = envelope.value?.result
          if (outcome?.kind !== 'success') throw new Error(outcome?.text ?? '指令执行失败')
          setError('')
        } catch (failure) {
          setError(errorText(failure))
        } finally {
          setSending(false)
        }
      }, [call])

      /**
       * 在远端会话里发一句话：`session/prompt` 只回执，正文来自 follow 流。
       * @param peerId - 目标他端
       * @param sessionId - 对端会话
       * @param text - 正文
       * @param attachments - 已就位的附件收据（`{ type: 'file', receiptId }`），与原生同一个 content 数组
       * @returns 是否已被对端接受（失败时调用方保留草稿与附件）
       */
      const sendPrompt = useCallback(async (peerId, sessionId, text, attachments = []) => {
        const line = text.trim()
        if (line === '' && attachments.length === 0) return false
        // 发出去就回到尾部（原生发消息即沉底），免得新回复与思考长在可视区之外。
        followRef.current = true
        setShowToBottom(false)
        setTurnStartedAt(Date.now())
        if (bodyRef.current !== null) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
        if (line.startsWith('/')) {
          await runCommand(peerId, sessionId, line, attachments)
          setPromptTextFor(peerId, sessionId, '')
          resetComposerHeight()
          /* 只撤这条会话的 claim（发送发生在 peerId/sessionId，未必是当前打开的那条）。 */
          setPendingCommandFor(peerId, sessionId, null)
          return true
        }
        setSending(true)
        try {
          const requestId = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
          const result = await call('proxy', {
            id: peerId,
            method: 'session/prompt',
            payload: {
              args: {
                request: {
                  requestId,
                  sessionId,
                  mode: 'queue',
                  // 与原生 `sendSession` 同序：附件收据在前、正文在后。
                  content: [...attachments, ...(line === '' ? [] : [{ type: 'text', text }])],
                  clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
              },
            },
          })
          const envelope = envelopeOf(result, '对端拒绝了这条消息')
          setPromptTextFor(peerId, sessionId, '')
          resetComposerHeight()
          setError('')
          return true
        } catch (failure) {
          setError(errorText(failure))
          setTurnStartedAt(0)
          return false
        } finally {
          setSending(false)
        }
      }, [call, runCommand])

      /**
       * 附件上行走本机网关的二进制作业：`File` 自己就是请求体，网关原样流给节点的
       * `/api/session/uploadFileBinary`（原生 Client 的同一条路由），不经过 JSON-RPC 的 base64 展开。
       * @param peerId - 目标节点
       * @param sessionId - 节点上的会话
       * @param attachment - 待发附件（含 `file`）
       * @returns 节点给出的收据号
       */
      async function postAttachment(peerId, sessionId, attachment) {
        // 面板刚挂载时 `refresh` 可能还没回来；缺密钥先补一次，否则网关会 401。
        if (tokenRef.current === '') {
          try {
            const next = await call('status')
            tokenRef.current = typeof next?.token === 'string' ? next.token : ''
          } catch {
            /* 取不到就按无密钥发，401 由下面的提示呈现 */
          }
        }
        const query = new URLSearchParams({ id: peerId, sessionId, name: attachment.name })
        // 带 `mediaType` 的那条按提示词图片存放，其余按普通文件；与原生 `uploadImage` 同口径。
        if (attachment.kind === 'image') query.set('mediaType', attachment.mediaType)
        const response = await fetch(`/api/remote-peers/upload?${query.toString()}`, {
          method: 'POST',
          headers: {
            'content-type': 'application/octet-stream',
            ...(tokenRef.current === '' ? {} : { authorization: `Bearer ${tokenRef.current}` }),
          },
          body: attachment.file,
        })
        const text = await response.text()
        let parsed
        try {
          parsed = JSON.parse(text)
        } catch {
          parsed = undefined
        }
        const receiptId = typeof parsed?.value?.receiptId === 'string' ? parsed.value.receiptId : ''
        if (parsed?.ok === true && receiptId !== '') return receiptId
        throw new Error(parsed?.error?.message !== undefined
          ? String(parsed.error.message)
          : response.status === 401
            ? '节点拒绝了共享密钥'
            : `节点拒绝了这份附件（HTTP ${response.status}）`)
      }

      /**
       * 传一份待发附件：选中即上传（与原生一样不等发送），成功后只留收据号；
       * 失败把原因留在卡片上，点一下重试。
       * @param peerId - 目标节点
       * @param sessionId - 节点上的会话
       * @param attachment - 待发附件（含 `file`）
       */
      const uploadAttachment = useCallback(async (peerId, sessionId, attachment) => {
        const patch = (next) => {
          setPendingFiles((previous) => previous.map((item) => (item.id === attachment.id ? { ...item, ...next } : item)))
        }
        try {
          const receiptId = await postAttachment(peerId, sessionId, attachment)
          patch({ status: 'ready', receiptId, error: '' })
        } catch (failure) {
          patch({ status: 'error', error: errorText(failure) })
        }
      }, [call])

      /**
       * 登记待发附件：图片成缩略图草稿，其余成文件卡，随即开始上传（与原生一样不等发送）。
       * @param files - 粘贴或选到的浏览器 File
       */
      const stageFiles = useCallback((files) => {
        if (activePeer === '' || openSession === '') {
          setError('先进入一个远端会话，再添加附件')
          return
        }
        const staged = files.map((file) => {
          const image = IMAGE_MEDIA_TYPES.has(file.type)
          return {
            id: `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            kind: image ? 'image' : 'file',
            name: file.name === '' ? (image ? '图片' : '文件') : file.name,
            size: file.size,
            mediaType: file.type,
            file,
            previewUrl: image ? URL.createObjectURL(file) : '',
            status: 'uploading',
            receiptId: '',
            error: '',
          }
        })
        setPendingFiles((previous) => [...previous, ...staged])
        for (const attachment of staged) void uploadAttachment(activePeer, openSession, attachment)
      }, [activePeer, openSession, uploadAttachment])

      /**
       * 一次粘贴收下附件：有文件就登记并拦住默认粘贴，文件夹静默丢掉（原生 `clipboardFiles` 也不收目录）。
       * @param event - 粘贴事件（剪贴板来自 textarea 自身或文档级兜底）
       */
      const takePaste = useCallback((event) => {
        const files = clipboardFilesOf(event.clipboardData)
        if (files.length === 0) return
        event.preventDefault()
        stageFiles(files)
      }, [stageFiles])

      /** 移除一份待发附件：顺手释放缩略图的 blob URL。 */
      const dropStaged = useCallback((id) => {
        setPendingFiles((previous) => {
          const target = previous.find((item) => item.id === id)
          if (target !== undefined && target.previewUrl !== '') URL.revokeObjectURL(target.previewUrl)
          return previous.filter((item) => item.id !== id)
        })
      }, [])

      /** 重传一份失败附件。 */
      const retryStaged = useCallback((attachment) => {
        setPendingFiles((previous) => previous.map((item) => (item.id === attachment.id
          ? { ...item, status: 'uploading', error: '' }
          : item)))
        void uploadAttachment(activePeer, openSession, attachment)
      }, [activePeer, openSession, uploadAttachment])

      /** 发送成功后才清空附件行，并把缩略图的 blob URL 一起放掉。 */
      const releaseStaged = useCallback(() => {
        setPendingFiles((previous) => {
          for (const item of previous) if (item.previewUrl !== '') URL.revokeObjectURL(item.previewUrl)
          return []
        })
      }, [])

      // 焦点不在任何输入控件里时粘贴文件，也落到这块输入卡上（原生 `ComposerFileIntake` 的同一条规则）。
      useEffect(() => {
        const editable = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
        const onPaste = (event) => {
          if (event.defaultPrevented || event.clipboardData === null) return
          const origin = event.composedPath().find((value) => value instanceof Element)
          if (origin instanceof Element && origin.closest(editable) !== null) return
          takePaste(event)
        }
        document.addEventListener('paste', onPaste)
        return () => document.removeEventListener('paste', onPaste)
      }, [takePaste])

      /**
       * 切权限预设：走宿主的 `commands/execute`（`/permission <preset>`），
       * 这就是原生 UI 用的写路径，切换会真的落到对端会话事件里。
       */
      const changePermission = useCallback(async (peerId, sessionId, value) => {
        setPermissionBusy(true)
        setPermissionPending(null)
        try {
          const result = await call('proxy', {
            id: peerId,
            method: 'commands/execute',
            payload: {
              args: { agentId: sessionId, line: `/permission ${value}`, submittedAttachments: [] },
            },
          })
          const envelope = envelopeOf(result, '对端拒绝了权限切换')
          const outcome = envelope.value?.result
          if (outcome?.kind !== 'success') throw new Error(outcome?.text ?? '对端返回了失败结果')
          setPermissionPreset(value)
          setPermissionOpen(false)
          setError('')
        } catch (failure) {
          setError(`切换权限失败：${String(failure.message ?? failure)}`)
        } finally {
          setPermissionBusy(false)
        }
      }, [call])

      const savePeer = useCallback(async (entry) => {
        try {
          const saved = await call('peers/upsert', entry)
          setPeers(saved.peers ?? [])
          if (typeof onPeersChanged === 'function') onPeersChanged(saved.peers ?? [])
          setEditing(null)
          setError('')
        } catch (failure) {
          setError(errorText(failure))
        }
      }, [call, onPeersChanged])

      const removePeer = useCallback(async (id) => {
        try {
          const next = await call('peers/remove', { id })
          setPeers(next.peers ?? [])
          if (typeof onPeersChanged === 'function') onPeersChanged(next.peers ?? [])
          if (activePeer === id) { setActivePeer(''); setSessions([]); setOpenSession(null) }
        } catch (failure) {
          setError(errorText(failure))
        }
      }, [call, activePeer, onPeersChanged])

      /** 复制密钥：成功后按钮短暂变成「已复制 ✓」，关闭 / 重置后清掉回执。 */
      const copyToken = useCallback(async () => {
        const value = tokenRef.current
        if (value === '') return
        await copyText(value)
        setTokenCopied(true)
        clearTimeout(tokenCopiedTimer.current)
        tokenCopiedTimer.current = setTimeout(() => setTokenCopied(false), 1600)
      }, [])

      /** 复制局域网地址：只记下这一条，回执换成绿勾并弹一下。 */
      const copyAddress = useCallback(async (address) => {
        await copyText(address)
        setCopiedAddress(address)
        clearTimeout(addressCopiedTimer.current)
        addressCopiedTimer.current = setTimeout(() => setCopiedAddress(''), 1400)
      }, [])

      const resetToken = useCallback(async () => {
        setBusy('token')
        try {
          const next = await call('token/reset')
          setStatus(next)
          tokenRef.current = typeof next?.token === 'string' ? next.token : ''
          setTokenVisible(true)
          setError('')
        } catch (failure) {
          setError(errorText(failure))
        } finally {
          setBusy('')
        }
      }, [call])

      const checkPeer = useCallback(async (id) => {
        setBusy(`ping:${id}`)
        try {
          const result = await call('peers/ping', { id })
          setPing((previous) => ({ ...previous, [id]: result }))
        } catch (failure) {
          setPing((previous) => ({ ...previous, [id]: { ok: false, reason: errorText(failure) } }))
        } finally {
          setBusy('')
        }
      }, [call])

      /**
       * 在本机打开对端文件：`open-local` 先按 `/api/file` 把字节拉回本机缓存目录，
       * 再交给系统关联程序（`action: 'reveal'` 只在资源管理器里定位并选中）。
       * 注意不能用对端的 `session/openWorkspacePath`——那会在对端桌面上开窗口。
       * 失败时退到本地「文件信息」页，至少把绝对路径留在眼前。
       * 必须定义在会话页的提前 `return` 之前：会话页走的是那条早退分支，晚定义的
       * `const` 在该次渲染里永远是 TDZ，点击时才炸成「没有反应」。
       */
      /**
       * 在本机打开对端文件：`open-local` 先按 `/api/file` 把字节拉回本机缓存目录，
       * 再交给系统关联程序（zip / md / docx 相同）。不能走对端的 `session/openWorkspacePath`
       * —— 那是在对端桌面上起窗口。
       * 只管「下载 + 本机打开」，**不碰右侧预览**：失败仅给一条会自动消失的提示，
       * 不切页签、不进路径页（卡片/链接的点击才是进预览）。
       * 必须定义在会话页的提前 `return` 之前：会话页走的是那条早退分支，晚定义的
       * `const` 在该次渲染里永远是 TDZ，点击时才炸成「没有反应」。
       */
      const openLocalCopy = useCallback(async (id, path) => {
        // 成功路径完全静默：不弹任何提示（用户明确要求「打开」不出现 toast）。
        try {
          const result = await call('open-local', { id, path, sessionId: openSession ?? '' })
          // 本机端点回的是解包后的值（`{ path, action }`），不是 `proxy` 那种 `{ result }` 信封。
          const opened = result?.result?.ok === true ? result.result.value : result
          if (typeof opened?.path !== 'string') throw new Error('本机没能打开这个文件')
          if (opened.reused === true) setLocalCopies((previous) => (previous[transferKeyOf(id, path)] === true ? previous : { ...previous, [transferKeyOf(id, path)]: true }))
          setError('')
        } catch (failure) {
          notice(errorText(failure), false)
        }
      }, [call, openSession])

      const openPeerPath = useCallback(async (file) => {
        const path = peerAbsoluteOf(file)
        if (path === '' || activePeer === '') return
        const key = transferKeyOf(activePeer, path)
        // 本机没有副本：走「下载」同一条链路，下载格照常转圈/走进度，落盘后由轮询回手打开。
        // （Host 的 open-local 自己也会取字节，但那样界面上一点反应都没有，大文件像卡死。）
        if (localCopies[key] !== true) {
          if (fileSizes[key] === 'missing') {
            notice('对端上没有这份文件（可能已被清理或移动）', false)
            return
          }
          OPEN_WHEN_READY.set(key, { id: activePeer, path })
          if (!LIVE_DOWNLOADS.has(key) && !STARTING.has(key)) downloadPeerRef.current?.(file)
          else notifyDownloads()
          return
        }
        await openLocalCopy(activePeer, path)
      }, [activePeer, localCopies, fileSizes, openLocalCopy])


      /**
       * 「显示文件位置」本体：只有本机已经有这份副本才去定位（资源管理器里选中）。
       * 没下载过返回 false，由调用方回退到「右侧路径页」的老行为。
       * @param file - 卡片/预览里的文件条目
       * @returns 是否真的定位了
       */
      /**
       * 「显示文件位置」本体：只有本机已经有这份副本才去定位（资源管理器里选中）。
       * 反馈固定 2 秒：不再检测资源管理器窗口（explorer 自己起窗就要 2 秒上下，检测只是多一跳 PowerShell）。
       * 定位失败（副本被删/挪走）则提前收掉转圈，由调用方回退到「右侧路径页」。
       * @param file - 卡片/预览里的文件条目
       * @returns 是否真的定位了
       */
      const revealLocalCopy = useCallback(async (file) => {
        const path = peerAbsoluteOf(file)
        if (path === '' || activePeer === '') return false
        const key = transferKeyOf(activePeer, path)
        const started = typeof performance !== 'undefined' ? performance.now() : Date.now()
        setRevealing((previous) => (previous[key] === true ? previous : { ...previous, [key]: true }))
        // 与 RPC 并行的一段固定停留：回包再快也要把「正在打开…」显示满 2 秒，避免一闪而过。
        const hold = new Promise((resolve) => { setTimeout(resolve, REVEAL_FEEDBACK_MS) })
        try {
          // 一次 RPC 就够：Host 的 `open-local` 对 `reveal` 只认「已有副本」，没有副本会直接抛
          // 「还没有下载这份文件」——省掉过去那次 `local/copy` 预探（两次往返串起来要等两跳）。
          const opened = await call('open-local', { id: activePeer, path, action: 'reveal' })
          const value = opened?.result?.ok === true ? opened.result.value : opened
          if (value?.pending === true || typeof value?.path !== 'string') throw new Error('本机没有这份文件')
          REVEAL_READY.set(key, true)
          await hold
          diagNote(`reveal ${Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - started)}ms ${path}`)
          return true
        } catch (failure) {
          REVEAL_READY.set(key, false)
          // 定位失败通常就是「文件被删了/挪了」：把「已下载」标记撤回，这一格立刻恢复成「下载」可点。
          setLocalCopies((previous) => {
            if (previous[key] !== true) return previous
            const next = { ...previous }
            delete next[key]
            return next
          })
          diagNote(`reveal skipped ${path}: ${errorText(failure)}`)
          return false
        } finally {
          setRevealing((previous) => {
            if (previous[key] !== true) return previous
            const next = { ...previous }
            delete next[key]
            return next
          })
        }
      }, [call, activePeer])

      /**
       * 卡片「下载」主格：不再弹「另存为」，直接让 Host 把文件落到本机副本目录
       * （和「打开」同一个位置、同一份文件）。已经下过就当场复用，不重复取字节。
       */
      const downloadPeerPath = useCallback((file) => {
        const path = peerAbsoluteOf(file)
        if (path === '' || activePeer === '') return
        const key = transferKeyOf(activePeer, path)
        setTooltip(null)
        // 过期的「刚开始」不再挡点击：先撤掉它，再照常发起下载。
        const starting = STARTING.get(key)
        if (starting !== undefined && Date.now() - (starting.startedAt ?? 0) > STARTING_TIMEOUT_MS) STARTING.delete(key)
        if (LIVE_DOWNLOADS.has(key) || STARTING.has(key)) return
        // 大小那一批已经问出「对端没这个文件」：不再起任务，直接给一句结论。
        if (fileSizes[key] === 'missing') {
          notice('对端上没有这份文件（可能已被清理或移动）', false)
          // 失效这次缓存：万一对端又长回同一个路径，下一次点击交给 Host 重新判定。
          setFileSizes((previous) => {
            if (previous[key] === undefined) return previous
            const next = { ...previous }
            delete next[key]
            return next
          })
          return
        }
        // 先进入 loading：Host 还要一次 stat、再起第一页，这段时间卡片转圈。
        const knownTotal = typeof fileSizes[key] === 'number' ? fileSizes[key] : 0
        STARTING.set(key, { key, path, total: knownTotal, startedAt: Date.now() })
        failedKeysRef.current.delete(key)
        notifyDownloads()
        void call('download/save', { id: activePeer, sessionId: openSession ?? '', path }).then((value) => {
          if (value?.reused === true) {
            STARTING.delete(key)
            setLocalCopies((previous) => (previous[key] === true ? previous : { ...previous, [key]: true }))
            notifyDownloads()
            notice('已下载过，本机已有这份文件的副本', true)
            const intent = OPEN_WHEN_READY.get(key)
            if (intent !== undefined) {
              OPEN_WHEN_READY.delete(key)
              void openIntentRef.current?.(intent)
            }
          }
          // 否则等 Host 的第一块字节：轮询看到 loaded > 0 就切进度，失败则由轮询弹提示。
        }).catch((failure) => {
          STARTING.delete(key)
          OPEN_WHEN_READY.delete(key)
          notifyDownloads()
          diagNote(`download save failed ${path}: ${errorText(failure)}`)
          notice(`下载失败：${downloadFailureText(errorText(failure))}`, false)
        })
      }, [activePeer, openSession, fileSizes])
      // 每次渲染刷新这两个 ref：轮询（后定义的那条 effect）与「打开」共用同一份最新实现。
      downloadPeerRef.current = downloadPeerPath
      openIntentRef.current = (intent) => openLocalCopy(intent.id, intent.path)

      /**
       * 取消入口（第一段）：只弹确认框。大文件误点一下就会丢掉进度，先在「继续下载 / 取消下载」里选。
       */
      const cancelPeerDownload = useCallback((file) => {
        const path = peerAbsoluteOf(file)
        const key = transferKeyOf(activePeer, path)
        if (LIVE_DOWNLOADS.get(key) !== undefined || STARTING.has(key)) {
          setDownloadCancelAsk({ file })
          return
        }
        // 本地没有记账（键对不上、或状态已经过期）：界面上还挂着 loading，但点取消不能没反应。
        // 先把过期的 loading 撤掉，再让 Host 按路径取消它那边可能仍在跑的任务。
        STARTING.delete(key)
        OPEN_WHEN_READY.delete(key)
        notifyDownloads()
        void call('download/cancel', { id: activePeer, path }).catch(() => {})
        // 不弹提示：取消是这一格自己点的，状态回到「下载」已经说明结果。
      }, [activePeer, call])

      /**
       * 取消入口（第二段）：确认后真正停掉 —— Host 中止取字节并丢掉 `.part`，
       * 与进度是否推进完全解耦，卡住不动也能点掉。
       */
      const doCancelDownload = useCallback((file) => {
        const key = transferKeyOf(activePeer, peerAbsoluteOf(file))
        STARTING.delete(key)
        OPEN_WHEN_READY.delete(key)
        const job = LIVE_DOWNLOADS.get(key)
        LIVE_DOWNLOADS.delete(key)
        // 刚取消的任务 Host 可能还报一两轮，先压住，别让卡片闪回来。
        CANCELLING.set(key, Date.now())
        notifyDownloads()
        const path = peerAbsoluteOf(file)
        const remoteKey = typeof job?.remoteKey === 'string' ? job.remoteKey : `${activePeer}|${path}`
        // 同时给 Host 路径：记账键万一对不上（分隔符/大小写），Host 还能按路径找到那条任务。
        void call('download/cancel', { key: remoteKey, id: activePeer, path }).catch(() => {})
      }, [activePeer])

      /** 取消下载的确认框：讲清会丢掉多少进度、并且不会留在本机。 */
      function renderDownloadCancelDialog() {
        const file = downloadCancelAsk?.file
        const close = () => setDownloadCancelAsk(null)
        const key = file === undefined ? '' : transferKeyOf(activePeer, peerAbsoluteOf(file))
        const job = downloads.find((item) => item.key === key)
        const loaded = job === undefined ? '' : formatBytes(job.loaded)
        const percent = job !== undefined && job.total > 0
          ? Math.min(99, Math.floor((job.loaded / job.total) * 100))
          : null
        const progressText = job === undefined || job.loaded === 0
          ? '正在开始下载'
          : percent === null ? `已下载 ${loaded}` : `已下载 ${percent}%（${loaded}）`
        return dialogShell(close, 'min(380px, 100%)',
          dialogHead(h('span', { style: styles.permWarn }, warningIcon(18)), '取消这次下载？', close),
          h('div', { style: styles.permDialogBody },
            h('p', { style: { margin: 0 } },
              `${baseNameOf(peerAbsoluteOf(file ?? {}))} ${progressText}。取消后这份未完成的文件不会留在本机，之后要重新下载。`),
          ),
          h('div', { style: styles.permDialogFooter },
            h('button', { style: styles.permCancel, onClick: close }, '继续下载'),
            h('button', {
              style: { ...styles.darkButton, background: 'var(--dsw-alias-state-error-primary, #c0392b)' },
              onClick: () => { close(); doCancelDownload(file) },
            }, '取消下载'),
          ))
      }

      const token = status?.token ?? ''
      const masked = token === '' ? '' : `${token.slice(0, 6)}…${token.slice(-4)}`

      /** 必填项：地址、端口、密钥（显示名可空）。 */
      function peerFormIssues() {
        if (editing === null) return []
        const issues = []
        if (String(editing.host ?? '').trim() === '') issues.push('地址')
        const port = String(editing.port ?? '').trim()
        if (port === '') issues.push('端口')
        else if (!/^\d{1,5}$/u.test(port) || Number(port) < 1 || Number(port) > 65535) issues.push('端口')
        if (String(editing.token ?? '').trim() === '') issues.push('密钥')
        return issues
      }

      const peerIssues = peerFormIssues()

      // 会话页按原生版式铺满，不进管理页的卡片布局。
      if (openSession !== null && activePeer !== '') return renderConversation()

      // 「进入」某个他端 = 只看它的主界面；`focusNav === 'list'` 表示已退回远程端列表。
      const focusedPeer = focusNav === 'list'
        ? null
        : focusNav === null
          ? (focusPeer ?? null)
          : (peers.find((item) => item.id === focusNav) ?? null)
      const isFocused = focusedPeer !== null

      return h('div', { style: styles.page, 'data-remote-peers-scroll': '' },
        isFocused ? renderPeerPageHeader(focusedPeer) : null,

        error === '' ? null : h('div', { style: styles.error }, error),

        isFocused ? null : renderLocalGateway(),

        isFocused ? null : h('div', { style: styles.card },
          h('div', { style: styles.row },
            h('h3', { style: styles.title }, PEER_NOUN),
            h('div', { style: { flex: 1 } }),
            h('button', { style: styles.primary, onClick: () => setEditing({ name: '', host: '', port: '', token: '' }) }, '添加'),
          ),
          peers.length === 0
            ? h('div', { style: styles.muted }, `还没有${PEER_NOUN}。在另一台机器装上同一插件、拿到它的地址与密钥后添加。`)
            : h('table', { style: styles.table },
                h('thead', null, h('tr', null,
                  h('th', { style: styles.th }, '名称'),
                  h('th', { style: styles.th }, '地址'),
                  h('th', { style: styles.th }, '状态'),
                  h('th', { style: styles.th }, ''),
                )),
                h('tbody', null, peers.map((peer) => h('tr', { key: peer.id },
                  h('td', { style: styles.td }, peer.name === undefined || peer.name === '' ? h('span', { style: styles.muted }, '（未命名）') : peer.name),
                  h('td', { style: { ...styles.td, ...styles.mono } }, `${peer.host}:${peer.port}`),
                  h('td', { style: { ...styles.td, ...styles.statusCell }, title: ping[peer.id]?.ok === false ? `不可用：${ping[peer.id].reason}` : undefined },
                    ping[peer.id] === undefined
                      ? h('span', { style: styles.muted }, '未检测')
                      : ping[peer.id].ok
                        ? h('span', { style: { color: '#1a7f37' } }, '在线')
                        : h('span', { style: styles.error }, `不可用：${ping[peer.id].reason}`)),
                  h('td', { style: { ...styles.td, whiteSpace: 'nowrap' } },
                    h('div', { style: styles.tableActions },
                      h('button', {
                        style: styles.tableAction,
                        onClick: () => {
                          setFocusNav(peer.id)
                          setActivePeer(peer.id)
                          setSessions([])
                          void loadSessions(peer.id)
                        },
                      }, '进入'),
                      h('button', {
                        style: busy === `ping:${peer.id}` ? { ...styles.tableAction, cursor: 'default', opacity: 0.7 } : styles.tableAction,
                        disabled: busy === `ping:${peer.id}`,
                        onClick: () => void checkPeer(peer.id),
                      }, busy === `ping:${peer.id}`
                        ? h('span', { style: styles.buttonBusy }, spinnerGlyph(12), '检测中')
                        : '检测'),
                      h('button', { style: styles.tableAction, onClick: () => setEditing({ ...peer, token: peer.token }) }, '编辑'),
                      h('button', { style: styles.tableAction, onClick: () => setPeerDelete(peer) }, '删除'),
                    ),
                  ),
                ))),
              ),
          peerDelete === null ? null : renderPeerDeleteDialog(),
        tokenResetAsk ? renderTokenResetDialog() : null,
        downloadCancelAsk === null ? null : renderDownloadCancelDialog(),

        editing === null ? null : h('div', { style: { ...styles.card, background: 'var(--dsh-surface-weak, #fafafa)' } },
            h('div', { style: styles.row },
              field('显示名', editing.name, (value) => { setPeerFormError(''); setEditing({ ...editing, name: value }) }, { width: 180, placeholder: '可留空' }),
              field('地址', editing.host, (value) => {
                setPeerFormError('')
                const split = splitHostPort(value)
                setEditing({ ...editing, ...(split === null ? { host: value } : split) })
              }, { width: 180, required: true, invalid: peerFormError !== '' && peerIssues.includes('地址'), placeholder: '192.168.1.20' }),
              field('端口', editing.port, (value) => {
                setPeerFormError('')
                const split = splitHostPort(value)
                if (split !== null) { setEditing({ ...editing, ...split }); return }
                setEditing({ ...editing, port: value.replace(/[^\d]/gu, '') })
              }, { width: 100, required: true, invalid: peerFormError !== '' && peerIssues.includes('端口'), placeholder: '33938' }),
            ),
            field('密钥', editing.token, (value) => { setPeerFormError(''); setEditing({ ...editing, token: value }) }, { width: '100%', mono: true, required: true, invalid: peerFormError !== '' && peerIssues.includes('密钥') }),
            h('div', { style: styles.row },
              h('button', {
                style: styles.primary,
                onClick: () => {
                  if (peerIssues.length > 0) {
                    setPeerFormError(`请先填写${peerIssues.join('、')}；端口需为 1–65535 的数字。`)
                    return
                  }
                  void savePeer({
                    ...editing,
                    name: String(editing.name ?? '').trim(),
                    host: String(editing.host).trim(),
                    port: Number(editing.port),
                    token: String(editing.token).trim(),
                  })
                },
              }, '保存'),
              h('button', { style: styles.button, onClick: () => { setEditing(null); setPeerFormError('') } }, '取消'),
              h('span', { style: peerFormError === '' ? styles.muted : styles.error }, peerFormError === ''
                ? `显示名可留空；地址可直接粘贴 ip:端口；端口与密钥取自${PEER_NOUN}「远程端互联」页面。`
                : peerFormError),
            ),
          ),
        ),

        activePeer === '' || isFocused === false ? null : renderRemoteSessions(),
        renderViewMenu(),
        wsMenu === null ? null : renderWorkspaceMenu(),
        sessionMenu === null ? null : renderSessionMenu(),
        renameAsk === null ? null : renderRenameDialog(),
        sessionRenameAsk === null ? null : renderSessionRenameDialog(),
        iconHint === null ? null : renderIconHint(),
      )

      /** 重置共享密钥的确认框：重置即刻换新密钥，已登记本机的他端会连不上。 */
      function renderTokenResetDialog() {
        const close = () => setTokenResetAsk(false)
        return dialogShell(close, 'min(380px, 100%)',
          dialogHead(h('span', { style: styles.permWarn }, warningIcon(18)), '重置共享密钥？', close),
          h('div', { style: styles.permDialogBody },
            h('p', { style: { margin: 0 } },
              `重置会立刻换成新的密钥，正在使用的旧密钥随即失效；已经用旧密钥登记过本机的${PEER_NOUN}需要重新填新密钥才能连上。本机对${PEER_NOUN}的记录不受影响。`),
          ),
          h('div', { style: styles.permDialogFooter },
            h('button', { style: styles.permCancel, onClick: close }, '取消'),
            h('button', {
              style: { ...styles.darkButton, background: 'var(--dsw-alias-state-error-primary, #c0392b)' },
              onClick: () => { close(); void resetToken() },
            }, '重置'),
          ))
      }

      /** 删除他端的确认框：不可逆，先讲清只删本机记录、对端不受影响。 */
      function renderPeerDeleteDialog() {
        const peer = peerDelete
        const close = () => setPeerDelete(null)
        const name = peer?.name ? String(peer.name) : `${peer?.host ?? ''}:${peer?.port ?? ''}`
        return dialogShell(close, 'min(380px, 100%)',
          dialogHead(h('span', { style: styles.permWarn }, warningIcon(18)), `删除这个${PEER_NOUN}？`, close),
          h('div', { style: styles.permDialogBody },
            h('p', { style: { margin: 0 } },
              `${name}（${peer?.host ?? ''}:${peer?.port ?? ''}）会从左栏和列表里移除，本机保存的地址与密钥一并删除；${PEER_NOUN}本身不受影响，之后可以重新添加。`),
          ),
          h('div', { style: styles.permDialogFooter },
            h('button', { style: styles.permCancel, onClick: close }, '取消'),
            h('button', {
              style: { ...styles.darkButton, background: 'var(--dsw-alias-state-error-primary, #c0392b)' },
              onClick: () => { const id = peer?.id; close(); void removePeer(id) },
            }, '删除'),
          ))
      }

      /** 活动分类 → 过程行图标（原生 `PROCESS_ICONS` 的对应关系）。 */
      function processIconKeyOf(cat) {
        if (cat === 'read' || cat === 'readImage' || cat === 'webFetch') return 'browse'
        if (cat === 'write') return 'edit'
        if (cat === 'webSearch') return 'globe'
        if (cat === 'thinking') return 'think'
        return PROCESS_ROW_ICONS[cat] === undefined ? 'tools' : cat
      }

      /**
       * 复刻原生 `ProcessGroupHeader`（运行中那一行）：一个图标 + 一条标题。
       * 有在跑的工具就按分类写「正在运行命令 · <任务详情>」；没有就写「正在分析请求 · <推理首行>」。
       * 原生只有这一行 —— 不再另起「已完成分析」和「正在调用工具 · 工具名」两行。
       */
      function renderLiveProcessRow() {
        if (turnStartedAt === 0) return null
        const pending = pendingToolOf()
        const name = pending === null ? '' : (typeof pending.data?.name === 'string' ? pending.data.name : '')
        const cat = pending === null ? 'thinking' : processToolKind(name)
        const detail = pending === null
          ? oneLine(latestParagraphFirstLine(reasoningDisplayText(liveReasoning)).replaceAll('**', ''))
          : processLiveDetailOf(pending)
        const label = pending === null ? '正在分析请求' : processLiveLabelOf(cat)
        return h('div', { style: styles.liveStatusRow, 'data-rp-live-status': cat },
          h('span', { style: styles.liveStatusIcon, 'data-rp-live-icon': cat, dangerouslySetInnerHTML: { __html: PROCESS_ROW_ICONS[processIconKeyOf(cat)] } }),
          h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
            detail === '' ? label : `${label} · ${detail}`),
        )
      }

      /** 快照里仍在进行的那一轮（有 `turn/start` 而没有对应的 `turn/end`）；都收口了返回 undefined。 */
      function runningTurnOf(events) {
        let running
        for (const event of events) {
          if (event?.type === 'turn/start' && typeof event.data?.turn === 'number') {
            running = { turn: event.data.turn, time: event.time }
            continue
          }
          if (event?.type === 'turn/end' && running !== undefined && event.data?.turn === running.turn) running = undefined
        }
        return running
      }

      /** 当前这轮最后一个还没结算的工具调用；没有就返回 null。 */
      function pendingToolOf() {
        const turn = currentTurnRef.current
        if (typeof turn !== 'number') return null
        let pending = null
        for (const event of rawEvents) {
          if (event?.type === 'turn/start' || event?.type === 'turn/end') pending = null
          else if (event?.type === 'tool/call' && event.data?.turn === turn) pending = event
          else if (event?.type === 'tool/result' && event.data?.turn === turn) pending = null
        }
        return pending
      }

      function renderLiveReasoningRow() {
        const text = reasoningDisplayText(liveReasoning)
        const running = liveText === ''
        // 跟随原生 RunningStatus：本轮还在跑就一直挂着这一行（不管这一拍有没有推理文本、正文是否在流）；
        // 轮次收尾由尾部动作行顶掉。轮次结束且没有推理正文时才整行消失。
        const active = turnStartedAt !== 0
        if (!active && text.trim() === '') return null
        // 原生 `.runningDivider`：上一行是输出（工具/正文/推理）时才画那道 0.5px 细线；紧接用户输入不画。
        const divider = active && (text.trim() !== '' || liveText !== '' || pendingToolOf() !== null)
        const expandable = text.trim() !== ''
        const summary = (running ? latestParagraphFirstLine(text) : firstLineOfText(text)).replaceAll('**', '')
        const open = expandable && liveReasoningOpen
        /* 运行中的行按原生 `RunningStatus`：图标常显、不参与 hover 换 chevron（没有可展开的收尾行）。 */
        const swappable = expandable && !active
        const row = h('div', {
          style: expandable ? styles.thinkRow : { ...styles.thinkRow, cursor: 'default' },
          'data-rp-think-row': '',
          'data-rp-think-swap': swappable ? '' : undefined,
          role: expandable ? 'button' : undefined,
          tabIndex: expandable ? 0 : undefined,
          'aria-expanded': expandable ? (open ? 'true' : 'false') : undefined,
          'aria-label': expandable ? '思考' : undefined,
          onKeyDown: (event) => {
            if (!expandable) return
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            setLiveReasoningOpen((value) => !value)
          },
          onClick: expandable ? () => setLiveReasoningOpen((value) => !value) : undefined,
        },
          h('span', { style: styles.thinkLeading },
            open
              ? h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
                  h('path', { d: 'M3 10.5 8 5.5 13 10.5' }))
              : [
                  h('span', { key: 'icon', style: styles.thinkIconIdle, 'data-rp-think-icon': 'think', dangerouslySetInnerHTML: { __html: PROCESS_ROW_ICONS.think } }),
                  swappable ? h('svg', { key: 'chevron', 'data-rp-think-chevron': '', style: styles.thinkChevron, width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
                    h('path', { d: 'M3 5.5 8 10.5 13 5.5' })) : null,
                ]),
          h('span', { style: active ? styles.thinkTitleRunning : styles.thinkTitle }, active ? `正在思考，用时 ${formatRunDuration(Math.max(1000, Date.now() - turnStartedAt))} ···` : '思考'),
          active || open || summary === '' ? null : h('span', { key: 'dot', style: styles.thinkSeparator }),
          active || open || summary === '' ? null : h('span', { key: 'summary', style: running ? styles.thinkSummaryStreaming : styles.thinkSummary },
            renderShimmerText(summary, running)),
        )
        const body = open
          ? h('div', { style: styles.thinkBody },
              hostMarkdown === null
                ? renderRichText(text)
                : wrapMarkdownDelegate(h(hostMarkdown, {
                    text,
                    labels: markdownLabels,
                    streaming: running,
                    variant: 'compact',
                    ...markdownResolvers(messages.length === 0 ? undefined : messages[messages.length - 1].turn),
                  })))
          : null
        return h('div', { key: 'think', style: styles.thinkRoot },
          divider ? h('span', { key: 'divider', style: styles.thinkDivider, 'aria-hidden': 'true' }) : null,
          row,
          body,
        )
      }

      /** 文字 shimmer：底稿始终可读，扫过的那层是 aria-hidden 的遮罩副本。 */
      function renderShimmerText(value, active) {
        const plain = h('span', { style: styles.thinkSummaryText }, value)
        if (!active) return plain
        return h('span', { style: styles.shimmerRoot },
          h('span', { style: styles.shimmerContent }, plain),
          h('span', { 'aria-hidden': 'true', style: styles.shimmerDecoration },
            h('span', { style: styles.shimmerSweep },
              h('span', { style: styles.shimmerContent }, h('span', { style: styles.thinkSummaryText }, value)))),
        )
      }

      function renderLocalGateway() {
        const refreshing = busy === 'status'
        const resetting = busy === 'token'
        return h('div', { style: styles.card },
          h('div', { style: styles.row },
            h('h3', { style: styles.title }, '本机网关'),
            h('div', { style: { flex: 1 } }),
            h('button', {
              style: refreshing ? { ...styles.tableAction, width: 76, cursor: 'default', opacity: 0.7 } : { ...styles.tableAction, width: 76 },
              disabled: refreshing,
              onClick: () => void refresh(),
            }, refreshing
              ? h('span', { style: styles.buttonBusy }, spinnerGlyph(12), '刷新中')
              : '刷新'),
          ),
          h('div', { style: styles.row },
            h('span', { style: styles.muted }, '监听'),
            h('span', { style: styles.mono }, `${status?.host ?? '0.0.0.0'}:${status?.port ?? '—'}`),
          ),
          h('div', { style: styles.row },
            h('span', { style: styles.muted }, '局域网地址'),
            status === null || (status.addresses ?? []).length === 0
              ? h('span', { style: styles.mono }, '未检测到非回环网卡')
              : h('span', { style: styles.addressList },
                  (status.addresses ?? []).map((item) => {
                    const address = `${item.split(' ')[0]}:${status.port}`
                    const done = copiedAddress === address
                    return h('span', { key: address, style: styles.addressChip, title: item },
                      h('span', { style: styles.mono }, address),
                      h('button', {
                        type: 'button',
                        title: done ? '已复制' : '复制',
                        'aria-label': done ? `已复制 ${address}` : `复制 ${address}`,
                        style: done ? styles.addressCopyDone : styles.addressCopy,
                        onClick: () => void copyAddress(address),
                      }, done ? checkGlyph(13) : copyGlyph(13)))
                  })),
          ),
          h('div', { style: styles.row },
            h('span', { style: styles.muted }, '共享密钥'),
            h('span', { style: { ...styles.mono, wordBreak: 'break-all' } }, tokenVisible ? token : masked),
            h('button', { style: styles.button, onClick: () => setTokenVisible((value) => !value) }, tokenVisible ? '隐藏' : '显示'),
            h('button', {
              style: tokenCopied ? styles.buttonCopied : styles.button,
              onClick: () => void copyToken(),
            }, tokenCopied
              ? h('span', { key: 'copied', style: styles.buttonBusy }, checkGlyph(12), '已复制')
              : h('span', { key: 'copy', style: styles.buttonBusy }, '复制')),
            h('button', {
              style: resetting ? { ...styles.button, cursor: 'default', opacity: 0.7 } : styles.button,
              disabled: resetting,
              onClick: () => setTokenResetAsk(true),
            }, resetting ? h('span', { style: styles.buttonBusy }, spinnerGlyph(12), '重置中…') : '重置'),
          ),
          h('div', { style: styles.muted }, `来源白名单：${(status?.allowedCidrs ?? []).join('、')}`),
        )
      }

      /** 相对时间（原生左栏口径：刚刚 / N分钟 / N小时 / N天，超一周给日期）。 */
      function relativeTimeText(value) {
        if (value === 0 || value === '' || value === null || value === undefined) return ''
        const stamp = typeof value === 'number' ? value : Date.parse(String(value))
        if (!Number.isFinite(stamp)) return ''
        const diff = Date.now() - stamp
        if (diff < 60_000) return '刚刚'
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟`
        if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时`
        if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}天`
        return new Date(stamp).toLocaleDateString()
      }

      /**
       * 树行的通用外壳：缩进按层级、右侧列固定不挤。行本体是 div（行内还要放按钮，
       * 原生这两层也是 div + role=button），键盘 Enter/Space 与点击同效。
       * hover 外观（底色、动作列/常态列的互换、文件夹/三角的互换）全走 CSS 的 `:hover`，
       * 这里只挂 `data-rp-row`（及 `data-rp-open`）让样式表选中。
       */
      function treeRowShell(key, depth, body, onClick, title, attrs = {}) {
        return h('div', {
          key,
          role: 'button',
          tabIndex: 0,
          // 只留 aria-label：`title` 会冒出浏览器原生提示条，和行内按钮的自绘 tooltip 打架
          'aria-label': title,
          ...attrs,
          style: { ...styles.sessionTreeRow, paddingLeft: 8 + depth * 16 },
          onClick,
          onKeyDown: (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            onClick()
          },
        }, body)
      }

      /** 工作区行：chevron + 文件夹图标 + 名字，点击折叠/展开；右侧是「⋯ + 新会话」两枚图标钮。
          原生 `.projectRow` 只有 folder/chevron/名字与动作，不显示数量/时间（`.rowResting`/`.rowActions` 互换）。 */
      function renderTreeFolder(key, depth, label, workspaceId) {
        const open = sessionTreeOpen[key] !== false
        // 菜单开着的那一行保持展开态外观（原生 `.projectRow.menuOpen` 让 `.rowActions` 一直显示）
        const menuOpen = wsMenu !== null && wsMenu.workspaceId === workspaceId
        const busy = workspaceId !== undefined && creatingIn === workspaceId
        const actions = workspaceId !== undefined
          ? [h('div', { key: 'actions', style: styles.sessionTreeActions, 'data-rp-actions': '' },
                  h('button', {
                    key: 'menu',
                    type: 'button',
                    'aria-label': '更多',
                    'data-rp-anchor': '',
                    style: styles.sessionTreeAction,
                    onMouseEnter: (event) => {
                      event.currentTarget.style.color = T.pri
                      showHint(`menu:${key}`, '更多', event)
                    },
                    onMouseLeave: (event) => {
                      event.currentTarget.style.color = ''
                      hideHint(`menu:${key}`)
                    },
                    onClick: (event) => {
                      // 别冒泡到行本身（那会折叠/展开）
                      event.stopPropagation()
                      hideHint(`menu:${key}`)
                      if (wsMenu !== null && wsMenu.workspaceId === workspaceId) {
                        setWsMenu(null)
                        return
                      }
                      const rect = event.currentTarget.getBoundingClientRect()
                      setSessionMenu(null)
                      setWsMenu({ workspaceId, title: label, top: clampMenuTop(rect), left: clampMenuLeft(rect.left) })
                    },
                  }, h('span', { style: styles.sessionTreeEllipsis }, '⋯')),
                  h('button', {
                    key: 'new',
                    type: 'button',
                    'aria-label': '新会话',
                    style: busy ? { ...styles.sessionTreeAction, cursor: 'default' } : styles.sessionTreeAction,
                    disabled: busy,
                    onMouseEnter: (event) => {
                      event.currentTarget.style.color = T.pri
                      showHint(`new:${key}`, '新会话', event)
                    },
                    onMouseLeave: (event) => {
                      event.currentTarget.style.color = ''
                      hideHint(`new:${key}`)
                    },
                    onFocus: (event) => showHint(`new:${key}`, '新会话', event),
                    onBlur: () => hideHint(`new:${key}`),
                    onClick: (event) => {
                      event.stopPropagation()
                      void createSessionIn(workspaceId)
                    },
                  }, busy ? spinnerGlyph(12) : newChatGlyph(14)),
                )]
          : []
        return treeRowShell(key, depth,
          [
            // 原生 `.slot`：常态是文件夹，hover 换成实心三角（`.folder`/`.chevron` 在 CSS 里 display 互换）
            h('span', { key: 'lead', style: styles.treeLeadSlot },
              h('span', { key: 'folder', 'data-rp-folder-icon': '' }, navFolderGlyph(open)),
              h('span', { key: 'chevron', 'data-rp-chevron': '' }, triangleFillGlyph(open))),
            h('span', { key: 'label', style: styles.sessionTreeLabel }, label),
            ...actions,
          ],
          () => setSessionTreeOpen((previous) => ({ ...previous, [key]: previous[key] === false })),
          label,
          menuOpen ? { 'data-rp-row': 'folder', 'data-rp-open': 'true' } : { 'data-rp-row': 'folder' },
        )
      }

      /**
       * 会话行：常态右侧是「相对时间 +（置顶时的）静态图钉」，hover 换成「⋯ + 归档 + 置顶」三枚图标钮
       * —— 原生 `rowActions`（`contextMenu.button` 在前，`rowQuickActions` 里归档再置顶）。
       * 已归档行留在原位、不带前导标记、只把标题降一档灰；置顶钮在归档行不渲染（`PinSession` 的 `if (archived) return null`）。
       * 两侧同时挂在 DOM 里，由 CSS `:hover` 决定谁显示 —— 行被移除后浏览器会把 hover 交给下一行。
       * 标题双击进重命名（原生 `SessionNodeItem` 的 `renameArmed` + `onDoubleClick`）。
       */
      function renderTreeSession(session, depth) {
        const key = `s:${session.sessionId}`
        const pinned = pinnedIds.map(String).includes(String(session.sessionId))
        const archived = archivedIds.map(String).includes(String(session.sessionId))
        const menuOpen = sessionMenu !== null && String(sessionMenu.sessionId) === String(session.sessionId)
        const iconButton = (id, label, glyph, onClick) => h('button', {
          key: id,
          type: 'button',
          'aria-label': label,
          style: styles.sessionTreeAction,
          onMouseEnter: (event) => {
            event.currentTarget.style.color = T.pri
            showHint(`${id}:${key}`, label, event)
          },
          onMouseLeave: (event) => {
            event.currentTarget.style.color = ''
            hideHint(`${id}:${key}`)
          },
          onClick: (event) => {
            event.stopPropagation()
            hideHint(`${id}:${key}`)
            onClick(event)
          },
        }, glyph)
        const actions = h('div', { key: 'actions', style: styles.sessionTreeActions, 'data-rp-actions': '' },
          iconButton('menu', '更多', h('span', { style: styles.sessionTreeEllipsis }, '⋯'), (event) => {
            if (menuOpen) {
              setSessionMenu(null)
              return
            }
            const rect = event.currentTarget.getBoundingClientRect()
            setSessionMenu({
              sessionId: session.sessionId,
              title: sessionTitle(session),
              top: clampMenuTop(rect, 168),
              left: clampMenuLeft(rect.left),
            })
          }),
          iconButton('archive', archived ? '取消归档' : '归档会话', archiveGlyph(14),
            () => void toggleSessionFlag(archived ? 'workspace/unarchiveSession' : 'workspace/archiveSession', 'archivedSessionIds', session.sessionId)),
          archived ? null : iconButton('pin', pinned ? '取消置顶' : '置顶会话', pinGlyph(14, pinned),
            () => void toggleSessionFlag(pinned ? 'workspace/unpinSession' : 'workspace/pinSession', 'pinnedSessionIds', session.sessionId)))
        return treeRowShell(key, depth,
          [
            h('span', {
              key: 'label',
              style: archived ? { ...styles.sessionTreeLabel, ...styles.sessionTreeLabelArchived } : styles.sessionTreeLabel,
              onDoubleClick: (event) => {
                event.stopPropagation()
                openSessionRename(session.sessionId, sessionTitle(session))
              },
            }, sessionTitle(session)),
            actions,
            h('span', { key: 'resting', style: styles.sessionTreeResting, 'data-rp-resting': '' },
              h('span', { key: 'time', style: styles.sessionTreeTime }, relativeTimeText(session.updatedAt)),
              pinned && !archived
                ? h('span', { key: 'pin', style: styles.sessionTreePin, 'aria-label': '已置顶', role: 'img' }, pinGlyph(14, true))
                : null),
          ],
          () => void openRemoteSession(activePeer, session.sessionId),
          `${sessionTitle(session)} · ${session.sessionId} · ${session.cwd ?? ''}`,
          menuOpen ? { 'data-rp-row': 'session', 'data-rp-open': 'true' } : { 'data-rp-row': 'session' },
        )
      }

      /** 置顶次序：命中的按下标排前（原生 `sectionMembers` 把 pinned 放在其余之前）。 */
      function pinRankOf(session) {
        const index = pinnedIds.map(String).indexOf(String(session.sessionId))
        return index < 0 ? Number.MAX_SAFE_INTEGER : index
      }

      /** 会话最近时间（数字或 ISO 都认）。 */
      function stampOf(row) {
        const value = row?.updatedAt
        const stamp = typeof value === 'number' ? value : Date.parse(String(value ?? ''))
        return Number.isFinite(stamp) ? stamp : 0
      }

      /** 按视图选项（筛选 + 搜索 + 排序）挑出要显示的会话。 */
      function visibleSessions() {
        const archivedSet = new Set(archivedIds.map(String))
        const keyword = sessionQuery.trim().toLowerCase()
        const list = sessions.filter((session) => {
          const archived = archivedSet.has(String(session.sessionId))
          if (archiveFilter === 'hide' && archived) return false
          if (archiveFilter === 'only' && !archived) return false
          // 原生 tree.ts：未使用过的空会话（blank）只在它自己被选中时可见
          if (session.blank === true && String(session.sessionId) !== String(openSession)) return false
          if (keyword === '') return true
          // 只匹配会话名称（原生「搜索会话名称」）：带上 cwd 会把路径里凑巧含关键词的会话也搜出来
          return sessionTitleOf(session.sessionId).toLowerCase().includes(keyword)
        })
        // 排序：置顶的在前（按置顶次序），其余固定按最近更新（视图选项不再提供排序入口）。
        list.sort((left, right) => pinRankOf(left) - pinRankOf(right) || stampOf(right) - stampOf(left))
        return { list: [...list], archivedSet }
      }

      /** 一组会话行（按当前排序）。 */
      function sessionRows(rows, depth) {
        return rows.map((session) => renderTreeSession(session, depth))
      }

      /** Host 风格的目录归一：Windows 盘符统一成正斜杠、去掉尾斜杠（原生 `folderPath`）。 */
      function folderPathOf(path) {
        const value = String(path ?? '')
        if (value === '') return ''
        const windows = /^[A-Za-z]:[/\\]/u.test(value) || value.startsWith('\\\\')
        return (windows ? value.replaceAll('\\', '/') : value).replace(/\/+$/u, '')
      }

      /** 离它最近的已注册上级工作区（原生 `owningParentFolder`：只认已注册工作区，不拆中间目录）。 */
      function owningParentOf(workspace, all) {
        const child = folderPathOf(workspace.path)
        if (child === '') return undefined
        let owner
        let length = -1
        for (const candidate of all) {
          if (candidate.workspaceId === workspace.workspaceId) continue
          const root = folderPathOf(candidate.path)
          if (root === '' || root.length <= length || child === root) continue
          if (!child.startsWith(`${root}/`)) continue
          owner = String(candidate.workspaceId)
          length = root.length
        }
        return owner
      }

      /** 工作区分组（原生 `groupByWorkspace`）：成员取 `workspace.sessionIds`，置顶的排在本组最前。 */
      function workspaceGroupsOf(list) {
        const byId = new Map(list.map((session) => [session.sessionId, session]))
        const claimed = new Set()
        const groups = workspaces
          .map((workspace) => {
            const rows = (Array.isArray(workspace.sessionIds) ? workspace.sessionIds : [])
              .map((id) => byId.get(id))
              .filter((session) => session !== undefined)
            for (const row of rows) claimed.add(row.sessionId)
            rows.sort((left, right) => pinRankOf(left) - pinRankOf(right))
            const stored = String(workspace.title ?? workspace.path ?? '')
            return {
              key: `ws:${workspace.workspaceId}`,
              workspaceId: String(workspace.workspaceId),
              // 原生 `workspaceDisplayTitle`：首次使用的工作区目录名按语言显示成「默认工作区」
              title: stored === 'default-workspace' ? '默认工作区' : (stored === '' ? '未命名工作区' : stored),
              parent: owningParentOf(workspace, workspaces),
              rows,
            }
          })
          // 原生 groupByWorkspace：除「仅看已归档」时无成员跳过外，每个工作区都出一行（空工作区照样显示）
          .filter((group) => archiveFilter !== 'only' || group.rows.length > 0)
        const orphans = list.filter((session) => !claimed.has(session.sessionId))
        return { groups, orphans }
      }

      /** 工作区行，展开时再挂上它的会话行。超过水位（原生 `SESSION_WATERMARK_BASE = 5`）折成一行「展开其余 N 个会话」。 */
      function folderRows(group, depth, open) {
        const rows = [renderTreeFolder(group.key, depth, group.title, group.workspaceId)]
        if (!open) return rows
        const limit = sessionMarks[group.key] ?? SESSION_WATERMARK_BASE
        const shown = group.rows.length > limit ? group.rows.slice(0, limit) : group.rows
        for (const session of shown) rows.push(renderTreeSession(session, depth + 1))
        if (group.rows.length <= SESSION_WATERMARK_BASE) return rows
        const expanded = shown.length === group.rows.length
        rows.push(h('button', {
          key: `overflow:${group.key}`,
          type: 'button',
          style: { ...styles.sessionOverflow, paddingLeft: 8 + (depth + 1) * 16 + 22 },
          'data-row-key': `overflow:${group.key}`,
          'aria-expanded': expanded,
          onMouseEnter: (event) => { event.currentTarget.style.color = T.sec },
          onMouseLeave: (event) => { event.currentTarget.style.color = T.ter },
          onClick: () => setSessionMarks((previous) => {
            if (expanded) {
              const next = { ...previous }
              delete next[group.key]
              return next
            }
            const remaining = group.rows.length - limit
            return { ...previous, [group.key]: remaining <= SESSION_WATERMARK_BASE ? Number.POSITIVE_INFINITY : limit + SESSION_WATERMARK_BASE }
          }),
        }, expanded ? '收起' : `展开其余 ${group.rows.length - shown.length} 个会话`))
        return rows
      }

      /**
       * 工作区段：`nested` 为假时平铺（原生「按工作区」），为真时按目录包含关系嵌套工作区（原生「按工作区树」
       * —— 只嵌已注册工作区，不把中间目录拆成行；没有归属的会话单独挂在「未分组」）。
       */
      function renderWorkspaceSection(groups, orphans, nested) {
        const orphan = orphans.length > 0
          ? { key: 'orphans', title: '未分组', workspaceId: undefined, parent: undefined, rows: orphans }
          : null
        if (!nested) {
          const rows = []
          for (const group of groups) rows.push(...folderRows(group, 0, sessionTreeOpen[group.key] !== false))
          if (orphan !== null) rows.push(...folderRows(orphan, 0, sessionTreeOpen[orphan.key] !== false))
          return rows
        }
        const children = new Map()
        for (const group of orphan === null ? groups : [...groups, orphan]) {
          const owner = group.parent === undefined ? undefined : `ws:${group.parent}`
          const siblings = children.get(owner)
          if (siblings === undefined) children.set(owner, [group])
          else siblings.push(group)
        }
        const rows = []
        const emit = (group, depth) => {
          const kids = children.get(group.key) ?? []
          // 与 `renderTreeFolder` 同一口径：没点过就是展开（用户要求树默认全展开，不套原生「叶子收起」）
          const open = sessionTreeOpen[group.key] !== false
          rows.push(...folderRows(group, depth, open))
          if (!open) return
          for (const child of kids) emit(child, depth + 1)
        }
        for (const group of children.get(undefined) ?? []) emit(group, 0)
        return rows
      }

      /** 会话树：`workspace` 按工作区分组、`tree` 按工作区树、`list` 单列表。 */
      function renderSessionList() {
        const { list } = visibleSessions()

        if (list.length === 0) {
          return h('div', { style: styles.muted },
            sessions.length === 0 ? '没有读到会话。' : '没有匹配的会话。')
        }
        if (groupMode === 'list') {
          return h('div', { style: styles.sessionTree }, sessionRows(list, 0))
        }
        const { groups, orphans } = workspaceGroupsOf(list)
        // 原生没有「已归档」分组：归档会话留在所属工作区内（按筛选显隐）、只在标题降一档灰
        return h('div', { style: styles.sessionTree }, renderWorkspaceSection(groups, orphans, groupMode === 'tree'))
      }

      /** 对端显示名：优先用户填的名字，没有就用 host:port。 */
      function peerNameOf(id) {
        const peer = peers.find((item) => item.id === id)
        return peer?.name || (peer === undefined ? '远程端' : `${peer.host}:${peer.port}`)
      }

      /** 回到远程端列表：断开该端的流与选中态，恢复管理页。 */
      function backToPeerList() {
        setFocusNav('list')
        closeStream()
        closeEvents()
        closeWorkspaceStream()
        setActivePeer('')
        setSessionMenu(null)
        setSessions([])
        setOpenSession(null)
        setSessionQuery('')
        setSessionSearchOpen(false)
        setViewMenu(null)
      }

      /** 远程端主界面头部：醒目的「返回远程端列表」胶囊 + 该端标题与地址。 */
      function renderPeerPageHeader(peer) {
        const hoverOn = (event) => {
          event.currentTarget.style.background = T.hover
          event.currentTarget.style.borderColor = 'var(--dsw-alias-border-l3, #d0d3d6)'
        }
        const hoverOff = (event) => {
          event.currentTarget.style.background = 'var(--dsw-alias-bg-base, #fff)'
          event.currentTarget.style.borderColor = 'var(--dsw-alias-border-l2, #e3e4e6)'
        }
        return h('div', { style: styles.peerPageHeader },
          h('button', {
            type: 'button',
            style: styles.peerBackPill,
            onMouseEnter: hoverOn,
            onMouseLeave: hoverOff,
            onClick: backToPeerList,
          }, backArrowGlyph(16), h('span', null, '返回远程端列表')),
          h('div', null,
            h('h2', { style: styles.peerTitle }, peer.name || `${peer.host}:${peer.port}`),
            h('div', { style: styles.muted }, `${peer.host}:${peer.port}`)),
        )
      }

      /** 「视图选项」浮层：分组方式 / 排序方式 / 筛选会话，三段与原生左栏同一套文案。 */
      function renderViewMenu() {
        if (viewMenu === null) return null
        const section = (label, items) => [
          h('div', { key: `h:${label}`, style: styles.viewMenuHead }, label),
          ...items.map((item) => h('button', {
            key: item.label,
            type: 'button',
            style: { ...styles.pathMenuItem, minHeight: 32 },
            onClick: () => { item.select(); setViewMenu(null) },
          },
            h('span', { style: styles.viewMenuIcon }, item.icon()),
            h('span', { style: { flex: 1, minWidth: 0 } }, item.label),
            item.active() ? h('span', { style: styles.viewMenuCheck }, checkGlyph()) : null,
          )),
        ]
        return h('div', {
          style: { ...styles.pathMenu, top: viewMenu.top, right: viewMenu.right, minWidth: 224, padding: 6 },
          'data-dsh-popup': '',
          onClick: (event) => event.stopPropagation(),
        },
          section('分组方式', [
            { label: '按工作区', icon: folderGlyph, active: () => groupMode === 'workspace', select: () => setGroupMode('workspace') },
            { label: '按工作区树', icon: () => navFolderGlyph(true), active: () => groupMode === 'tree', select: () => setGroupMode('tree') },
            { label: '单列表', icon: listGlyph, active: () => groupMode === 'list', select: () => setGroupMode('list') },
          ]),
          h('div', { style: styles.viewMenuDivider }),
          section('筛选会话', [
            { label: '隐藏已归档', icon: eyeOffGlyph, active: () => archiveFilter === 'hide', select: () => setArchiveFilter('hide') },
            { label: '全部对话（显示已归档）', icon: chatGlyph, active: () => archiveFilter === 'all', select: () => setArchiveFilter('all') },
            { label: '仅显示已归档', icon: archiveGlyph, active: () => archiveFilter === 'only', select: () => setArchiveFilter('only') },
          ]),
        )
      }

      /** 图标钮的原生深色 tooltip：贴按钮下缘居中，靠窗右缘时自动夹回视口内。 */
      function renderIconHint() {
        return h('div', {
          key: `hint-${iconHint.key}`,
          style: { ...styles.iconTooltip, top: iconHint.top, left: iconHint.left },
          ref: (element) => {
            if (element === null) return
            const half = element.offsetWidth / 2
            const min = half + 12
            const max = Math.max(min, window.innerWidth - half - 12)
            const clamped = Math.min(Math.max(iconHint.left, min), max)
            if (Math.abs(clamped - iconHint.left) > 0.5) element.style.left = `${clamped}px`
          },
        }, h('span', null, iconHint.label))
      }

      function renderRemoteSessions() {
        /** 图标钮的原生 tooltip（深色气泡，贴着按钮下缘居中）。 */
        const hintOf = (label) => ({
          key: `rp-session-${label}`,
          onMouseEnter: (event) => {
            const rect = event.currentTarget.getBoundingClientRect()
            setIconHint({ key: `rp-session-${label}`, label, top: rect.bottom + 8, left: rect.left + rect.width / 2 })
          },
          onMouseLeave: () => setIconHint(null),
        })
        return h('div', { style: styles.card, 'data-rp-tree': '' },
          h('div', { style: styles.row },
            h('h3', { style: styles.title }, '会话'), h('div', { style: { flex: 1 } }),
            // 搜索展开后就地变成一条 240px 的输入框（原生只占工具条这一小段，不铺满整行）
            sessionSearchOpen
              ? h('div', {
                  style: styles.sessionSearchField,
                  'data-dsh-popup': '',
                  onClick: (event) => event.stopPropagation(),
                },
                h('span', { style: styles.sessionSearchIcon }, searchGlyph(13)),
                h('input', {
                  type: 'text',
                  autoFocus: true,
                  value: sessionQuery,
                  placeholder: '搜索会话名称',
                  style: styles.sessionSearchInput,
                  onChange: (event) => setSessionQuery(event.target.value),
                  onKeyDown: (event) => { if (event.key === 'Escape') { setSessionQuery(''); setSessionSearchOpen(false) } },
                }),
                // 只有一个清除钮：取消搜索并清空关键词
                h('button', {
                  type: 'button',
                  style: styles.sessionSearchClear,
                  'aria-label': '取消搜索',
                  title: '取消搜索',
                  onClick: () => { setSessionQuery(''); setSessionSearchOpen(false); setIconHint(null) },
                }, closeGlyph(12)),
              )
              : h('button', {
                  type: 'button',
                  style: styles.ghostIconTool,
                  'aria-label': '搜索',
                  ...hintOf('搜索'),
                  // 点开输入框时这个图标钮会卸载，mouseleave 不会再触发，气泡要在这里手动收掉
                  onClick: () => { setIconHint(null); setSessionQuery(''); setSessionSearchOpen(true) },
                }, searchGlyph()),
            h('button', {
              type: 'button',
              style: viewMenu === null ? styles.ghostIconTool : { ...styles.ghostIconTool, ...styles.ghostIconToolActive },
              'aria-label': '视图选项',
              'data-rp-anchor': '',
              ...hintOf('视图选项'),
              onClick: (event) => {
                // 别让这次点击冒泡到 window，否则 useDismiss 挂上的空白点击会立刻关掉刚开的浮层
                event.stopPropagation()
                if (viewMenu !== null) { setViewMenu(null); return }
                const rect = event.currentTarget.getBoundingClientRect()
                setIconHint(null)
                setViewMenu({ top: rect.bottom + 6, right: Math.max(8, globalThis.innerWidth - rect.right) })
              },
            }, slidersGlyph()),
          ),
          h('div', { style: styles.muted }, `${peerNameOf(activePeer)} · ${groupMode === 'workspace' ? '工作区 → 会话' : groupMode === 'tree' ? '工作区目录树' : '单列表'}`),
          interactions.length === 0 ? null : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 } },
            interactions.map((item) => h('div', { key: item.eventId, style: { ...styles.card, background: 'var(--dsh-surface-weak, #fafafa)' } },
              h('div', { style: styles.row },
                h('span', { style: { fontWeight: 600, fontSize: 13 } },
                  item.kind === 'approval' ? `需要审批：${item.toolName}` : `需要回答：${item.toolName}`),
                h('span', { style: styles.muted }, item.detail),
                item.sessionId === '' ? null : h('span', { style: { ...styles.mono, opacity: 0.55 } }, item.sessionId),
              ),
              h('div', { style: styles.row },
                item.kind === 'approval' ? h('button', { style: styles.primary, onClick: () => void answerInteraction(item, 'allowed-once') }, '允许一次') : null,
                item.kind === 'approval' ? h('button', { style: styles.button, onClick: () => void answerInteraction(item, 'rejected') }, '拒绝') : null,
                h('button', { style: styles.button, onClick: () => void answerInteraction(item, 'next') },
                  item.kind === 'approval' ? '交给下一个处理器' : '跳过（不在这里回答）'),
              ),
            )),
          ),
          busy === 'history' || busy === 'sessions' ? h('div', { style: styles.muted }, '读取中…') : null,
          sessions.length === 0
            ? h('div', { style: styles.muted }, '没有读到会话。')
            : renderSessionList(),
        )
      }

      /** 会话标题：取列表里的标题投影，没有则用 sessionId。 */
      function sessionTitleOf(sessionId) {
        const item = sessions.find((session) => session.sessionId === sessionId)
        // 原生 Rows.tsx displayTitle：blank 显示「新会话」，否则标题或「未命名」
        if (item?.blank === true) return '新会话'
        const title = item?.projections?.values?.title
        return typeof title === 'string' && title !== '' ? title : '未命名'
      }


      /** 轮次导航条目 —— 原生 `mergeTurnRailItems`：先取 `turnOutline` 投影（宿主折好了 每条会话的全部轮次：turn / seq / 提问 / 回答预览，不需要读全量日志），再用当前窗口 已加载的轮覆盖一次（拿到可跳转的定位）。未加载的轮沿用投影里的 seq。 */
      function railItems() {
        const byTurn = new Map()
        const outline = projections?.turnOutline
        if (Array.isArray(outline)) {
          for (const entry of outline) {
            if (typeof entry?.turn !== 'number' || typeof entry?.seq !== 'number') continue
            byTurn.set(entry.turn, {
              turn: entry.turn,
              seq: entry.seq,
              prompt: oneLine(entry.prompt),
              response: oneLine(entry.response),
              loaded: false,
            })
          }
        }
        const loaded = new Map()
        let current = null
        for (const event of [...olderRecordsRef.current.map((record) => record?.event), ...rawEvents]) {
          if (event?.type === 'turn/start') {
            current = event.data?.turn
            if (!loaded.has(current)) loaded.set(current, { turn: current, prompt: '', response: '' })
            continue
          }
          if (event?.type === 'user/message') {
            const item = typeof current === 'number' ? loaded.get(current) : undefined
            if (item === undefined || item.prompt !== '') continue
            const text = oneLine(textOf(event.data?.content))
            if (text !== '') item.prompt = text
            continue
          }
          if (event?.type === 'agent/inbox/spliced') {
            // 队列插入/撤回：还在排队的提问不属于任何一轮，刻度的提问只看 `user/message`。
            continue
          }
          if (event?.type === 'assistant/message') {
            const item = loaded.get(event.data?.turn)
            if (item !== undefined && item.response === '') item.response = oneLine(textOf(event.data?.message?.content))
          }
        }
        for (const item of loaded.values()) {
          const previous = byTurn.get(item.turn)
          byTurn.set(item.turn, {
            turn: item.turn,
            seq: previous?.seq ?? null,
            prompt: item.prompt !== '' ? item.prompt : previous?.prompt ?? '',
            response: item.response !== '' ? item.response : previous?.response ?? '',
            loaded: true,
          })
        }
        return [...byTurn.values()].sort((left, right) => left.turn - right.turn)
      }

      /** 历史边缘提示（原生 `.older`）：还有更早的历史时是可点的「加载更早的消息」， 翻完以后变成禁用的「已到会话开头」——它就在消息列最顶上，滚到顶才看得见。 */
      function renderHistoryEdge() {
        return h('div', { style: styles.historyEdge },
          h('button', {
            type: 'button',
            disabled: !historyMore,
            style: historyMore ? styles.historyEdgeButton : { ...styles.historyEdgeButton, cursor: 'default', opacity: 0.6 },
            onClick: () => { if (historyMore) void loadOlderHistory(activePeer, openSession) },
          }, historyMore ? '加载更早的消息' : '已到会话开头'),
        )
      }

      /** 某一轮提问行（`data-rp-turn-anchor`）；缺失时退到该轮任意一行。 */
      function turnAnchorOf(turn) {
        const body = bodyRef.current
        if (body === null) return null
        return body.querySelector(`[data-rp-turn-anchor="${turn}"]`)
          ?? body.querySelector(`[data-rp-turn="${turn}"]`)
      }

      /** 等 React 把新窗口渲染进 DOM：连等几帧，出现目标行就提前返回。 */
      async function settleFrames(turn, frames) {
        for (let index = 0; index < frames; index++) {
          if (turnAnchorOf(turn) !== null) return
          await new Promise((resolve) => { requestAnimationFrame(resolve) })
        }
      }

      /**
       * 跳到某一轮：已加载的直接滚到它的锚点；未加载的按原生 `JumpPages` 口径先向
       * `beforeSeq` 翻页，直到窗口覆盖该轮的 seq 再滚动 —— 不预读整段历史。
       */
      async function jumpToTurn(item) {
        if (olderStateRef.current.loading) return
        let guard = 0
        while (guard < 20) {
          if (turnAnchorOf(item.turn) !== null) break
          const first = olderRecordsRef.current[0]?.event?.seq ?? eventsMirrorRef.current[0]?.seq
          if (typeof item.seq !== 'number' || typeof first !== 'number' || first <= item.seq) break
          if (!olderStateRef.current.hasMore) break
          await loadOlderHistory(activePeer, openSession)
          // 翻页只是把新窗口交给 React：`setMessages` 要到下一帧才落到 DOM，
          // 不等它就直接判定“没有这一轮”，跳转会被静默丢掉（最早那根刻度就是这么失灵的）。
          await settleFrames(item.turn, 6)
          guard += 1
        }
        // 原生 `scrollToTurn` 是 `align(row, 24)`：让这条用户消息的顶边落在滚动口顶部
        // 往下 24px（整条气泡完整可见，而不是压在上沿或落在半屏中间）。用 rect 差值而不是
        // `offsetTop`，否则嵌套容器多一层 offsetParent 就会算错位置。
        const land = () => {
          const body = bodyRef.current
          if (body === null) return
          const anchor = turnAnchorOf(item.turn)
          if (anchor === null) return
          const delta = anchor.getBoundingClientRect().top - body.getBoundingClientRect().top
          body.scrollTop += delta - 24
        }
        for (let attempt = 0; attempt < 4; attempt++) {
          land()
          await new Promise((resolve) => { requestAnimationFrame(resolve) })
        }
        // 落点已经确定，高亮不必等下一次 scroll 事件再跟上。
        setRailTurn(item.turn)
      }

      /** 轮次导航（原生 `TurnNavigator`）：右侧 28px 竖轨、10px 固定步距的 20×2 刻度。 初始就画出全部轮次（来自 `turnOutline` 投影），已加载的实心、未加载的 0.4 缩进半透明， 当前轮最深；悬停/聚焦出预览卡：300px、`radius-lg`、layer-1 底 + p... */
      function renderTurnRail() {
        const items = railItems()
        if (items.length < 2) return null
        const height = Math.min(420, items.length * 10 + 12)
        const previewIndex = railPreview === null ? -1 : items.findIndex((item) => item.turn === railPreview)
        const preview = previewIndex < 0 ? null : items[previewIndex]
        const center = 6 + previewIndex * 10 + 5
        const topInRail = Math.max(0, Math.min(height - 100, center - 50))
        // 竖轨是垂直居中的：预览卡的 top 以「槽中线 + 轨内偏移」表达，才对得上原生
        // `--turn-preview-center`（相对轨的坐标，不是相对整页）。
        const previewTop = `calc(50% + ${topInRail - height / 2}px)`
        return h('div', { style: styles.turnRailSlot },
          h('div', {
            style: { ...styles.turnRail, maxHeight: `${height}px` },
            'data-rp-turn-rail': '',
            role: 'navigation',
            'aria-label': '轮次导航',
            onPointerLeave: () => setRailPreview(null),
          },
          h('div', { style: styles.turnRailTrack },
            items.map((item, index) => {
              const active = item.turn === railTurn
              const hovering = item.turn === railPreview
              const tickScale = active || hovering ? (active ? 1 : 0.9) : item.loaded ? 0.6 : 0.4
              const tickColor = active
                ? T.pri
                : hovering ? T.ter : 'var(--dsw-alias-border-l4, rgba(0,0,0,0.14))'
              return h('button', {
                key: `${index}`,
                type: 'button',
                style: item.loaded ? styles.turnRailMark : { ...styles.turnRailMark, opacity: 0.6 },
                'aria-label': item.loaded ? `跳到第 ${item.turn} 轮` : `加载并跳到第 ${item.turn} 轮`,
                'aria-current': active ? 'true' : undefined,
                onPointerMove: () => { if (railPreview !== item.turn) setRailPreview(item.turn) },
                onFocus: () => setRailPreview(item.turn),
                onBlur: () => setRailPreview(null),
                onClick: () => { void jumpToTurn(item) },
              }, h('span', {
                style: {
                  ...styles.turnRailTick,
                  transform: `translateY(-50%) scaleX(${tickScale})`,
                  background: tickColor,
                },
                'aria-hidden': 'true',
              }))
            }),
          ),
          ),
          preview === null ? null : h('div', {
            role: 'tooltip',
            style: { ...styles.turnPreview, top: previewTop },
          },
          h('div', { style: styles.turnPreviewPrompt }, preview.prompt === '' ? `第 ${preview.turn} 轮` : preview.prompt),
          preview.response === '' ? null : h('div', { style: styles.turnPreviewResponse }, preview.response),
          ),
        )
      }

      /** 会话归到的工作区：按工作区流里的 `sessionIds` 反查，查不到给 null（不猜）。 */
      function workspaceOfSession(sessionId) {
        if (sessionId === null || sessionId === '') return null
        return workspaces.find((item) => Array.isArray(item.sessionIds) && item.sessionIds.includes(sessionId)) ?? null
      }

      /** 原生版式的会话页：标题栏 + 对话 tab + 消息列 + 药丸输入框。 */
      function renderConversation() {
        const peer = peers.find((item) => item.id === activePeer)
        const workspaceCrumb = workspaceOfSession(openSession)
        const mode = presetOfSession(openSession, presets)
        // 每轮最后一条助手消息才挂动作行（原生 turn-tail）。
        const tailIndexes = new Map()
        for (const [at, message] of messages.entries()) {
          if (message.role === 'assistant' && typeof message.turn === 'number') tailIndexes.set(message.turn, at)
        }
        return h('div', { style: styles.conversationPage, 'data-remote-peers-scroll': '' },
          error === '' ? null : h('div', { style: styles.openErrorToast, role: 'status' }, error),
          openNotice === null ? null : h('div', {
            style: openNotice.ok ? { ...styles.openErrorToast, background: 'var(--dsw-alias-state-success-fill, #eaf7ec)', color: '#1a7f37', boxShadow: '0 4px 16px rgba(0,0,0,0.10)' } : styles.openErrorToast,
            role: 'status',
          }, openNotice.text),
          downloadCancelAsk === null ? null : renderDownloadCancelDialog(),
          h('div', { style: styles.pageRow },
            h('div', { style: previewFull ? { ...styles.conversationPane, display: 'none' } : styles.conversationPane },
              h('div', { style: styles.headerBlock },
                h('div', { style: styles.convHeader },
                  h('button', {
                    type: 'button',
                    style: styles.convBack,
                    title: '返回会话列表',
                    'aria-label': '返回会话列表',
                    onMouseEnter: (event) => {
                      event.currentTarget.style.background = T.hover
                      event.currentTarget.style.borderColor = 'var(--dsw-alias-border-l2, #e3e4e6)'
                      event.currentTarget.style.color = T.pri
                    },
                    onMouseLeave: (event) => {
                      event.currentTarget.style.background = 'transparent'
                      event.currentTarget.style.borderColor = 'transparent'
                      event.currentTarget.style.color = T.sec
                    },
                    onClick: () => { closeStream(); setOpenSession(null); setMessages([]) },
                  }, backArrowGlyph(16)),
                  workspaceCrumb === null ? null : h('button', {
                    key: 'crumb-workspace',
                    type: 'button',
                    style: styles.crumbButton,
                    'data-rp-anchor': '',
                    'aria-label': `工作区 ${workspaceCrumb.title}`,
                    ...hoverBackdrop(T.hover),
                    onClick: (event) => {
                      event.stopPropagation()
                      if (wsMenu !== null && wsMenu.workspaceId === workspaceCrumb.workspaceId) {
                        setWsMenu(null)
                        return
                      }
                      const rect = event.currentTarget.getBoundingClientRect()
                      setSessionMenu(null)
                      setWsMenu({ workspaceId: workspaceCrumb.workspaceId, title: workspaceCrumb.title, top: clampMenuTop(rect), left: clampMenuLeft(rect.left) })
                    },
                  },
                    h('span', { style: styles.crumbLabel }, workspaceCrumb.title),
                    h('span', { style: styles.crumbCaret },
                      h('svg', { width: 10, height: 10, viewBox: '0 0 12 12' },
                        h('path', { d: 'M3 4.5L6 7.5L9 4.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
                  ),
                  workspaceCrumb === null ? null : h('span', { key: 'crumb-sep', style: styles.crumbSep }, '/'),
                  h('div', { style: styles.convTitle }, sessionTitleOf(openSession)),
                  mode === null ? null : h('span', { style: styles.modeChip },
                    h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 },
                      h('circle', { cx: 8, cy: 8, r: 5.4 }),
                      h('path', { d: 'M3.2 8h9.6' }),
                    ),
                    mode,
                  ),
                  h('div', { style: { flex: 1 } }),
                  h('span', { style: styles.muted }, peer?.name ?? ''),
                  h('div', { style: styles.headerMoreWrap },
                    h('button', {
                      type: 'button',
                      style: styles.headerMoreButton,
                      title: '更多',
                      'data-dsh-popup': '',
                      onClick: () => setHeaderOpen((open) => !open),
                    }, '⋯'),
                    headerOpen ? renderHeaderMenu() : null,
                  ),
                ),
                h('div', { style: styles.tabs },
                  h('div', { style: styles.tabActive }, '对话'),
                ),
              ),
              h('div', { style: styles.bodyArea },
                h('div', { style: styles.chatPane, ref: paneRef },
                  h('div', { style: styles.convBody, ref: bodyRef, onScroll: onBodyScroll, 'data-remote-peers-scroll': '' },
                    h('div', { style: { ...styles.convColumn, maxWidth: `${Math.round(contentWidth)}px` }, ref: columnRef },
                      messages.length === 0 && liveText === '' && liveReasoning === '' && turnStartedAt === 0
                        && sessions.find((item) => item.sessionId === openSession)?.blank !== true
                        ? h('div', { style: styles.muted }, '这条会话没有可读的文本消息。')
                        : null,
                      renderHistoryEdge(),
                      messages.map((message, index) => renderMessage(message, index, tailIndexes.get(message.turn) === index)),
                      liveReasoning === '' && liveText === '' && turnStartedAt === 0
                        ? null
                        : h('div', { style: styles.liveFlow },
                            renderLiveProcessRow(),
                            liveText === ''
                              ? null
                              : h('div', { style: styles.assistantBlock },
                                  hostMarkdown === null
                                    ? renderRichText(liveText)
                                    : wrapMarkdownDelegate(h(hostMarkdown, { text: String(liveText ?? ''), labels: markdownLabels, streaming: true, ...markdownResolvers(messages.length === 0 ? undefined : messages[messages.length - 1].turn) })),
                                ),
                            renderLiveReasoningRow(),
                          ),
                    ),
                  ),
                  renderTurnRail(),
                ),
              ),
              renderComposer(),
            ),
            renderPreviewPane(),
          ),
          renderPermissionDialog(),
          pathMenu === null ? null : renderPathMenu(),
          wsMenu === null ? null : renderWorkspaceMenu(),
          sessionMenu === null ? null : renderSessionMenu(),
          renameAsk === null ? null : renderRenameDialog(),
          sessionRenameAsk === null ? null : renderSessionRenameDialog(),
          tooltip === null ? null : h('div', { style: { ...styles.tooltipBox, top: tooltip.top, left: tooltip.centerX } }, tooltip.text),
          iconHint === null ? null : renderIconHint(),
          usageDialog === null ? null : renderUsageDialog(),
          statDialog === null ? null : renderStatDialog(),
          copyToast === null ? null : renderCopyToast(),
        )
      }

      /**
       * 「本轮用量」浮层：原生 `TurnUsagePanel` + `stat-dialog.module.css` ——
       * 「本轮用量」+ 精确 token 合计、0.5px 分隔线、76px 标签列 + 右对齐数值列。
       */
      function renderUsageDialog() {
        const usage = usageDialog.usage
        const cacheHit = usage.cacheReadTokens === null
          ? null
          : cacheHitText(usage.cacheReadTokens, usage.totalTokens - usage.outputTokens, 1)
        const rows = []
        if (usage.routes !== '') rows.push(['提供方 / 模型', usage.routes])
        if (cacheHit !== null) rows.push(['缓存命中', `${cacheHit}%`])
        rows.push(['未缓存输入', `${formatExactTokens(usage.uncachedInputTokens)} tok`])
        if (usage.cacheReadTokens !== null) rows.push(['缓存读取', `${formatExactTokens(usage.cacheReadTokens)} tok`])
        if (usage.cacheWriteTokens !== null) rows.push(['缓存写入', `${formatExactTokens(usage.cacheWriteTokens)} tok`])
        rows.push(['输出', `${formatExactTokens(usage.outputTokens)} tok`])
        return h('div', {
          style: { ...styles.usageDialog, bottom: usageDialog.bottom, left: usageDialog.left },
          role: 'dialog',
          'aria-label': '本轮用量',
          'data-dsh-popup': '',
          onClick: (event) => event.stopPropagation(),
        },
        h('div', { style: styles.usageDialogTitle },
          h('span', { style: styles.usageDialogTitleLabel },
            databaseGlyph(14),
            h('span', null, '本轮用量'),
          ),
          h('span', { style: { fontVariantNumeric: 'tabular-nums' } }, `${formatExactTokens(usage.totalTokens)} tok`),
        ),
        h('div', { style: styles.usageDialogRule, 'aria-hidden': '' }),
        h('dl', { style: styles.usageDialogDetails },
          rows.flatMap(([label, value]) => [
            h('dt', { key: `dt-${label}`, style: styles.usageDialogDt }, label),
            h('dd', { key: `dd-${label}`, style: styles.usageDialogDd }, value),
          ]),
        ),
        )
      }


      /**
       * 卡片右侧那个 ⌄：点开「显示文件位置」菜单（卡片与预览空态共用同一个钮）。
       * @param file - 展示项 `{ path, absolutePath }`
       * @param extraStyle - 覆盖 caret 的分尺寸样式
       */
      function menuCaret(file, extraStyle) {
        return h('button', {
          type: 'button',
          style: extraStyle === undefined ? styles.splitCaret : { ...styles.splitCaret, ...extraStyle },
          'aria-label': '更多打开方式',
          onClick: (event) => {
            event.stopPropagation()
            openCardMenu(file, event)
          },
        }, caretDownGlyph())
      }

      /** 卡片 caret 的位置菜单：只有「显示文件位置」一项（应用列表按要求不做）。 */
      function openCardMenu(file, event) {
        const rect = event.currentTarget.getBoundingClientRect()
        // 菜单固定高约 46px：下方空间不够时翻到按钮上方，否则会落到视口外，看起来「点了没反应」。
        const menuHeight = 46
        const below = rect.bottom + 4
        const top = below + menuHeight > globalThis.innerHeight ? Math.max(8, rect.top - 4 - menuHeight) : below
        const right = Math.max(8, globalThis.innerWidth - rect.right)
        const path = peerAbsoluteOf(file)
        const key = transferKeyOf(activePeer, path)
        diagNote(`card menu open top=${Math.round(top)} right=${Math.round(right)}`)
        setPathMenu({ file, top, right, available: REVEAL_READY.get(key) ?? null })
        // 打开菜单时问一次本机有没有副本：没下载过就置灰、点了也不动。
        void call('local/copy', { id: activePeer, path }).then((state) => {
          const exists = state?.exists === true
          REVEAL_READY.set(key, exists)
          setPathMenu((current) => (current !== null && current.file === file ? { ...current, available: exists } : current))
        }).catch(() => { /* 探针失败就当没有副本 */ })
      }

      function renderPathMenu() {
        const available = pathMenu.available
        const targetPath = pathMenu.file === undefined || pathMenu.file === null ? '' : peerAbsoluteOf(pathMenu.file)
        // 正在等资源管理器弹窗：菜单不关，这一项就地变成「正在打开…」，命中或超时后由回调收起。
        const opening = targetPath !== '' && revealing[transferKeyOf(activePeer, targetPath)] === true
        return h('div', {
          style: { ...styles.pathMenu, top: pathMenu.top, right: pathMenu.right },
          'data-dsh-popup': '',
          onClick: (event) => event.stopPropagation(),
        },
          h('button', {
            type: 'button',
            style: opening ? { ...styles.pathMenuItem, opacity: 0.72, cursor: 'default' } : styles.pathMenuItem,
            disabled: opening,
            onClick: () => {
              if (opening) return
              const file = pathMenu.file
              // 已经下到本机 → 资源管理器定位（等窗口出来再收菜单）；还没下载 → 照旧弹右侧窗格显示对端绝对路径。
              if (available !== true) {
                setPathMenu(null)
                openFilePathInfo(file)
                return
              }
              void revealLocalCopy(file).then((revealed) => {
                setPathMenu(null)
                if (!revealed) openFilePathInfo(file)
              })
            },
          },
            h('span', { style: { display: 'inline-flex', flex: 'none', width: 14, height: 14, color: 'var(--dsw-alias-menu-icon, #6f7377)' } },
              opening ? spinnerGlyph(12) : folderGlyph()),
            h('span', { style: { flex: 1, minWidth: 0 } }, opening ? '正在打开…' : '显示文件位置'),
          ),
        )
      }

      /** 菜单水平落点：贴锚点左缘，但右缘不许越出视口（原生 `position-try --dsh-menu-wide-below` 的夹紧效果）。 */
      function clampMenuLeft(anchorLeft) {
        const estimate = 176
        return Math.max(12, Math.min(anchorLeft, globalThis.innerWidth - estimate - 12))
      }

      /** 菜单纵向落点：贴锚点下缘 4px；下面放不下就翻到锚点上方（原生 `--dsh-menu-above`）。 */
      function clampMenuTop(rect, height = 52) {
        const below = rect.bottom + 4
        if (below + height <= globalThis.innerHeight - 12) return below
        return Math.max(12, rect.top - 4 - height)
      }

      /** 工作区行的 ⋯ 菜单：目前只有「重命名」（原生同一菜单里的「在文件夹显示」「删除工作区」未接）。 */
      /** 浮层菜单里的一个条目：图标 + 文案，hover 走原生 `Menu` 的 hover 底色。 */
      function menuItem(id, label, glyph, run, separated) {
        return [
          separated === true ? h('div', { key: `sep:${id}`, style: styles.viewMenuDivider }) : null,
          h('button', {
            key: id,
            type: 'button',
            style: styles.pathMenuItem,
            onClick: run,
            ...hoverBackdrop(T.hover),
          },
            h('span', { style: { ...styles.menuIconSlot, color: 'var(--dsw-alias-menu-icon, #6f7377)' } }, glyph),
            h('span', { style: { flex: 1, minWidth: 0 } }, label),
          ),
        ]
      }

      /** 工作区行的 ⋯ 菜单：目前只有「重命名」（原生同一菜单里的「在文件夹显示」「删除工作区」未接）。 */
      function renderWorkspaceMenu() {
        const target = wsMenu
        return h('div', {
          style: { ...styles.wsMenu, top: target.top, left: target.left },
          'data-dsh-popup': '',
          onClick: (event) => event.stopPropagation(),
        },
          menuItem('rename', '重命名', renameGlyph(14), () => openRenameAsk(target.workspaceId, target.title)),
        )
      }

      /**
       * 会话行的 ⋯ 菜单：照原生 `registerSessionMenus` 的顺序 —— 置顶（100）/ 重命名（200）/
       * 复制 Session ID（450，带分隔线）/ 归档（600，带分隔线）。
       * 原生的「标记已读」「分叉会话」两项依赖 `sessionStatus/mark`、`session/fork` 的会话状态链路，尚未接入。
       */
      function renderSessionMenu() {
        const target = sessionMenu
        const pinned = pinnedIds.map(String).includes(String(target.sessionId))
        const archived = archivedIds.map(String).includes(String(target.sessionId))
        /** 点完一项就收起菜单（原生 `Menu` 的默认行为）。 */
        const run = (fn) => () => { setSessionMenu(null); fn() }
        return h('div', {
          style: { ...styles.wsMenu, top: target.top, left: target.left },
          'data-dsh-popup': '',
          onClick: (event) => event.stopPropagation(),
        },
          archived ? null : menuItem('pin', pinned ? '取消置顶' : '置顶会话', pinGlyph(14, pinned),
            run(() => void toggleSessionFlag(pinned ? 'workspace/unpinSession' : 'workspace/pinSession', 'pinnedSessionIds', target.sessionId))),
          menuItem('rename', '重命名', renameGlyph(14), run(() => openSessionRename(target.sessionId, target.title))),
          menuItem('copy', '复制 Session ID', copyGlyph(), run(() => copySessionIdText(target.sessionId)), true),
          menuItem('archive', archived ? '取消归档' : '归档会话', archiveGlyph(14),
            run(() => void toggleSessionFlag(archived ? 'workspace/unarchiveSession' : 'workspace/archiveSession', 'archivedSessionIds', target.sessionId)), true),
        )
      }

      /**
       * 重命名对话框（原生 Modal 外观）：标题 + 全选输入框 + 取消/确认，草稿空或未改动时确认钮禁用。
       * 工作区与会话共用这一个外壳，只有标题、字段名和提交回调不同。
       */
      function renderRenameModal(options) {
        const draft = renameDraft.trim()
        const blocked = renaming || draft === '' || draft === options.title
        return h('div', {
          style: { ...styles.permDialogOverlay, backdropFilter: 'var(--dsw-mask-blur, blur(2px))' },
          onClick: (event) => { if (event.target === event.currentTarget) options.close() },
        },
          h('div', {
            style: styles.renameDialog,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': options.heading,
          },
            h('div', { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
              h('div', { style: { ...styles.permDialogHead, alignItems: 'center', justifyContent: 'space-between' } },
                h('h2', { style: { margin: 0, fontSize: 16, lineHeight: '24px', fontWeight: 500, color: T.pri } }, options.heading),
                h('button', {
                  type: 'button',
                  style: styles.ghostButton,
                  'aria-label': '关闭',
                  ...hoverBackdrop(T.hover),
                  onClick: options.close,
                }, closeGlyph(14)),
              ),
              h('div', { style: { ...styles.permDialogBody, marginTop: 20 } },
                h('input', {
                  type: 'text',
                  style: styles.renameInput,
                  value: renameDraft,
                  autoFocus: true,
                  'aria-label': options.field,
                  disabled: renaming,
                  onFocus: (event) => { event.currentTarget.select() },
                  onChange: (event) => { setRenameDraft(event.target.value); setRenameError('') },
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void options.confirm()
                    }
                    if (event.key === 'Escape' && !renaming) {
                      event.preventDefault()
                      options.close()
                    }
                  },
                }),
                renameError === '' ? null : h('div', { style: styles.renameErrorText, role: 'alert' }, renameError),
              ),
            ),
            h('div', { style: styles.permDialogFooter },
              h('button', { type: 'button', style: styles.permCancel, onClick: options.close }, '取消'),
              h('button', {
                type: 'button',
                style: blocked ? { ...styles.permConfirm, ...styles.permConfirmDisabled } : styles.permConfirm,
                disabled: blocked,
                onClick: () => void options.confirm(),
              }, renaming ? '重命名中…' : '重命名'),
            ),
          ),
        )
      }

      function renderRenameDialog() {
        return renderRenameModal({
          heading: '重命名工作区',
          field: '工作区名称',
          title: renameAsk === null ? '' : renameAsk.title,
          close: closeRename,
          confirm: confirmRename,
        })
      }

      function renderSessionRenameDialog() {
        return renderRenameModal({
          heading: '重命名会话',
          field: '会话名称',
          title: sessionRenameAsk === null ? '' : sessionRenameAsk.title,
          close: closeSessionRename,
          confirm: confirmSessionRename,
        })
      }

      /**
       * 标题栏「⋯」菜单：只做两项 —— 复制会话为 Markdown、下载 Session 日志
       * （「在应用中打开」「反馈」按用户要求不做）。
       */
      function renderHeaderMenu() {
        return h('div', { style: styles.headerMenu, 'data-dsh-popup': '' },
          h('button', {
            type: 'button',
            style: styles.headerMenuItem,
            onClick: () => { setHeaderOpen(false); void copySessionMarkdown() },
          },
            h('span', { style: styles.headerMenuItemIcon }, copyGlyph()),
            h('span', { style: styles.headerMenuItemLabel }, '复制会话为 Markdown'),
          ),
          h('button', {
            type: 'button',
            style: styles.headerMenuItem,
            onClick: () => { setHeaderOpen(false); downloadExport() },
          },
            h('span', { style: styles.headerMenuItemIcon }, downloadGlyph()),
            h('span', { style: styles.headerMenuItemLabel }, '下载 Session 日志'),
          ),
        )
      }

      /** 复制会话为 Markdown：Markdown 完全由对端 Host 的 `GET /api/session.markdown` 生成（原生 `formatSessionMarkdown` 同一实现），本机只做转发，不做本地拼装。 与原生 `copy-controller` 一样，在点击的同一调用栈里用 `Cli... */
      function copySessionMarkdown() {
        if (openSession === null) return
        setCopyToast('preparing')
        const preparation = prepareSessionMarkdown()
        const wantsDeferred = typeof globalThis.ClipboardItem === 'function'
          && typeof navigator.clipboard?.write === 'function'
        if (wantsDeferred) {
          const data = preparation.then((text) => new Blob([text], { type: 'text/plain' }))
          let write
          try {
            write = navigator.clipboard.write([new ClipboardItem({ 'text/plain': data })])
          } catch {
            write = Promise.reject(new Error('clipboard write could not start'))
          }
          void Promise.allSettled([preparation, data, write]).then(([prepared, blob, written]) => {
            if (prepared.status === 'rejected' || blob.status === 'rejected') { setCopyToast('preparationFailed'); return }
            if (written.status === 'rejected') {
              setCopyToast(writeViaSelection(String(prepared.value)) ? 'success' : 'clipboardFailed')
              return
            }
            setCopyToast('success')
          })
          return
        }
        void preparation.then(async (text) => {
          try {
            if (navigator.clipboard?.writeText === undefined) throw new Error('no clipboard')
            await navigator.clipboard.writeText(text)
            setCopyToast('success')
          } catch {
            setCopyToast(writeViaSelection(String(text)) ? 'success' : 'clipboardFailed')
          }
        }, () => { setCopyToast('preparationFailed') })
      }

      /** 剪贴板 API 不可用时的传统写法：选中隐藏 textarea 再 execCommand('copy')。 */
      function writeViaSelection(text) {
        try {
          const area = document.createElement('textarea')
          area.value = text
          area.style.position = 'fixed'
          area.style.top = '-9999px'
          area.style.opacity = '0'
          document.body.appendChild(area)
          area.select()
          const accepted = document.execCommand('copy')
          area.remove()
          return accepted === true
        } catch {
          return false
        }
      }

      /** 取 Markdown：只走本机转发路由（对端生成），任何失败都归为「准备失败」。 */
      async function prepareSessionMarkdown() {
        const url = `/api/remote-peers/markdown?id=${encodeURIComponent(activePeer)}`
          + `&sessionId=${encodeURIComponent(openSession)}`
        const abort = new AbortController()
        const timer = setTimeout(() => abort.abort(), 20000)
        try {
          const response = await fetch(url, { signal: abort.signal })
          if (!response.ok) throw new Error(`HTTP ${String(response.status)}`)
          const text = await response.text()
          if (text === '') throw new Error('empty markdown')
          return text
        } finally {
          clearTimeout(timer)
        }
      }
      function renderCopyToast() {
        const text = copyToast === 'success'
          ? 'Session 已复制为 Markdown'
          : copyToast === 'preparing'
            ? '正在准备 Session…'
            : copyToast === 'clipboardFailed'
              ? '无法写入剪贴板，请检查剪贴板权限后重试'
              : '无法读取 Session 进行复制，请重试'
        return h('div', { style: styles.toastWrap, role: 'status' }, text)
      }







      /** 一条消息：用户靠右气泡，助手是通栏正文（与原生一致）。 */
      function renderMessage(message, index, isTurnTail = true) {
        if (message.role === 'command') {
          return h('div', { key: `${index}`, style: styles.commandRow },
            h('span', { style: styles.commandCaret }, '>'),
            h('span', { style: styles.commandName }, message.name),
            h('span', { style: styles.commandDot }, '·'),
            h('span', {
              style: message.kind === 'error' ? styles.commandError : styles.commandText,
            }, message.text),
          )
        }
        if (message.role === 'turnProcess') {
          return renderTurnProcess(message, index)
        }
        if (message.role === 'present') {
          return renderPresentCards(message.files, index, message.seq)
        }
        if (message.role === 'changes') {
          return renderChangedFilesCard(message.changeSeq, message.changeTurn)
        }
        if (message.role === 'user') {
          const clock = formatClock(message.time)
          // `data-rp-turn-anchor` 只挂在提问行上：轮次刻度的落点就是这条用户消息（原生
          // `scrollToTurn` 对齐 Turn 的 anchor Node），助手块那条 `data-rp-turn` 只供高亮用。
          return h('div', {
            key: `${index}`,
            style: styles.userRow,
            'data-rp-turn': typeof message.turn === 'number' ? message.turn : undefined,
            'data-rp-turn-anchor': typeof message.turn === 'number' ? message.turn : undefined,
          },
            h('div', { style: { ...styles.userStack, maxWidth: contentWidth * 0.702 } },
              // 原生顺序：附件（图片/文件）在气泡之上，气泡只装正文；只有附件没有正文时不画气泡。
              renderUserAttachments(message.files, activePeer, openSession),
              String(message.text ?? '') === ''
                ? null
                : h('div', { style: styles.userBubble }, renderRichText(message.text)),
              h('div', { style: styles.msgActions },
                clock === '' ? null : h('span', { style: styles.msgTime }, clock),
                copyActionButton(message.text, `m${index}`),
              ),
            ),
          )
        }
        return h('div', { key: `${index}`, style: styles.assistantBlock, 'data-rp-turn': typeof message.turn === 'number' ? message.turn : undefined },
          hostMarkdown === null
            ? renderRichText(message.text)
            : wrapMarkdownDelegate(h(hostMarkdown, { text: String(message.text ?? ''), labels: markdownLabels, ...markdownResolvers(message.turn) })),
          renderAttachments(message.files),
          // 原生顺序：正文 → 改动卡片 → 文件卡片 → 图标动作行。
          typeof message.changeSeq === 'number' ? renderChangedFilesCard(message.changeSeq, message.turn) : null,
          message.cards === undefined ? null : renderPresentCards(message.cards, `card${index}`, message.cardsSeq ?? 0),
          // 这一轮还在跑（对端仍在分析/思考/出字）时先不给动作行：用量、时间都属于「这一轮结束了」的信息，
          // 提前挂在正文下方会顶在「正在分析请求」上面，看着像这条已经收尾了。
          isTurnTail && !(turnStartedAt !== 0 && (typeof currentTurnRef.current !== 'number' || message.turn === currentTurnRef.current))
            ? renderAssistantActions(message, index)
            : null,
        )
      }





      /**
       * 某一轮的「已完成」明细（原生 `TurnProcessNodeView` 展开后的第一层）：一步一行，
       * 思考取这一步的 reasoning 首行，工具取它自己的 `description`。只看当前窗口里的
       * 事件，不做额外请求 —— 拿不到就少一行，不影响会话本体。
       */
      /** 记录某轮明细块的可滚方向；`element` 即该块的滚动容器。 */
      function syncProcessScroll(turn, element) {
        if (element === null || element === undefined) return
        const up = element.scrollTop > 1
        const down = element.scrollTop + element.clientHeight < element.scrollHeight - 1
        setProcessScroll((previous) => {
          const current = previous[turn]
          if (current !== undefined && current.up === up && current.down === down) return previous
          return { ...previous, [turn]: { up, down } }
        })
      }

      /** 明细块的边缘渐隐（原生 `.fadeTop/.fadeBottom`，各 24px）。 */
      function processMaskOf(turn) {
        const edge = processScroll[turn]
        if (edge === undefined || (!edge.up && !edge.down)) return undefined
        if (edge.up && edge.down) {
          return 'linear-gradient(to bottom, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%)'
        }
        if (edge.up) return 'linear-gradient(to bottom, transparent 0, #000 24px, #000 100%)'
        return 'linear-gradient(to bottom, #000 0, #000 calc(100% - 24px), transparent 100%)'
      }

      /** 逐行左侧图标：思考/上下文各用自己的图标，工具行按分类取原生活动图标（缺省 `tools`）。 */
      function processRowIconKey(row) {
        if (row.kind === 'think') return 'think'
        if (row.kind === 'context') return 'context'
        return PROCESS_ROW_ICONS[row.cat] === undefined ? 'tools' : row.cat
      }

      function processRowsOf(turn) {
        const events = []
        for (const record of olderRecordsRef.current) if (record?.event !== undefined) events.push(record.event)
        for (const event of eventsMirrorRef.current) events.push(event)
        const rows = []
        let reasoning = []
        let inside = false
        const flush = () => {
          if (reasoning.length === 0) return
          rows.push({ kind: 'think', text: oneLine(reasoning.join(' ')) })
          reasoning = []
        }
        for (const event of events) {
          if (event?.type === 'turn/start') { inside = event.data?.turn === turn; continue }
          if (event?.type === 'turn/end' && event.data?.turn === turn) { inside = false; continue }
          if (!inside) continue
          if (event?.type === 'step/start') { flush(); continue }
          // 上下文注入（原生 `ContextInjectionRow`）：`user/message` 里非用户来源的那几条。
          if (event?.type === 'user/message') {
            const kind = event.data?.source?.kind
            if (typeof kind === 'string' && kind !== 'user') {
              flush()
              rows.push({ kind: 'context', label: '上下文注入', text: kind })
            }
            continue
          }
          if (event?.type === 'assistant/message' && event.data?.turn === turn) {
            for (const part of event.data?.message?.content ?? []) {
              if (part?.type === 'reasoning' && typeof part.text === 'string' && part.text.trim() !== '') {
                // 原生 `ReasoningRow` 折叠态只取该段首行（`firstLine`），不把整段拼成一行。
                const firstLine = part.text.split(/\r?\n/u).map((line) => line.trim()).find((line) => line !== '')
                if (firstLine !== undefined) reasoning.push(firstLine)
              }
            }
            continue
          }
          if (event?.type === 'tool/call' && event.data?.turn === turn) {
            flush()
            rows.push({
              kind: 'tool',
              cat: processToolKind(event.data?.name),
              label: processToolLabelOf(event.data?.name),
              text: processToolSummary(event),
            })
          }
        }
        flush()
        return rows
      }

      /**
       * 第一层分组的标题（原生 `processTitle`）：按出现次数排前三个分类拼起来 ——
       * 只有一类就是那一类的名字，两类用「并」（前缀相同才省掉第二个的「已」），
       * 三类以上用全角逗号连接并加「等」，第二个起都保留自己的「已」。
       */
      function processTitleOf(turn) {
        const rows = processRowsOf(turn)
        if (rows.length === 0) return null
        const counts = new Map()
        for (const row of rows) {
          if (row.kind !== 'tool') continue
          counts.set(row.cat, (counts.get(row.cat) ?? 0) + 1)
        }
        if (counts.size === 0) return '已完成分析'
        const labels = [...counts.entries()]
          .sort((left, right) => right[1] - left[1])
          .slice(0, 3)
          .map(([cat]) => processKindLabelOf(cat))
        const first = labels[0] ?? '已完成分析'
        const second = labels[1]
        if (second === undefined) return first
        const continuation = (label) => label.charAt(0).toLowerCase() + label.slice(1)
        if (labels.length === 2) {
          const shared = first.startsWith('已') && second.startsWith('已')
          return `${first}并${continuation(shared ? second.slice(1) : second)}`
        }
        const title = [first, ...labels.slice(1).map(continuation)].join('，')
        return counts.size > 3 ? `${title}等` : title
      }

      /** 一轮结束行：`已完成，用时 6 秒`，33px 高、底边 0.5px l2 —— TurnProcessNodeView。 */
      function renderTurnProcess(message, index) {
        const reason = message.reason
        const stopped = reason === 'aborted' || reason === 'interrupted'
        const label = stopped
          ? '已停止'
          : reason === 'error'
            ? '失败'
            : typeof message.elapsedMs === 'number'
              ? `已完成，用时 ${formatRunDuration(message.elapsedMs)}`
              : '已完成'
        const rows = processRowsOf(message.turn)
        const groupTitle = processTitleOf(message.turn)
        const expandable = groupTitle !== null
        const open = expandable && processOpen[message.turn] === true
        const groupOpen = open && processGroupOpen[message.turn] === true
        return h('div', { key: `tp-${index}`, style: styles.turnProcessRow, 'data-turn-process': message.turn },
          h('div', { style: styles.turnProcessHeadLine },
            h('button', {
              type: 'button',
              disabled: !expandable,
              style: expandable ? styles.turnProcessHead : { ...styles.turnProcessHead, cursor: 'default' },
              'aria-expanded': expandable ? (open ? 'true' : 'false') : undefined,
              onClick: () => {
                setProcessOpen((previous) => ({ ...previous, [message.turn]: !open }))
              },
            },
            h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, label),
            expandable
              ? h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', style: { flex: 'none', color: T.ter, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 140ms cubic-bezier(.2,.8,.2,1)' } },
                  h('path', { d: 'M4.2 6.2L8 10L11.8 6.2', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' }))
              : null,
            ),
          ),
          open
            ? h('div', { style: styles.processList },
                h('button', {
                  type: 'button',
                  style: styles.processGroup,
                  'aria-expanded': groupOpen ? 'true' : 'false',
                  onClick: () => {
                    setProcessGroupOpen((previous) => ({ ...previous, [message.turn]: !groupOpen }))
                  },
                },
                h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', style: { flex: 'none', color: T.ter, transform: groupOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 140ms cubic-bezier(.2,.8,.2,1)' } },
                  h('path', { d: 'M4.2 6.2L8 10L11.8 6.2', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' })),
                h('span', { style: styles.processRowText }, groupTitle),
                ),
                groupOpen
                  ? h('div', {
                      ref: (element) => { syncProcessScroll(index, element) },
                      style: {
                        ...styles.processDetail,
                        ...(processMaskOf(index) === undefined
                          ? {}
                          : { maskImage: processMaskOf(index), WebkitMaskImage: processMaskOf(index) }),
                      },
                      onScroll: (event) => { syncProcessScroll(index, event.currentTarget) },
                    },
                      rows.map((row, at) => h('div', { key: `pr-${index}-${at}`, style: styles.processRow },
                        h('span', {
                  style: styles.processRowIcon,
                  dangerouslySetInnerHTML: { __html: PROCESS_ROW_ICONS[processRowIconKey(row)] },
                }),
                        h('span', { style: styles.processRowLabel }, row.kind === 'think' ? '思考' : row.label),
                        h('span', { style: styles.processRowDot }, '·'),
                        h('span', { style: styles.processRowText }, row.text),
                      )),
                    )
                  : null,
              )
            : null,
        )
      }

      /**
       * 全局图标 tooltip 的标准开合：气泡 fixed 在按钮下方居中，隐藏时只在「还是这一个」才清。
       * @param key - tooltip 归属键，避免兄弟按钮互相误清
       * @param label - 气泡文案
       * @param event - 触发元素来自 `event.currentTarget`
       */
      function showHint(key, label, event) {
        const rect = event.currentTarget.getBoundingClientRect()
        setIconHint({ key, label, top: rect.bottom + 6, left: rect.left + rect.width / 2 })
      }

      /** 收起某一个 key 的 tooltip（已是别的 key 就不动）。 */
      function hideHint(key) {
        setIconHint((current) => (current !== null && current.key === key ? null : current))
      }

      /** 图标动作按钮 + 深色 tooltip（原生 `MessageIconActions` 的 `Tooltip side="bottom"`： 13/20、`3px 7px`、radius-sm、tooltip-bg/label）。气泡走全局 fixed 层， 避免被消息滚动容器裁掉（原生 Tooltip 也是 p... */
      function actionIconButton(key, label, glyph, onActivate, options = {}) {
        const unavailable = options.unavailable === true
        const show = (element) => {
          const rect = element.getBoundingClientRect()
          setIconHint({ key, label, top: rect.bottom + 6, left: rect.left + rect.width / 2 })
        }
        const hide = () => hideHint(key)
        return h('span', {
          key,
          style: styles.iconActionWrap,
          onMouseEnter: (event) => show(event.currentTarget.firstChild),
          onMouseLeave: hide,
        },
          h('button', {
            type: 'button',
            style: unavailable
              ? styles.msgActionIdle
              : iconHint !== null && iconHint.key === key
                ? { ...styles.msgAction, background: T.hoverStrong }
                : styles.msgAction,
            'aria-label': label,
            'aria-disabled': unavailable ? true : undefined,
            onClick: unavailable ? undefined : onActivate,
            onFocus: (event) => show(event.currentTarget),
            onBlur: hide,
          }, glyph),
        )
      }

      /** 一份复制按钮：`复制` ⇄ `已复制`（原生 `useClipboardCopy` + Tooltip label）。 */
      function copyActionButton(text, key) {
        const copied = copiedKey === key
        return actionIconButton(key, copied ? '已复制' : '复制', copied ? checkGlyph(17) : copyGlyph(17), () => copyMessageText(text, key))
      }

      /** 助手尾部动作行：复制 / 分享 / 用量 / 时间 —— TurnTailNodeView + MessageIconActions（不带赞同反对）。 */
      function renderAssistantActions(message, index) {
        const clock = formatClock(message.time)
        const usage = turnUsageOf(message.turn)
        const key = `a${index}`
        return h('div', { style: styles.assistantActions },
          copyActionButton(message.text, key),
          usage === null
            ? null
            : h('span', {
                style: usageDialog !== null && usageDialog.turn === usage.turn
                  ? { ...styles.usagePill, ...styles.usagePillHover }
                  : styles.usagePill,
                'aria-haspopup': 'dialog',
                'data-rp-anchor': '',
                'aria-expanded': usageDialog !== null && usageDialog.turn === usage.turn,
                onMouseEnter: (event) => {
                  event.currentTarget.style.background = T.hoverStrong
                },
                onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent' },
                onClick: (event) => {
                  event.stopPropagation()
                  // 同一时刻只留一个浮层：底部统计浮层先关掉
                  setStatDialog(null)
                  const rect = event.currentTarget.getBoundingClientRect()
                  setUsageDialog((current) => (current !== null && current.turn === usage.turn
                    ? null
                    : {
                        turn: usage.turn,
                        usage,
                        bottom: Math.max(12, window.innerHeight - rect.top + 8),
                        left: Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - 452)),
                      }))
                },
              },
                databaseGlyph(15),
                `用量 ${formatTokens(usage.totalTokens)} tok`,
              ),
          clock === '' ? null : h('span', { style: styles.msgTimeEnd }, clock),
        )
      }

      /**
       * 本轮用量：把该 turn 的 assistant 消息 usage 累加成原生 `TurnTokenUsage` ——
       * 三个 prompt 计费桶 + 输出，routes 取消息里的 provider/model。
       */
      function turnUsageOf(turn) {
        if (typeof turn !== 'number') return null
        let totalTokens = 0
        let uncachedInputTokens = 0
        let cacheReadTokens = null
        let cacheWriteTokens = null
        let outputTokens = 0
        const routes = []
        let seen = false
        for (const event of rawEvents) {
          if (event?.type !== 'assistant/message' || event.data?.turn !== turn) continue
          const usage = event.data?.usage
          if (usage === undefined || usage === null) continue
          seen = true
          totalTokens += Number(usage.totalTokens ?? ((usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)
            + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0)))
          uncachedInputTokens += Number(usage.inputTokens ?? 0)
          if (usage.cacheReadTokens !== undefined) cacheReadTokens = (cacheReadTokens ?? 0) + Number(usage.cacheReadTokens)
          if (usage.cacheWriteTokens !== undefined) cacheWriteTokens = (cacheWriteTokens ?? 0) + Number(usage.cacheWriteTokens)
          outputTokens += Number(usage.outputTokens ?? 0)
          const source = event.data?.message?.source
          if (typeof source?.provider === 'string' && typeof source?.model === 'string') {
            const route = `${source.provider}/${source.model}`
            if (!routes.includes(route)) routes.push(route)
          }
        }
        if (!seen) return null
        return {
          turn,
          totalTokens,
          uncachedInputTokens,
          cacheReadTokens,
          cacheWriteTokens,
          outputTokens,
          routes: routes.join(', '),
        }
      }

      /** 复制一条消息：成功短暂换成勾选图标。 */
      function copyMessageText(text, key) {
        const finish = () => {
          setCopiedKey(key)
          globalThis.setTimeout(() => setCopiedKey((current) => (current === key ? '' : current)), 1400)
        }
        const plain = String(text ?? '')
        if (typeof navigator?.clipboard?.writeText === 'function') {
          navigator.clipboard.writeText(plain).then(finish, () => {
            if (writeViaSelection(plain)) finish()
          })
          return
        }
        if (writeViaSelection(plain)) finish()
      }

      /**
       * 取一份对端图片字节并换成 `blob:` URL。原生 `MarkdownText` 的
       * `pathImages` 只收绝对 URL，本机转发路由是相对路径，所以要先把字节
       * 经同一个转发路由（`/api/remote-peers/file`）拉回本机再喂给渲染器。
       * 未取回前返回 `undefined`，正文保留 alt 文本；取回后 state 变化重渲染。
       */
      function ensureRemoteImage(target) {
        if (typeof target !== 'string' || target === '') return undefined
        const key = `${activePeer}|${target}`
        if (imageUrls[key] !== undefined) return imageUrls[key]
        if (imagePendingRef.current.has(key)) return undefined
        imagePendingRef.current.add(key)
        fetch(remoteFileUrl(activePeer, target))
          .then((response) => (response.ok ? response.blob() : Promise.reject(new Error(String(response.status)))))
          .then((blob) => {
            if (!(blob instanceof Blob) || blob.size === 0) throw new Error('empty body')
            const url = URL.createObjectURL(blob)
            imageUrlsRef.current = { ...imageUrlsRef.current, [key]: url }
            setImageUrls((previous) => ({ ...previous, [key]: url }))
          })
          .catch(() => { /* 取不到就留 alt 文本，和原生同一套兜底 */ })
          .finally(() => { imagePendingRef.current.delete(key) })
        return undefined
      }

      /**
       * 正文图片的委托（原生 `MarkdownDelegateProvider` 的 `fileImages`）：
       * 有它 `MarkdownText` 才把图片包成 `button` + 打开 `ImageLightbox`，并有手形光标。
       */
      function remoteFileImages() {
        return {
          fileDrag: NOOP_FILE_DRAG,
          resolve: (path) => ensureRemoteImage(absolutePeerPath(path)),
          labels: {
            dialog: '图片预览',
            close: '关闭',
            open: '打开原图',
            loading: '加载中',
            failed: '图片不可用',
          },
        }
      }

      /** 给一段 Markdown 挂上图片/文件委托；取不到该模块时退回裸 `MarkdownText`。 */
      function wrapMarkdownDelegate(node) {
        if (MarkdownDelegateProvider === null) return node
        return h(MarkdownDelegateProvider, {
          // 原生 `MarkdownFileLink`：没有 `openFile` 就只吐纯文本（无 hover、点不开），
          // 有它才渲染成 `button.fileMention.fileLink` + 按扩展名取图标，点击开右侧预览。
          openFile: (path) => { openPreviewOrInfo({ path }) },
          fileImages: remoteFileImages(),
        }, node)
      }

      /**
       * 该轮产出的文件（原生 `selectProducedFiles` + `presentedForClosing`）：成功结算的
       * 写入/编辑类工具调用（同时留字面参数路径，原生叫 `argumentPath`）+ present 卡片。
       */
      function turnFileEntriesOf(turn) {
        const older = olderRecordsRef.current
        const live = eventsMirrorRef.current
        const key = `${turn}|${older.length}|${live.length}`
        const cache = turnFilesCacheRef.current
        const hit = cache.get(key)
        if (hit !== undefined) return hit
        const events = []
        for (const record of older) if (record?.event !== undefined) events.push(record.event)
        for (const event of live) events.push(event)
        const entries = new Map()
        const calls = new Map()
        for (const event of events) {
          if (event?.data?.turn !== turn) continue
          if (event.type === 'tool/call') {
            if (!/(write|edit|patch|apply|str_replace)/i.test(String(event.data?.name ?? ''))) continue
            const args = event.data?.args ?? {}
            const argumentPath = ['path', 'file_path', 'filePath'].map((name) => args[name]).find((value) => typeof value === 'string' && value !== '')
            if (argumentPath === undefined) continue
            calls.set(String(event.data?.callId ?? ''), argumentPath)
            entries.set(absolutePeerPath(argumentPath), { path: absolutePeerPath(argumentPath), argumentPath })
            continue
          }
          if (event.type === 'tool/result') {
            if (event.data?.message?.isError === true) continue
            const argumentPath = calls.get(String(event.data?.message?.source?.callId ?? ''))
            if (argumentPath === undefined) continue
            const reported = typeof event.data?.meta?.path === 'string' && event.data.meta.path !== '' ? event.data.meta.path : argumentPath
            entries.set(absolutePeerPath(reported), { path: absolutePeerPath(reported), argumentPath })
            continue
          }
          const files = presentOf(event)
          if (files !== undefined) {
            for (const file of files) {
              if (typeof file?.path !== 'string' || file.path === '') continue
              entries.set(absolutePeerPath(file.path), { path: absolutePeerPath(file.path) })
            }
          }
        }
        const result = [...entries.values()]
        cache.set(key, result)
        return result
      }

      /** 原生 MarkdownText 的两个路径钩子：本地绝对图片换转发 URL，行内文件 token 变成可点开预览。 */
      function markdownResolvers(turn) {
        return {
          pathImages: {
            resolve: (value) => {
              // 原生 `localPathMediaUrl` 只认绝对路径（`isAbsoluteWorkspacePath`），相对路径仍是 alt。
              if (typeof value !== 'string' || !isAbsPath(value)) return undefined
              return isImagePath(value) ? ensureRemoteImage(value) : undefined
            },
          },
          fileMentions: {
            resolve: (token) => {
              // 原生 `producedFileMentions`：token 只在该轮的产出/呈现文件里找（全路径相等、
              // basename 相等，或等于工具调用的字面参数路径），唯一命中才成为芯片；
              // 其它路径形态（比如没被产出的目录名）照旧留在内联代码里。
              if (typeof token !== 'string' || token === '' || token.includes('\n')) return undefined
              if (typeof turn !== 'number') return undefined
              const matches = new Set()
              for (const entry of turnFileEntriesOf(turn)) {
                if (entry.path === token || baseNameOf(entry.path) === token) matches.add(entry.path)
                else if (entry.argumentPath === token) matches.add(entry.path)
              }
              if (matches.size !== 1) return undefined
              const [target] = matches
              return {
                open: () => openPreviewOrInfo({ path: target, description: '' }),
                label: baseNameOf(target),
                title: target,
              }
            },
          },
        }
      }

      /**
       * present 卡片：`PresentedFileCard` 的 DOM 顺序 —— 绝对定位的整卡按钮、40px 图标块、
       * 名称 13/20 500 + 描述 10/16 三级色（hover 换成「在侧边栏预览」）、右侧文件夹按钮。
       */
      function renderPresentCards(files, index, presentSeq) {
        if (!Array.isArray(files) || files.length === 0) return null
        return h('div', { key: `present-${index}`, style: files.length === 1 ? styles.presentGridSingle : styles.presentGrid },
          files.map((file, at) => {
            const name = baseNameOf(file.path)
            const fallback = extOf(name).toUpperCase() || '文件'
            const description = cardDescriptionOf(file.description, fallback)
            const cardKey = transferKeyOf(activePeer, peerAbsoluteOf(file))
            // 对端文件大小（Host 只读响应头问来的）；取不到就只在描述里显示原描述
            const sizeText = formatBytes(fileSizes[cardKey])
            const descriptionText = sizeText === '' ? description : `${description} · ${sizeText}`
            const downloadHint = sizeText === '' ? '下载' : `下载 · ${sizeText}`
            // loading = 已点了下载、但第一块字节还没落地（卡片转圈，仍可取消）；
            // downloading = 字节在走，显示进度。三处下载入口共用同一个口径。
            const ui = downloadUiOf(cardKey, peerAbsoluteOf(file), localCopies)
            const downloadTip = ui.local || ui.active ? ui.hint : downloadHint
            // 大小改成视口驱动：卡片进（或贴近）视口才登记，120ms 内合并成一次 `file/sizes`。
            // `ref` 用回调形式，React 重渲染时会先 null 再给节点，`VISION.watch` 按 key 去重。
            const cardRef = (node) => {
              if (node === null) return
              VISION.watch(node, `size:${cardKey}`, () => askSizeOf(cardKey, peerAbsoluteOf(file)))
            }
            return h('div', { key: `${at}`, style: styles.presentCard, 'data-presented-file': '', ref: cardRef },
              h('button', {
                type: 'button',
                style: styles.presentCardButton,
                title: file.path,
                'aria-label': `预览 ${file.path}`,
                onClick: () => openPreviewOrInfo(file),
              }),
              h('span', { style: styles.presentIcon },
                HostFileTypeIcon === null
                  ? h('span', { style: { fontSize: 12, opacity: 0.7 } }, fallback)
                  : h(HostFileTypeIcon, { path: file.path, size: 20 }),
              ),
              h('div', { style: styles.presentBody },
                h('div', { style: styles.presentDetails },
                  h('span', { style: styles.presentName }, name),
                  h('span', {
                    style: styles.presentDesc,
                    title: descriptionText,
                    onMouseEnter: (event) => { event.currentTarget.textContent = '在侧边栏预览' },
                    onMouseLeave: (event) => { event.currentTarget.textContent = descriptionText },
                  }, descriptionText),
                ),
                h('div', { style: styles.presentActions },
                  h('div', { style: styles.splitButton },
                    h('button', {
                      type: 'button',
                      style: styles.splitCompact,
                      'aria-label': '打开',
                      onMouseEnter: (event) => {
                        const rect = event.currentTarget.getBoundingClientRect()
                        setTooltip({ text: '打开', top: rect.bottom + 6, centerX: rect.left + rect.width / 2 })
                      },
                      onMouseLeave: () => setTooltip(null),
                      onClick: (event) => { event.stopPropagation(); setTooltip(null); void openPeerPath(file) },
                    }, openInAppGlyph(14), h('span', null, '打开')),
                    h('span', { style: styles.splitDivider }),
                    h('button', {
                      type: 'button',
                      style: styles.splitCompactCell,
                      'aria-label': downloadTip,
                      onMouseEnter: (event) => {
                        const rect = event.currentTarget.getBoundingClientRect()
                        setTooltip({ text: downloadTip, top: rect.bottom + 6, centerX: rect.left + rect.width / 2 })
                      },
                      onMouseLeave: () => setTooltip(null),
                      onClick: (event) => {
                        event.stopPropagation()
                        setTooltip(null)
                        activateDownload(file, ui, 'reveal')
                      },
                    }, ui.local
                      ? checkGlyph(12)
                      : ui.downloading ? closeGlyph(12) : ui.loading ? spinnerGlyph(12) : downloadGlyph(),
                    h('span', null, ui.label),
                      ui.local
                        ? null
                        : ui.downloading
                          ? h('span', { style: { opacity: 0.6, fontSize: 11, lineHeight: '16px' } }, ui.percent === null ? ui.loadedText : `${ui.percent}%`)
                          : sizeText === '' ? null : h('span', { style: { opacity: 0.6, fontSize: 11, lineHeight: '16px' } }, sizeText),
                      ui.downloading
                        ? h('span', {
                            style: {
                              position: 'absolute', left: 0, bottom: 0, height: 2, borderRadius: 1,
                              width: `${ui.percent === null ? 0 : ui.percent}%`, background: 'var(--dsw-alias-brand-primary, #4b5bd6)',
                              transition: 'width 160ms linear',
                            },
                          })
                        : null,
                    ),
                    h('span', { style: styles.splitDivider }),
                    menuCaret(file),
                  ),
                ),
              ),
            )
          }),
        )
      }

      /** 对端只在 Session 存活期间保留摘要（`workspace-changes` 的 TurnRecorder 全在内存， `session/disposed` 即清空），因此历史轮次常常取不到。这里按需从持久化的会话日志 自己推导：成功结算的 `write` / `edit` / `str_replace_e... */
      function deriveChanges(turn) {
        if (typeof turn !== 'number') return null
        const key = `${openSession}:${turn}`
        let state = derivedChangesRef.current.get(key)
        const stale = state !== undefined
          && (state.scanned > rawEvents.length
            || (state.scanned > 0 && rawEvents[state.scanned - 1] !== state.lastEvent))
        if (state === undefined || stale) {
          state = { scanned: 0, lastEvent: undefined, calls: new Map(), files: new Map(), summary: null }
          derivedChangesRef.current.set(key, state)
        }
        if (state.scanned >= rawEvents.length) return state.summary
        for (let index = state.scanned; index < rawEvents.length; index += 1) {
          const event = rawEvents[index]
          const data = event?.data
          if (event?.type === 'tool/call' && data?.turn === turn) {
            const path = mutationPathOf(data.name, data.arguments)
            if (path !== null) state.calls.set(String(data.callId), path)
            continue
          }
          if (event?.type !== 'tool/result' || data?.turn !== turn) continue
          if (data.message?.isError === true) continue
          const call = state.calls.get(String(data.message?.source?.callId ?? ''))
          if (call === undefined) continue
          const reported = typeof data.meta?.path === 'string' && isAbsPath(data.meta.path) ? data.meta.path : call
          if (reported !== '') state.files.set(reported, reported)
        }
        state.scanned = rawEvents.length
        state.lastEvent = rawEvents[rawEvents.length - 1]
        if (state.files.size === 0) {
          state.summary = null
          return null
        }
        const files = [...state.files.values()]
          .map((path) => ({ path, display: relativeToCwd(path).replace(/\\/gu, '/') }))
          .sort((a, b) => a.display.localeCompare(b.display))
        state.summary = { turn, derived: true, files, total: files.length }
        return state.summary
      }

      /** 一次调用改动的文件路径：只认写盘类工具，且参数里带路径。 */
      function mutationPathOf(name, argsRaw) {
        if (name !== 'write' && name !== 'edit' && name !== 'str_replace_editor') return null
        let args
        try {
          args = JSON.parse(argsRaw ?? '')
        } catch {
          return null
        }
        if (typeof args !== 'object' || args === null) return null
        const path = typeof args.file_path === 'string'
          ? args.file_path
          : typeof args.path === 'string' ? args.path : ''
        return path === '' ? null : path
      }

      /**
       * 本轮改动卡片：原生 `ChangedFiles` —— 60px 头部（40px 图标块 + 「已编辑 N 个文件」，
       * hover 出「在侧边栏预览」）、文件行、4 行以上给折叠条。不显示 `+/-`：真实数字只在对端
       * Session 存活期内可得，历史轮次估算误差不可控。
       */
      function renderChangedFilesCard(changeSeq, changeTurn) {
        const key = `${openSession}:${changeSeq}`
        const served = changesSummaries[key]
        const summary = served !== undefined && served !== 'loading' && served !== 'error' && typeof served === 'object'
          ? served
          : deriveChanges(changeTurn)
        if (summary === null || summary === undefined) return null
        if (!Array.isArray(summary.files) || summary.files.length === 0) return null
        const single = summary.total === 1 ? summary.files[0] : undefined
        const foldable = summary.files.length > 4
        const expanded = changesExpanded[key] === true
        const rows = foldable && !expanded ? summary.files.slice(0, 4) : summary.files
        const target = single ?? summary.files[0]
        // 增删行数只在对端 Session 存活时才是真实 `git diff-tree --numstat`，历史轮次只能按
        // 工具参数估算，误差不可控，因此一律不显示 `+/-`，只保留「在侧边栏预览」入口。
        const openAt = (file) => openPreviewOrInfo({ path: file?.path ?? target.path, description: '' })
        const header = h('button', {
          type: 'button',
          style: styles.changedHeader,
          'data-rp-change-header': '',
          'aria-label': single === undefined ? `在侧边栏查看本轮改动` : `查看 ${baseNameOf(single.path)} 的改动`,
          onClick: () => openAt(target),
        },
          h('span', { style: styles.changedTile },
            HostFileTypeIcon === null
              ? null
              : single === undefined
                ? h(HostFileTypeIcon, { kind: 'code', size: 20 })
                : h(HostFileTypeIcon, { path: single.path, size: 20 }),
          ),
          h('div', { style: styles.changedTitles },
            h('span', { style: styles.changedTitle },
              single === undefined ? `已编辑 ${summary.total} 个文件` : `已编辑 ${baseNameOf(single.path)}`),
            h('span', { style: styles.changedStat },
              h('span', { style: styles.changedPreviewHint, 'data-rp-change-hint': '' }, '在侧边栏预览'),
            ),
          ),
        )
        return h('div', {
          key: `chg-${changeSeq}`,
          style: single === undefined
            ? styles.changedCard
            : { ...styles.changedCard, borderColor: 'var(--dsw-alias-border-l1, #ededed)' },
          'data-changed-files': '',
        },
          header,
          single === undefined
            ? h('ul', { style: styles.changedList },
                rows.map((file, at) => h('li', { key: `${at}` },
                  h('button', {
                    type: 'button',
                    style: styles.changedRow,
                    'data-rp-change-row': '',
                    'aria-label': `查看 ${file.display} 的改动`,
                    onClick: () => openAt(file),
                  },
                    h('span', { style: styles.changedPath }, file.display),
                  ),
                )),
              )
            : null,
          foldable
            ? h('button', {
                type: 'button',
                style: styles.changedToggle,
                'data-rp-change-toggle': '',
                'aria-expanded': expanded,
                'aria-label': expanded
                  ? '收起改动文件列表'
                  : `展开全部 ${summary.files.length} 个改动文件`,
                onClick: () => setChangesExpanded((previous) => ({ ...previous, [key]: !expanded })),
              },
                h('span', null, expanded ? '收起' : `全部 ${summary.files.length} 个文件`),
                h('svg', {
                  width: 14, height: 14, viewBox: '0 0 16 16',
                  fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
                  style: { flex: 'none', transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 120ms' },
                }, h('path', { d: 'M4 6.2L8 9.6L11.4 6.2' })),
              )
            : null,
        )
      }

      /** 原生 `cardDescription`：去掉末尾的括注，空则回退到扩展名。 */
      function cardDescriptionOf(description, fallback) {
        const trimmed = String(description ?? '').replace(/\s*(?:\([^()]*\)|（[^（）]*）)\s*$/u, '').trim()
        return trimmed === '' ? fallback : trimmed
      }

      /** 该文件当前的下载任务（没有则 undefined）：卡片据此在「下载 / 取消 NN%」之间切换。 */
      function downloadJobOf(path) {
        return downloads.find((item) => item.key === transferKeyOf(activePeer, path))
      }

      /**
       * 下载 / 已下载的唯一口径：卡片下载格、预览工具条图标、预览空态按钮三处共用，
       * 保证同一条文件在任何入口看到的状态一致。任务优先：只要有任务在跑（含 loading）
       * 就按任务算，即使本地曾有副本——那份副本可能已被删、正在重取，此时必须能看进度/取消。
       * @param key - 本地副本记账键 `${peerId}:${绝对路径}`
       * @param path - 对端绝对路径
       * @param copies - `localCopies` 快照
       * @returns `{ active, loading, downloading, local, percent, loadedText, label, cancelLabel, hint }`
       */
      function downloadUiOf(key, path, copies) {
        const job = downloadJobOf(path)
        const hasCopy = copies[key] === true
        // 迟迟等不到第一条进度的「刚开始」任务按没有任务算：UI 层不再无限转圈。
        const stale = job !== undefined && job.phase === 'starting' && Date.now() - (job.startedAt ?? 0) > STARTING_TIMEOUT_MS
        if (job === undefined || stale) {
          const local = hasCopy
          return {
            active: false, loading: false, downloading: false, local,
            percent: null, loadedText: '',
            label: local ? '已下载' : '下载',
            cancelLabel: '',
            hint: local ? '已下载到本机' : '下载',
          }
        }
        const loading = job.phase === 'loading' || job.phase === 'starting'
        const downloading = !loading
        const percent = !loading && job.total > 0 ? Math.max(0, Math.min(99, Math.floor((job.loaded / job.total) * 100))) : null
        const loadedText = formatBytes(job.loaded)
        const cancelLabel = loading ? '取消' : percent === null ? `取消 ${loadedText}` : `取消 ${percent}%`
        return {
          active: true, loading, downloading, local: false,
          percent, loadedText,
          label: loading ? '下载' : '取消',
          cancelLabel,
          hint: loading ? '正在开始下载…' : '取消下载',
        }
      }

      /**
       * 三个入口的统一点击语义：在跑（含 loading）→ 取消；本机已有副本 → 定位（工具条为无动作）；否则开始下载。
       * @param file - 展示项 `{ path, absolutePath }`
       * @param ui - `downloadUiOf` 的结果
       * @param onLocal - 点击「已下载」时做什么：`reveal` 定位到副本，`none` 无动作
       */
      function activateDownload(file, ui, onLocal) {
        if (ui.active) {
          cancelPeerDownload(file)
          return
        }
        if (ui.local) {
          if (onLocal !== 'reveal') return
          void revealLocalCopy(file).then((revealed) => {
            if (!revealed) openFilePathInfo(file)
          })
          return
        }
        downloadPeerPath(file)
      }

      /**
       * 对端存图 → blob URL。原生 `HistoricalImageCache` 走的是 `session.readAttachment`，
       * 线上就是 `/api/session/attachment`（args `request: {sessionId, attachment}`），
       * 返回值 `data` 是 base64 字符串。同一张图只取一次。
       */
      function peerImageUrl(peerId, sessionId, attachment) {
        const key = `${peerId}:${attachment.attachmentId}`
        const cached = PEER_IMAGE_URLS.get(key)
        if (cached !== undefined) return cached
        diagNote(`image fetch ${key}`)
        const pending = call('proxy', {
          id: peerId,
          method: 'session/attachment',
          payload: { args: { request: { sessionId, attachment } } },
        }).then((result) => {
          const envelope = envelopeOf(result, '读取图片失败')
          const value = envelope.value ?? {}
          const base64 = typeof value.data === 'string' ? value.data : ''
          if (base64 === '') throw new Error('对端没有给出图片字节')
          const binary = atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let at = 0; at < binary.length; at += 1) bytes[at] = binary.charCodeAt(at)
          const mediaType = typeof value.attachment?.mediaType === 'string'
            ? value.attachment.mediaType
            : (typeof attachment.mediaType === 'string' ? attachment.mediaType : 'image/png')
          const url = URL.createObjectURL(new Blob([bytes], { type: mediaType }))
          // 记成最近使用（LRU 末尾），淘汰超出上限的老图并释放 blob URL，避免长会话把整段图片都留在内存里。
          PEER_IMAGE_READY.delete(key)
          PEER_IMAGE_READY.set(key, url)
          while (PEER_IMAGE_READY.size > PEER_IMAGE_READY_LIMIT) {
            const oldest = PEER_IMAGE_READY.keys().next()
            if (oldest.done === true) break
            const stale = PEER_IMAGE_READY.get(oldest.value)
            PEER_IMAGE_READY.delete(oldest.value)
            // 只有已经不在任何组件里用的 URL 才释放；被灯箱/当前帧引用的仍由 React 持有，释放会白屏，
            // 所以这里改成「取消缓存引用」而不是立刻 revoke：blob 由 GC 在没人引用时回收。
            if (stale !== undefined) diagNote(`image evict ${oldest.value}`)
          }
          return url
        }).catch((failure) => {
          PEER_IMAGE_URLS.delete(key)
          throw failure
        })
        PEER_IMAGE_URLS.set(key, pending)
        return pending
      }

      /** 单图显示尺寸 —— 原生 `singleFit`：长边 240、比例夹在 [0.25, 4]、不放大小图、超范围裁切。 */
      function singleImageBox(attachment) {
        const width = Number(attachment?.width)
        const height = Number(attachment?.height)
        if (!(width > 0 && height > 0)) return { width: 240, height: 240, objectPosition: 'center' }
        const natural = width / height
        const ratio = Math.min(4, Math.max(0.25, natural))
        const box = ratio >= 1 ? { width: 240, height: 240 / ratio } : { width: 240 * ratio, height: 240 }
        const scale = Math.min(1, width / box.width, height / box.height)
        return {
          width: Math.max(1, Math.round(box.width * scale)),
          height: Math.max(1, Math.round(box.height * scale)),
          objectPosition: natural < 0.25 ? 'center top' : natural > 4 ? 'left center' : 'center',
        }
      }

      /** 一张历史图片：先占位，取到字节后换成真图；点开走原生同款灯箱（整屏遮罩）。 */
      function MessageImage({ file, peerId, sessionId, compact }) {
        const attachment = file.attachment
        const attachmentId = attachment?.attachmentId
        const key = `${peerId}:${String(attachmentId)}`
        // 缓存里已有 URL 时第一帧就出图：否则每次重新挂载都要先闪一下「加载中」，看起来就是图片在闪。
        const [url, setUrl] = useState(() => PEER_IMAGE_READY.get(key) ?? null)
        const [failed, setFailed] = useState(false)
        const [lightbox, setLightbox] = useState(false)
        // TEMP-DIAG：确认「闪烁」是不是重新挂载（每次挂载都会留一行，重复出现即说明组件被反复重建）。
        useEffect(() => { diagNote(`image mount ${key} ready=${PEER_IMAGE_READY.has(key)}`) }, [])
        // 视口懒加载：图片进（或贴近）视口才向对端要字节；缓存命中（PEER_IMAGE_READY）直接出图。
        const frameRef = useRef(null)
        useEffect(() => {
          if (typeof attachmentId !== 'string') return undefined
          const ready = PEER_IMAGE_READY.get(key)
          if (ready !== undefined) {
            // 命中即刷新 LRU 顺序（delete+set 把这张挪到最近使用的末尾）。
            PEER_IMAGE_READY.delete(key)
            PEER_IMAGE_READY.set(key, ready)
            setUrl(ready)
            return undefined
          }
          let live = true
          const node = frameRef.current
          VISION.watch(node, `image:${key}`, () => {
            diagNote(`image visible ${key}`)
            void peerImageUrl(peerId, sessionId, attachment).then((next) => {
              if (live) setUrl(next)
            }).catch(() => {
              if (live) setFailed(true)
            })
          })
          return () => {
            live = false
            VISION.release(node)
          }
        }, [peerId, sessionId, attachmentId])
        const fit = compact ? undefined : singleImageBox(attachment)
        const frameStyle = compact
          ? { ...styles.userImageFrame, width: 64, height: 64, minWidth: 64, minHeight: 64 }
          : { ...styles.userImageFrame, width: fit.width, height: fit.height }
        if (failed) {
          return h('div', { style: { ...frameStyle, display: 'grid', placeItems: 'center' }, title: '图片读取失败' },
            h('span', { style: styles.presentDesc }, '图片读取失败'))
        }
        const open = () => {
          if (url === null) return
          // 带工作区路径的附件沿用「右侧预览」「与原生一致」；纯图片开灯箱。
          if (file.path !== '') openPreviewOrInfo({ path: file.path, description: '' })
          else setLightbox(true)
        }
        return h(react.Fragment, null,
          h('button', {
            type: 'button',
            ref: frameRef,
            style: { ...frameStyle, padding: 0, cursor: url === null ? 'progress' : 'zoom-in' },
            title: file.name,
            onClick: open,
          },
            url === null
              ? h('span', { style: styles.presentDesc }, '加载中')
              : h('img', {
                src: url,
                alt: file.name,
                draggable: false,
                style: { display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: compact ? 'center' : fit.objectPosition },
              }),
          ),
          lightbox && url !== null
            ? h(ImageLightbox, { url, alt: file.name, onClose: () => setLightbox(false) })
            : null,
        )
      }

      /**
       * 灯箱 —— 原生 `ImageLightbox`：整屏半透明遮罩（背景画面仍可见）+ 居中原图（圆角、投影），
       * 右上角浮起圆角按钮组（「全屏」＋「关闭 ✕」），点遮罩或 Esc 关闭，按钮组不吃点击。
       */
      function ImageLightbox({ url, alt, onClose }) {
        const [full, setFull] = useState(false)
        useEffect(() => {
          const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
          window.addEventListener('keydown', onKeyDown)
          return () => window.removeEventListener('keydown', onKeyDown)
        }, [onClose])
        return h('div', {
          style: styles.imageLightboxBackdrop,
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': alt,
          onClick: onClose,
          onMouseDown: (event) => event.stopPropagation(),
        },
          h('img', {
            src: url,
            alt,
            draggable: false,
            style: full
              ? { ...styles.imageLightboxImage, maxWidth: '100vw', maxHeight: '100vh', borderRadius: 0 }
              : styles.imageLightboxImage,
            onClick: (event) => event.stopPropagation(),
          }),
          h('div', { style: styles.imageLightboxTools, onClick: (event) => event.stopPropagation() },
            h('button', {
              type: 'button',
              style: styles.imageLightboxTool,
              title: full ? '退出全屏' : '全屏查看',
              'aria-label': full ? '退出全屏' : '全屏查看',
              onClick: () => setFull((previous) => !previous),
            }, full ? '⤡' : '⤢'),
            h('button', {
              type: 'button',
              style: styles.imageLightboxTool,
              title: '关闭',
              'aria-label': '关闭',
              onClick: onClose,
            }, '✕'),
          ),
        )
      }

      /**
       * 提问自带的附件行 —— 原生 `UserContent`：附件排在气泡**上面**、右对齐；
       * 图片是真缩略图（单图长边 240、多图 64 方块），非图片是「名字 + 大小」的小卡。
       */
      function renderUserAttachments(files, peerId, sessionId) {
        if (!Array.isArray(files) || files.length === 0) return null
        const images = files.filter((file) => file.kind === 'image')
        const others = files.filter((file) => file.kind !== 'image')
        const compact = images.length > 1
        return h('div', { style: styles.userAttachmentRow },
          images.length === 0 ? null : h('div', { style: styles.userImageGallery },
            images.map((file, index) => h(MessageImage, { key: `image${index}`, file, peerId, sessionId, compact }))),
          others.length === 0 ? null : h('div', { style: styles.userFileStack },
            others.map((file, index) => h('span', { key: `file${index}`, style: styles.userFileCard, title: file.name },
              /* 原生 `UserContent`：28px 类型图标 + 名字 + 「扩展名 大小」两行 */
              h('span', { style: styles.userFileIcon }, fileGlyph(18)),
              h('span', { style: styles.userFileContent },
                h('span', { style: styles.userFileName }, file.name),
                h('span', { style: styles.userFileMeta },
                  [(String(file.name).split('.').pop() ?? '').toUpperCase().slice(0, 8), formatBytes(file.bytes)]
                    .filter((part) => part !== '').join(' ') || '文件'),
              ),
            ))),
        )
      }

      /** 附件卡片（聊天内容里的 image/file）：点击走右侧预览面板（原生同样是开侧栏）。 */
      function renderAttachments(files) {
        if (!Array.isArray(files) || files.length === 0) return null
        return h('div', { style: files.length === 1 ? styles.presentGridSingle : styles.presentGrid },
          files.map((file, index) => h('div', { key: `${index}`, style: styles.presentCard },
            h('button', {
              type: 'button',
              style: styles.presentCardButton,
              title: file.name,
              onClick: () => {
                if (file.path !== '') openPreviewOrInfo({ path: file.path, description: '' })
              },
            }),
            h('span', { style: styles.presentIcon }, file.kind === 'image' ? '▣' : '▤'),
            h('div', { style: styles.presentBody },
              h('div', { style: styles.presentDetails },
                h('span', { style: styles.presentName }, file.name),
                h('span', { style: styles.presentDesc }, file.meta || (file.kind === 'image' ? '图片' : '文件')),
              ),
            ),
          )),
        )
      }

      /**
       * 打开侧栏预览：与原生一致 —— 右栏出现一个文件页签，内容按类型分派：
       * 图片走 `/api/file` 转发（二进制不经过 JSON），文本/CSV/Markdown 走 `workspaceFiles/read`。
       */
      function openFilePreview(file) {
        const raw = typeof file?.path === 'string' ? file.path : ''
        if (raw === '') return
        const absolutePath = absolutePeerPath(raw)
        setPreviewTab({ path: raw, absolutePath, description: typeof file.description === 'string' ? file.description : '', info: false })
        // 原生把目录也当文件链接（`parseFileLink` 不排除尾斜杠），点开后由侧栏按地址挑视图；
        // 我们这里用对端的 `workspaceFiles/list` 复刻成目录列表。
        if (/[\\/]$/u.test(raw)) void loadDirectoryContent(raw)
        else {
          void loadPreviewContent(absolutePath)
          // 预览里的下载图标也要知道「本机是否已有副本」：从文件树/链接进来的文件不会经过卡片，
          // 这里补一次登记（同一批会合并，已经问过就自动跳过）。
          askSizeOf(transferKeyOf(activePeer, absolutePath), absolutePath)
        }
      }

      /** 目录预览：走对端 `workspaceFiles/list`，列出直接子项（原生 `SidebarFiles` 的目录视图）。 */
      function loadDirectoryContent(path) {
        const target = path.replace(/[\\/]+$/u, '')
        setPreviewState({ status: 'loading', mode: 'dir', text: '', entries: [] })
        const args = { workspaceFileScopeId: openSession, path: target }
        Promise.resolve(call('proxy', { id: activePeer, method: 'workspaceFiles/list', payload: { args } }))
          .then((result) => {
            const envelope = envelopeOf(result, '读取目录失败')
            const value = envelope.value ?? {}
            setPreviewState({
              status: 'ready',
              mode: 'dir',
              text: '',
              dirPath: typeof value.path === 'string' ? value.path : target,
              entries: Array.isArray(value.entries) ? value.entries : [],
            })
          })
          .catch((failure) => {
            setPreviewState({ status: 'error', mode: 'dir', text: '', message: errorText(failure) })
          })
      }

      /**
       * 「显示文件位置」的替代：对端无法定位文件，就把对端传来的原路径当作预览打开 ——
       * 右侧面板同时列出原路径与本机按会话 cwd 解析出的绝对路径。
       */
      function openFilePathInfo(file) {
        const raw = typeof file?.path === 'string' ? file.path : ''
        if (raw === '') return
        setPreviewTab({ path: raw, absolutePath: absolutePeerPath(raw), description: '', info: true })
        setPreviewState({ status: 'ready', mode: 'info', text: '' })
      }

      /** present 里的相对路径按该会话的 `cwd` 解析（原生 `resolveWorkspacePath(cwd, path)`）。 */
      function absolutePeerPath(path) {
        if (isAbsPath(path)) return path
        const cwd = sessions.find((item) => item.sessionId === openSession)?.cwd
        return isAbsPath(cwd) ? joinPathOf(cwd, path) : path
      }

      /**
       * 文件条目的对端绝对路径：优先用 `absolutePath`（打开预览时算好放在 tab 上的那份），
       * 其次把 `path` 按会话 cwd 解析。`path` 常是工作区相对路径（如 `sample_files/x.zip`），
       * 直接交给 Host 会被判「需要绝对文件路径」。
       */
      function peerAbsoluteOf(file) {
        const abs = typeof file?.absolutePath === 'string' ? file.absolutePath : ''
        if (isAbsPath(abs)) return abs
        const raw = typeof file?.path === 'string' ? file.path : ''
        return raw === '' ? '' : absolutePeerPath(raw)
      }


      /**
       * 卡片/链接的统一入口：能预览的就开右侧预览，不能预览的退到「路径」页
       * （对端绝对路径 + 本机解析路径），不再依赖对端定位。
       */
      function openPreviewOrInfo(file) {
        const raw = typeof file?.path === 'string' ? file.path : ''
        if (raw === '') return
        // 原生把目录也当文件链接（尾斜杠），目录一律进目录视图。
        if (/[\\/]$/u.test(raw)) {
          openFilePreview(file)
          return
        }
        // 能预览的直接进预览；不能预览的也进预览 —— 由预览区按主体源码渲染
        // 「该格式文件暂时无法预览」空态 + 「打开」分段按钮（打开 / 显示文件位置）。
        openFilePreview(file)
      }

      /** 读对端字节：文本类走 `workspaceFiles/read`，页大小与原生一致（按行分页）。 */
      function loadPreviewContent(path) {
        const mode = previewModeOf(path)
        diagNote(`preview load ${mode} ${path}`)
        setPreviewState({ status: 'loading', mode, text: '' })
        // 每次读取都换一个 nonce：图片走 `<img>` 缓存，靠它把旧字节真正换掉。
        setPreviewNonce((current) => current + 1)
        // 图片由 `<img>` 的 onLoad 翻转；PDF/Office/Excel/音视频把字节直接交给元素或渲染器。
        if (mode === 'image' || mode === 'pdf' || mode === 'office' || mode === 'excel' || mode === 'video' || mode === 'audio') {
          setPreviewState({ status: 'ready', mode, text: '' })
          return
        }
        if (mode === 'binary') {
          // 不可预览：不进「路径」页，交给预览区渲染主体的 unsupported 空态。
          setPreviewState({ status: 'ready', mode: 'unsupported', text: '' })
          return
        }
        const args = {
          workspaceFileScopeId: openSession,
          path,
          // 行号口径是 1 基（`resolvePage` 里 `integerAtLeast(offset, 1)`），`0` 会直接爆
          // “offset must be a safe integer of at least 1”。
          range: { offset: 1, limit: 4000 },
        }
        Promise.resolve(call('proxy', { id: activePeer, method: 'workspaceFiles/read', payload: { args } }))
          .then((result) => {
            const envelope = envelopeOf(result, '读取文件失败')
            const value = envelope.value ?? {}
            setPreviewState({
              status: 'ready',
              mode,
              text: typeof value.text === 'string' ? value.text : '',
              bytes: value.bytes,
              eof: value.eof !== false,
            })
          })
          .catch((failure) => {
            const message = errorText(failure)
            // 没有尾斜杠的目录路径：`read` 会报 “is a directory”，此时退到目录列表。
            if (/is a directory/iu.test(message)) {
              void loadDirectoryContent(previewTab?.path ?? path)
              return
            }
            setPreviewState({ status: 'error', mode, text: '', message })
          })
      }

      /**
       * 路径页没有独立的返回入口：点「重新读取文件」即回到该文件的预览内容
       * （原生刷新键读的就是同一个路径）。普通预览态下它就是纯刷新。
       */
      function reopenPreviewFile() {
        const tab = previewTab
        if (tab === null) return
        if (tab.info === true) setPreviewTab({ ...tab, info: false })
        void loadPreviewContent(tab.absolutePath ?? tab.path)
      }

      /** 预览面板右上工具：28×28 圆钮、15px 字形（原生 TextPreview `.tool`）。 */
      function previewTool(kind, onClick, hint) {
        return h('button', {
          type: 'button',
          style: styles.previewTool,
          'data-rp-tool': '',
          'aria-label': hint,
          onMouseEnter: (event) => showHint(`pane-${kind}`, hint, event),
          onMouseLeave: () => hideHint(`pane-${kind}`),
          onClick,
        }, kind === 'refresh' ? refreshGlyph() : kind === 'download' ? downloadGlyph() : kind === 'nav' ? navFolderGlyph(navOpen) : folderGlyph(15))
      }






      /** 会话工作目录：present 的绝对路径解析与文件树根都用它。 */
      function peerCwd() {
        const cwd = sessions.find((item) => item.sessionId === openSession)?.cwd
        return isAbsPath(cwd) ? cwd : ''
      }

      /** 绝对路径 → 会话 cwd 相对路径（`workspaceFiles/list` 的入参口径，根为 `.`）。 */
      function relativeToCwd(value) {
        const cwd = peerCwd()
        if (!isAbsPath(value) || cwd === '') return value
        if (value.toLowerCase().startsWith(cwd.toLowerCase())) {
          const rest = value.slice(cwd.length).replace(/^[\\/]+/u, '')
          return rest === '' ? '.' : rest
        }
        return value
      }

      /** 文件树根（`.`）的一个目录：走对端 `workspaceFiles/list`，按需懒加载。 */
      function loadNavDirectory(rel) {
        if (openSession === null) return
        setNavDirs((previous) => ({
          ...previous,
          [rel]: { status: 'loading', entries: previous[rel]?.entries ?? [], message: '' },
        }))
        Promise.resolve(call('proxy', {
          id: activePeer,
          method: 'workspaceFiles/list',
          payload: { args: { workspaceFileScopeId: openSession, path: rel } },
        }))
          .then((result) => {
            const envelope = envelopeOf(result, '读取目录失败')
            const value = envelope.value ?? {}
            const entries = Array.isArray(value.entries) ? value.entries : []
            entries.sort((left, right) => {
              const leftDir = left?.type === 'directory' ? 0 : 1
              const rightDir = right?.type === 'directory' ? 0 : 1
              if (leftDir !== rightDir) return leftDir - rightDir
              return String(left?.name ?? '').localeCompare(String(right?.name ?? ''))
            })
            setNavDirs((previous) => ({ ...previous, [rel]: { status: 'ready', entries, message: '' } }))
          })
          .catch((failure) => {
            setNavDirs((previous) => ({
              ...previous,
              [rel]: { status: 'error', entries: [], message: errorText(failure) },
            }))
          })
      }

      /** 文件树开关：打开时先取根目录（原生 `navigator.show` 默认根展开）。 */
      function toggleNavigator() {
        setNavOpen((open) => {
          const next = !open
          if (next) {
            setNavExpanded((previous) => (previous['.'] === true ? previous : { ...previous, '.': true }))
            if (navDirs['.'] === undefined || navDirs['.'].status === 'error') loadNavDirectory('.')
          }
          return next
        })
      }

      /** 树里点文件：按 cwd 拼回绝对路径再进预览。 */
      function openNavFile(rel) {
        const cwd = peerCwd()
        const absolute = cwd === '' ? rel : joinPathOf(cwd, rel)
        setPreviewTab({ path: absolute, absolutePath: absolute, description: '' })
        loadPreviewContent(absolute)
      }

      /** 右侧预览面板：页签条 + 路径行 + 正文（+ 可开的文件树）。 */
      function renderPreviewPane() {
        if (previewTab === null) return null
        const path = previewTab.path
        const shownPath = previewTab.absolutePath ?? path
        // 目录路径带尾斜杠，`basename` 会取到空串，页签名先去掉分隔符。
        const name = baseNameOf(path.replace(/[\\/]+$/u, ''))
        const mode = previewTab.info === true ? 'info' : previewModeOf(path)
        // 下载态与卡片同源：预览工具条上那个下载图标也要跟着变成「取消 / 转圈」。
        const paneUi = downloadUiOf(transferKeyOf(activePeer, shownPath), shownPath, localCopies)
        /** 预览工具条上的「显示文件位置」也在等窗口：图标转圈、tooltip 换成「正在打开…」。 */
        const paneRevealing = revealing[transferKeyOf(activePeer, shownPath)] === true
        const paneDownloadTip = paneUi.loading ? '正在开始下载…（点击取消）' : paneUi.hint
        // 页签条：38px（28px 行 + 10px 上边距）、gap 4、页签圆角 8 无描边。
        const tabs = h('div', { style: styles.previewTabStrip },
          h('div', {
            style: previewTabHover ? { ...styles.previewTab, ...styles.previewTabHover } : styles.previewTab,
            onMouseEnter: () => setPreviewTabHover(true),
            onMouseLeave: () => {
              setPreviewTabHover(false)
              setIconHint((current) => (current !== null && current.key === 'tab-close' ? null : current))
            },
          },
            HostFileTypeIcon === null ? null : h(HostFileTypeIcon, { path, size: 16 }),
            // 关闭钮覆盖在标题尾部，标题在它下面淡出（原生 `.tabActive .tabTitle` 的 mask 是常驻的）
            h('span', { style: { ...styles.previewTabName, ...styles.previewTabNameYield } }, name),
            h('button', {
              type: 'button',
              style: styles.previewTabClose,
              'data-rp-tab-close': '',
              'aria-label': '关闭',
              onMouseEnter: (event) => showHint('tab-close', '关闭', event),
              onMouseLeave: () => hideHint('tab-close'),
              onClick: () => { setPreviewFull(false); setPreviewTab(null); setPreviewState({ status: 'idle' }) },
            }, closeGlyph(14)),
          ),
          h('div', { style: styles.stripFill }),
          h('div', { style: styles.paneChrome },
            h('button', {
              type: 'button',
              style: styles.paneIconButton,
              'aria-label': previewFull ? '退出全屏' : '全屏',
              'aria-pressed': previewFull,
              onMouseEnter: (event) => showHint('pane-fullscreen', previewFull ? '退出全屏' : '全屏', event),
              onMouseLeave: () => hideHint('pane-fullscreen'),
              onClick: () => setPreviewFull((open) => !open),
            }, previewFull ? exitFullscreenGlyph() : fullscreenGlyph()),
            h('button', {
              type: 'button',
              style: styles.paneIconButton,
              'aria-label': '收起右侧边栏',
              onMouseEnter: (event) => showHint('pane-collapse', '收起侧边栏', event),
              onMouseLeave: () => hideHint('pane-collapse'),
              onClick: () => { setPreviewFull(false); setPreviewTab(null); setPreviewState({ status: 'idle' }) },
            }, collapseGlyph()),
          ),
        )
        // 路径行：38px、`0 6px 0 16px`、目录三级色 + 文件名主色（原生 PathLabel）。
        const directory = dirNameOf(shownPath)
        const header = h('div', { style: styles.previewHeader },
          h('span', { style: styles.previewPath, title: shownPath },
            h('span', { style: styles.previewPathText },
              directory === '' ? null : h('span', { style: { color: T.ter } }, `${directory}${shownPath.includes('\\') ? '\\' : '/'}`),
              h('span', { style: { color: T.pri } }, name),
            ),
          ),
          previewTool('refresh', () => { reopenPreviewFile() }, '重新读取文件'),
          h('span', { style: styles.previewFolderSplit },
            h('button', {
              type: 'button',
              style: styles.previewFolderMain,
              'aria-label': '打开',
              onMouseEnter: (event) => showHint('pane-open', '打开', event),
              onMouseLeave: () => hideHint('pane-open'),
              onClick: () => void openPeerPath({ path, absolutePath: shownPath }),
            }, openInAppGlyph(15)),
            h('span', { style: styles.previewFolderDivider }),
            h('button', {
              type: 'button',
              style: paneUi.local ? { ...styles.previewFolderMain, cursor: 'default' } : styles.previewFolderMain,
              'aria-label': paneUi.local ? '已下载' : paneUi.active ? '取消下载' : '下载',
              onMouseEnter: (event) => showHint('pane-download', paneUi.local ? '已下载' : paneDownloadTip, event),
              onMouseLeave: () => hideHint('pane-download'),
              // 与卡片同一份状态：本机已有副本 → 打勾、点击无动作；在跑（含 loading）就是取消；否则发起下载。
              onClick: () => activateDownload({ path, absolutePath: shownPath }, paneUi, 'none'),
            }, paneUi.local
              ? checkGlyph(15)
              : paneUi.active
                ? (paneUi.loading ? spinnerGlyph(15) : closeGlyph(15))
                : downloadGlyph()),
            h('span', { style: styles.previewFolderDivider }),
            h('button', {
              type: 'button',
              style: styles.previewFolderCaret,
              'aria-label': paneRevealing ? '正在打开…' : '显示文件位置',
              'data-dsh-popup': '',
              onMouseEnter: (event) => showHint('pane-reveal', paneRevealing ? '正在打开…' : '显示文件位置', event),
              onMouseLeave: () => hideHint('pane-reveal'),
              // 已下载 → 资源管理器定位；没下载 → 照旧进右侧「路径」页（对端绝对路径）。
              // 定位那 2 秒里图标转圈、文案「正在打开…」，等窗口真的出来（或 5 秒超时）再恢复。
              onClick: () => {
                if (paneRevealing) return
                const file = { path, absolutePath: shownPath }
                void revealLocalCopy(file).then((revealed) => {
                  if (!revealed) openFilePathInfo(file)
                })
              },
            }, paneRevealing ? spinnerGlyph(13) : folderGlyph(13)),
          ),
          previewTool('nav', () => toggleNavigator(), navOpen ? '隐藏文件树' : '显示文件树'),
        )
        return h('div', {
          style: previewFull
            ? { ...styles.previewPane, ...styles.previewPaneFull }
            : styles.previewPane,
          'data-remote-peers-scroll': '',
        },
          tabs,
          header,
          h('div', { style: styles.previewContentRow },
            h('div', { style: styles.previewContent }, renderPreviewBody(mode, path)),
            navOpen ? renderNavigator() : null,
          ),
        )
      }

      /** 左侧工作站的文件树：42px 搜索条 + 懒加载目录行（原生 `FileNavigator` 的树态）。 */
      function renderNavigator() {
        const root = navDirs['.']
        const query = navQuery.trim().toLowerCase()
        return h('aside', { style: styles.navigator, 'data-remote-peers-scroll': '' },
          h('div', { style: styles.navSearchBar },
            h('div', { style: styles.navSearchField, 'data-focus-within': '' },
              h('span', { style: styles.navSearchIcon }, searchGlyph()),
              h('input', {
                type: 'search',
                value: navQuery,
                placeholder: '搜索文件',
                style: styles.navSearchInput,
                onChange: (event) => setNavQuery(event.target.value),
              }),
              navQuery === ''
                ? null
                : h('button', {
                    type: 'button',
                    style: styles.navSearchClear,
                    'aria-label': '清除搜索',
                    onClick: () => setNavQuery(''),
                  }, closeGlyph(14)),
            ),
          ),
          h('div', { style: styles.navBody, 'data-remote-peers-scroll': '' },
            root === undefined || root.status === 'loading'
              ? h('p', { style: styles.navNote }, '加载中…')
              : root.status === 'error'
                ? h('p', { style: styles.navNote, role: 'alert' }, root.message)
                : renderNavLevel('.', 0, query),
          ),
        )
      }

      /**
       * 一个目录层级；目录行可展开（展开时懒加载），文件行点击进预览。
       * `query` 非空时只保留名字命中的行（对端文件搜索端点参数未确认，这里只筛已加载的树）。
       */
      function renderNavLevel(rel, depth, query) {
        const dir = navDirs[rel]
        if (dir === undefined) return null
        if (dir.status === 'loading' && dir.entries.length === 0) return h('p', { style: styles.navNote }, '加载中…')
        if (dir.status === 'error') return h('p', { style: styles.navNote }, dir.message)
        const visible = query === ''
          ? dir.entries
          : dir.entries.filter((entry) => String(entry?.name ?? '').toLowerCase().includes(query))
        if (visible.length === 0) return query === '' ? h('p', { style: styles.navNote }, '空目录') : null
        const currentAbs = (previewTab?.absolutePath ?? '').toLowerCase()
        const cwd = peerCwd()
        return h('div', { style: depth === 0 ? styles.navLevel : styles.navLevelNested },
          visible.map((entry) => {
            const entryRel = rel === '.' ? String(entry.name) : `${rel}/${entry.name}`
            const entryAbs = cwd === '' ? entryRel : joinPathOf(cwd, entryRel)
            const isDir = entry?.type === 'directory'
            const open = isDir && navExpanded[entryRel] === true
            return h('div', { key: entryRel, style: styles.navItem },
              h('button', {
                type: 'button',
                style: (() => {
                  const current = entryAbs.toLowerCase() === currentAbs && !isDir
                  if (current) return { ...styles.navRow, ...styles.navRowCurrent }
                  if (navHover === entryRel) return { ...styles.navRow, ...styles.navRowHover }
                  return styles.navRow
                })(),
                title: entryRel,
                onMouseEnter: () => setNavHover(entryRel),
                onMouseLeave: () => setNavHover((current) => (current === entryRel ? '' : current)),
                onClick: () => {
                  if (isDir) {
                    setNavExpanded((previous) => {
                      const next = { ...previous }
                      if (next[entryRel] === true) delete next[entryRel]
                      else next[entryRel] = true
                      return next
                    })
                    if (navDirs[entryRel] === undefined) loadNavDirectory(entryRel)
                    return
                  }
                  openNavFile(entryRel)
                },
              },
                isDir ? h('span', { style: styles.navIcon }, caretRightGlyph(open)) : null,
                isDir
                  ? h('span', { style: styles.navIcon }, folderGlyph(16))
                  : HostFileTypeIcon === null
                    ? null
                    : h(HostFileTypeIcon, { path: entry.name, size: 16 }),
                h('span', { style: styles.navName }, String(entry?.name ?? '')),
              ),
              open ? renderNavLevel(entryRel, depth + 1, query) : null,
            )
          }),
        )
      }
















      /** 路径信息页：原路径与解析结果相同时只显示一条，避免同一个绝对路径出现两遍。 */
      function renderPathInfoBody() {
        const raw = previewTab?.path ?? ''
        const absolute = previewTab?.absolutePath ?? raw
        const resolved = absolute !== raw
        const type = extOf(absolute)
        return h('div', { style: styles.pathInfoWrap },
          h('div', { style: styles.pathInfoHint },
            type === '' ? '该类型无法内嵌预览，可按下方向上的「打开」在本机用关联程序打开。' : `.${type} 无法内嵌预览，可按下方向上的「打开」在本机用关联程序打开。`),
          resolved
            ? h('div', null,
                h('div', { style: styles.pathInfoLabel }, '对端原路径'),
                h('div', { style: styles.pathInfoValue }, raw),
              )
            : null,
          h('div', null,
            h('div', { style: styles.pathInfoLabel }, resolved ? '对端绝对路径（会话工作目录解析）' : '对端文件绝对路径'),
            h('div', { style: styles.pathInfoValue }, absolute),
          ),
        )
      }














      /** 目录预览：直接子项列表，点目录继续下钻、点文件按文件预览打开（原生侧栏目录视图）。 */
      function renderDirectoryBody(path) {
        const dirPath = String(previewState.dirPath ?? previewTab?.path ?? path).replace(/[\\/]+$/u, '')
        // 原生文件列表：目录在前，同类型按名字排。
        const entries = (Array.isArray(previewState.entries) ? [...previewState.entries] : [])
          .sort((left, right) => {
            const dirLeft = left?.type === 'directory' ? 0 : 1
            const dirRight = right?.type === 'directory' ? 0 : 1
            if (dirLeft !== dirRight) return dirLeft - dirRight
            return String(left?.name ?? '').localeCompare(String(right?.name ?? ''), undefined, { numeric: true })
          })
        return h('div', { style: styles.previewScroller },
          h('div', { style: styles.dirList },
            entries.length === 0
              ? h('div', { style: styles.dirEmpty }, '空文件夹')
              : entries.map((entry, at) => {
                  const name = String(entry?.name ?? '')
                  const isDir = entry?.type === 'directory'
                  const child = joinPathOf(dirPath, name)
                  return h('button', {
                    key: `${at}`,
                    type: 'button',
                    style: styles.dirRow,
                    title: child,
                    onClick: () => {
                      if (isDir) void loadDirectoryContent(`${child}/`)
                      else openPreviewOrInfo({ path: child, description: '' })
                    },
                  },
                    h('span', { style: styles.dirIcon }, isDir ? folderGlyph() : fileGlyph()),
                    h('span', { style: styles.dirName }, name),
                    h('span', { style: styles.dirSize }, isDir ? '' : formatBytes(entry?.size)),
                  )
                }),
          ),
        )
      }

      function renderPreviewBody(mode, path) {
        if (mode === 'info') return renderPathInfoBody()
        if (previewState.mode === 'dir') {
          if (previewState.status === 'loading') return renderPreviewLoading()
          if (previewState.status === 'error') {
            return h('div', { style: { ...styles.previewScroller, ...styles.previewTextDoc, color: 'var(--dsw-alias-state-error-primary, #c0392b)' } },
              previewState.message ?? '读取失败')
          }
          return renderDirectoryBody(path)
        }
        // 图片的读取态要保留 <img> 本体（靠 onLoad 才能翻转），因此只覆盖不替换。
        if (mode !== 'image' && previewState.status === 'loading') return renderPreviewLoading()
        if (mode !== 'image' && previewState.status === 'error') {
          return h('div', { style: { ...styles.previewScroller, ...styles.previewTextDoc, color: 'var(--dsw-alias-state-error-primary, #c0392b)' } },
            previewState.message ?? '读取失败')
        }
        if (mode === 'image') {
          return h(previewTypesRef.current.image, {
            key: `image:${previewTab?.absolutePath ?? path}:${previewNonce}`,
            url: remoteFileUrl(activePeer, previewTab?.absolutePath ?? path, { _r: previewNonce }),
            name: baseNameOf(path),
          })
        }
        if (mode === 'office') {
          // 对端先转 PDF 再回字节：本机这条路由只透传，不落盘；渲染交给 pdfjs。
          const params = new URLSearchParams({
            id: activePeer,
            sessionId: openSession,
            path: previewTab?.absolutePath ?? path,
            _r: String(previewNonce),
          })
          return h(previewTypesRef.current.pdf, {
            key: `office:${previewTab?.absolutePath ?? path}:${previewNonce}`,
            url: `/api/remote-peers/office?${params.toString()}`,
            name: baseNameOf(path),
          })
        }
        if (mode === 'pdf') {
          return h(previewTypesRef.current.pdf, {
            key: `pdf:${previewTab?.absolutePath ?? path}:${previewNonce}`,
            url: remoteFileUrl(activePeer, previewTab?.absolutePath ?? path, { _r: previewNonce }),
            name: baseNameOf(path),
          })
        }
        if (mode === 'excel') {
          return h(previewTypesRef.current.excel, {
            key: `excel:${previewTab?.absolutePath ?? path}:${previewNonce}`,
            url: remoteFileUrl(activePeer, previewTab?.absolutePath ?? path, { _r: previewNonce }),
          })
        }
        if (mode === 'html') {
          // 主体是"字节完整 + 沙箱渲染"：这里同样把 HTML 交给 sandbox iframe 执行，
          // 不给 same-origin 权限，脚本也无法碰到宿主页面。
          return h('div', { style: styles.previewScroller },
            h('iframe', {
              srcDoc: previewState.text ?? '',
              sandbox: 'allow-scripts allow-popups allow-forms',
              style: styles.previewHtmlFrame,
              title: baseNameOf(path),
            }),
          )
        }
        if (mode === 'unsupported' || mode === 'binary' || previewState.mode === 'unsupported') {
          // 照抄主体 `TextPreview` 的 `css.empty`：36px 灰化文件图标 + 「该格式文件暂时无法预览」
          // + 交给 Host 的「打开」入口（这里就是卡片同一套分段按钮：主格打开、caret 显示文件位置）。
          const file = { path: previewTab?.path ?? path, absolutePath: previewTab?.absolutePath ?? path }
          const emptyUi = downloadUiOf(transferKeyOf(activePeer, file.absolutePath), file.absolutePath, localCopies)
          return h('div', { style: styles.unsupported },
            fileGlyph(36),
            h('p', { style: styles.unsupportedLine }, '该格式文件暂时无法预览'),
            h('div', { style: { ...styles.splitButton, height: 32 } },
              h('button', {
                type: 'button',
                style: { ...styles.splitLarge, minWidth: 72 },
                onClick: () => void openPeerPath(file),
              }, openInAppGlyph(15), h('span', null, '打开')),
              h('span', { style: styles.splitDivider }),
              h('button', {
                type: 'button',
                style: styles.splitLarge,
                'aria-label': emptyUi.local ? '已下载' : emptyUi.active ? '取消下载' : '下载',
                // 任务优先（有任务时这一格是取消）；本机已有副本 → `✓ 已下载`，点击定位到那份副本。
                onClick: () => activateDownload(file, emptyUi, 'reveal'),
              }, emptyUi.local
                ? checkGlyph(15)
                : emptyUi.active
                  ? (emptyUi.loading ? spinnerGlyph(15) : closeGlyph(15))
                  : downloadGlyph(),
                h('span', null, emptyUi.local ? '已下载' : emptyUi.active ? emptyUi.cancelLabel : '下载')),
              h('span', { style: styles.splitDivider }),
              menuCaret(file, { width: 28 }),
            ),
          )
        }
        if (mode === 'video') {
          return h('div', { style: styles.previewMediaWrap },
            h('video', {
              src: remoteFileUrl(activePeer, previewTab?.absolutePath ?? path, { _r: previewNonce }),
              controls: true,
              style: styles.previewVideo,
              onError: () => setPreviewState({ status: 'error', mode: 'video', text: '', message: '视频无法播放，可能格式不受支持或已被移动' }),
            }),
          )
        }
        if (mode === 'audio') {
          return h('div', { style: styles.previewMediaWrap },
            h('audio', {
              src: remoteFileUrl(activePeer, previewTab?.absolutePath ?? path, { _r: previewNonce }),
              controls: true,
              style: styles.previewAudio,
            }),
          )
        }
        if (mode === 'info') return renderPathInfoBody()
        const text = previewState.text ?? ''
        if (mode === 'markdown') {
          return h('div', { style: { ...styles.previewScroller, ...styles.previewTextDoc, whiteSpace: 'normal', fontFamily: 'var(--dsw-font, inherit)', fontSize: 13, lineHeight: 1.7 } },
            hostMarkdown === null
              ? h('pre', { style: styles.codeBlock }, text)
              : wrapMarkdownDelegate(h(hostMarkdown, {
                  text,
                  labels: markdownLabels,
                  pathImages: {
                    resolve: (value) => {
                      if (!isAbsPath(value) && !/^\.{0,2}[\\/]/.test(value)) return undefined
                      const base = previewTab?.absolutePath ?? previewTab?.path ?? path
                      const target = isAbsPath(value) ? value : joinPathOf(dirNameOf(base), value.replace(/^\.+[\\/]/u, ''))
                      return isImagePath(target) ? ensureRemoteImage(target) : undefined
                    },
                  },
                })),
          )
        }
        if (mode === 'code') {
          // 主体 code 预览：按 `CODE_HIGHLIGHT_EXTENSIONS` 认语言后交给同一个高亮引擎。
          // 这里借原生 `MarkdownText` 的围栏代码块（同一套 highlight + 复制工具条）拿到一致观感。
          const language = codeLanguageOf(path)
          const source = previewState.text ?? ''
          const fenced = `\`\`\`${language}\n${source}\n\`\`\``
          return h('div', { style: { ...styles.previewScroller, padding: '12px 16px', whiteSpace: 'normal' } },
            hostMarkdown === null
              ? h('pre', { style: styles.codeBlock }, source)
              : wrapMarkdownDelegate(h(hostMarkdown, { text: fenced, labels: markdownLabels })),
          )
        }
        if (mode === 'csv') return renderCsvBody(text)
        const lines = text.split('\n')
        return h('div', { style: styles.previewScroller },
          h('div', { style: styles.previewTextDoc },
            h('pre', { style: { margin: 0, font: 'inherit', whiteSpace: 'inherit' } },
              lines.map((line, index) => h('div', { key: `${index}`, style: styles.previewLine }, line === '' ? ' ' : line)),
            ),
          ),
        )
      }





      function renderRichText(text) {
        const lines = String(text ?? '').split('\n')
        const nodes = []
        let index = 0
        while (index < lines.length) {
          const line = lines[index]
          const trimmed = line.trim()
          if (trimmed === '') {
            index += 1
            continue
          }
          if (trimmed.startsWith('```')) {
            const code = []
            index += 1
            while (index < lines.length && !lines[index].trim().startsWith('```')) {
              code.push(lines[index])
              index += 1
            }
            index += 1
            nodes.push(h('pre', { key: `code-${index}`, style: styles.codeBlock },
              h('code', null, code.join('\n')),
            ))
            continue
          }
          const heading = /^#{1,6}\s+(.*)$/.exec(trimmed)
          if (heading !== null) {
            nodes.push(h('div', { key: index, style: styles.heading }, renderInline(heading[1])))
            index += 1
            continue
          }
          // 整行加粗（模型常把「**一致性核对**」当小标题用）
          if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
            nodes.push(h('div', { key: index, style: styles.heading }, renderInline(trimmed)))
            index += 1
            continue
          }
          const ordered = /^\s*(\d+)[.、)]\s+(.*)$/.exec(line)
          if (ordered !== null) {
            nodes.push(h('div', { key: index, style: styles.bulletRow },
              h('span', { style: styles.bulletMark }, `${ordered[1]}.`),
              h('div', { style: styles.bulletText }, renderInline(ordered[2])),
            ))
            index += 1
            continue
          }
          const bullet = /^\s*[-*•]\s+(.*)$/.exec(line)
          if (bullet !== null) {
            nodes.push(h('div', { key: index, style: styles.bulletRow },
              h('span', { style: styles.bulletMark }, '•'),
              h('div', { style: styles.bulletText }, renderInline(bullet[1])),
            ))
            index += 1
            continue
          }
          // 普通段落：连续非空行合并成一段，行内换行折成空格
          const paragraph = [trimmed]
          index += 1
          while (index < lines.length) {
            const next = lines[index].trim()
            if (next === '' || /^#{1,6}\s/.test(next) || /^\s*[-*•]\s+/.test(lines[index])
              || /^\s*\d+[.、)]\s+/.test(lines[index]) || next.startsWith('```')) break
            paragraph.push(next)
            index += 1
          }
          nodes.push(h('div', { key: index, style: styles.paragraph },
            renderInline(paragraph.join(' ')),
          ))
        }
        return nodes
      }

      function renderInline(text) {
        const pieces = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
        return pieces.map((piece, index) => {
          if (piece.startsWith('**') && piece.endsWith('**') && piece.length > 4) {
            return h('strong', { key: index }, piece.slice(2, -2))
          }
          if (piece.startsWith('`') && piece.endsWith('`') && piece.length > 2) {
            return h('code', { key: index, style: styles.code }, piece.slice(1, -1))
          }
          return piece
        })
      }

  /** 单行起步、随内容增长到 336px 上限（原生 `--dsh-composer-text-max-height`）。 */
      /** 发完清空后回到单行高度。 */
      function resetComposerHeight() {
        if (inputRef.current !== null) inputRef.current.style.height = ''
      }

      /** 单行起步、随内容增长到 336px 上限（原生 `--dsh-composer-text-max-height`）。 */
      function growComposer(element) {
        element.style.height = 'auto'
        element.style.height = `${Math.min(element.scrollHeight, 336)}px`
      }

      /** 当前真正上屏的那个输入框：多视图共存时 ref 可能落在被隐藏的那一份上。 */
      function visibleComposerNode() {
        if (typeof document === 'undefined') return inputRef.current
        for (const node of document.querySelectorAll('.rp-composer-input')) {
          if (node.getClientRects().length > 0) return node
        }
        return inputRef.current
      }

      /* 认领/取消 chip 会换掉 textarea 节点，新节点高度回到 min-height，草稿被裁在一行半里。
         所以在提交前（layout 阶段）就按当前内容量高，并盯住宽度变化（窗口缩放、附件行、
         chip 宽度变化都会改可用宽度，需要重新折行量高）。 */
      useLayoutEffect(() => {
        const node = inputRef.current
        if (node === null) return
        /* chip 标签宽度按 chip 自身字体量一次（canvas），得到准确的首行缩进 ——
           按字数估宽会把误差留在 X 右侧，靠量 DOM 又会受挂载顺序影响。 */
        const line = chipLineRef.current
        if (line !== null && pendingCommand !== null && chipLabelWidth?.label !== pendingCommand.label) {
          const chip = line.querySelector('[data-rp-command-chip]')
          if (chip !== null) {
            const computed = getComputedStyle(chip)
            const context = document.createElement('canvas').getContext('2d')
            if (context !== null) {
              context.font = `${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`
              setChipLabelWidth({ label: pendingCommand.label, width: context.measureText(pendingCommand.label).width })
            }
          }
        }
        growComposer(node)
        if (node.scrollTop === 0) setChipScrolled(false)
        if (typeof ResizeObserver === 'undefined') return
        let width = node.clientWidth
        const observer = new ResizeObserver(() => {
          if (node.clientWidth === width) return
          width = node.clientWidth
          growComposer(node)
        })
        observer.observe(node)
        /* 切回会话时这一帧的父容器可能还没真正上屏（量出来是旧高度/0），补两拍重量一次。 */
        const again = () => { if (inputRef.current !== null) growComposer(inputRef.current) }
        const frame = requestAnimationFrame(again)
        const timer = setTimeout(again, 120)
        const lateTimer = setTimeout(again, 420)
        return () => { observer.disconnect(); cancelAnimationFrame(frame); clearTimeout(timer); clearTimeout(lateTimer) }
      }, [pendingCommand, openSession, promptText, chipLabelWidth])

      /* 打开会话就把光标放进输入框（原生打开会话即可直接打字），光标落在草稿末尾。
         视图与快照是分几步上屏的，聚焦要补几拍；只要用户已经在别处操作（焦点不在 body）就不再抢。 */
      useEffect(() => {
        if (openSession === null) return
        const timers = []
        let done = false
        const attempt = () => {
          if (done) return
          const node = visibleComposerNode()
          if (node === null) return
          const active = document.activeElement
          if (active !== null && active !== document.body) return
          /* 草稿是切回来才灌进来的：聚焦前先按内容重量一次，别带着上一次的高度露出。 */
          growComposer(node)
          node.focus({ preventScroll: true })
          node.setSelectionRange(node.value.length, node.value.length)
          done = document.activeElement === node
        }
        for (const delay of [0, 80, 240, 600]) timers.push(setTimeout(attempt, delay))
        return () => { for (const timer of timers) clearTimeout(timer) }
      }, [openSession, activePeer])

      /* 目录没取到过就补一次：权限 chip 只在拿到目录后才有档位可显示（原生同样依赖目录）。 */
      useEffect(() => {
        if (activePeer === '' || permissionOptions.length > 0) return
        void loadPermissionCatalog(activePeer)
      }, [activePeer, permissionOptions.length, loadPermissionCatalog])

      /**
       * 待发附件 —— 图片在原生 `ComposerAttachments.rail` 里是 64×64 缩略图；
       * 其余文件按原生 `ReferenceChip` 的口径排在下面一行蓝字 chip 里（不是文件卡）。
       */
      function renderStagedAttachments() {
        if (pendingFiles.length === 0) return null
        const images = pendingFiles.filter((file) => file.kind === 'image')
        const others = pendingFiles.filter((file) => file.kind !== 'image')
        return h(react.Fragment, null,
          images.length === 0
            ? null
            : h('div', { style: styles.attachRail },
                images.map((file) => h(StagedImage, { key: file.id, file, onRemove: dropStaged, onRetry: retryStaged }))),
          others.length === 0
            ? null
            : h('div', { style: styles.attachChipRow },
                others.map((file) => h(StagedChip, { key: file.id, file, onRemove: dropStaged, onRetry: retryStaged }))))
      }




      /**
       * 缩略图的移除钮：静止透明，悬停整块或自身聚焦才出现（原生 `AttachmentRail .remove`），
       * 失败态整颗转红并常显（原生 `.removeFailed`）。
       * @param file - 待发附件
       * @param onRemove - 移除回调
       * @param options - `{ shown, failed, onReveal }`
       */
      function stagedRemoveButton(file, onRemove, options) {
        const style = options.failed === true
          ? { ...styles.attachRemove, ...styles.attachRemoveFailed }
          : (options.shown === true ? { ...styles.attachRemove, ...styles.attachRemoveShown } : styles.attachRemove)
        return h('button', {
          type: 'button',
          style,
          title: '移除',
          'aria-label': `移除 ${file.name}`,
          onFocus: () => options.onReveal(true),
          onBlur: () => options.onReveal(false),
          onClick: () => onRemove(file.id),
        }, closeGlyph(12))
      }

      /** 一张图片草稿：缩略图 + 上传失败可点重试 + 点开原生灯箱。 */
      function StagedImage({ file, onRemove, onRetry }) {
        const [open, setOpen] = useState(false)
        /* 悬停整块才露出 ✕（触屏没有 hover，失败态另行常显） */
        const [revealed, setRevealed] = useState(false)
        const failed = file.status === 'error'
        return h(react.Fragment, null,
          h('div', {
            style: styles.attachImageItem,
            onMouseEnter: () => setRevealed(true),
            onMouseLeave: () => setRevealed(false),
          },
            h('button', {
              type: 'button',
              style: failed ? { ...styles.attachThumb, ...styles.attachThumbFailed } : styles.attachThumb,
              title: failed ? `${file.error || '上传失败'}（点击重试）` : '查看大图',
              'aria-label': failed ? `重试上传 ${file.name}` : `查看 ${file.name}`,
              onClick: () => { if (failed) onRetry(file); else setOpen(true) },
            },
              h('img', {
                src: file.previewUrl,
                alt: file.name,
                draggable: false,
                style: failed ? { ...styles.attachThumbImg, ...styles.attachThumbImgDim } : styles.attachThumbImg,
              }),
              failed
                ? h('span', { style: styles.attachFailureGlyph, 'aria-hidden': 'true' },
                    file.error === '' ? retryGlyph(16) : warningGlyph(16))
                : null,
            ),
            file.status === 'uploading'
              ? h('span', { style: styles.attachThumbProgress, 'aria-hidden': 'true' },
                  h('span', { style: styles.attachProgressBar }))
              : null,
            stagedRemoveButton(file, onRemove, { shown: revealed, failed, onReveal: setRevealed }),
          ),
          open ? h(ImageLightbox, { url: file.previewUrl, alt: file.name, onClose: () => setOpen(false) }) : null,
        )
      }

      /**
       * 一份非图片草稿：原生 `ReferenceChip` 的蓝字 chip —— 14px 文件图标 + 省略号名字，
       * 上传中转圈、失败转红加删除线（点一下重传），悬停才露出移除。
       */
      function StagedChip({ file, onRemove, onRetry }) {
        const [revealed, setRevealed] = useState(false)
        const failed = file.status === 'error'
        const uploading = file.status === 'uploading'
        const title = uploading ? '上传中…' : failed ? (file.error || '上传失败（点击重试）') : file.name
        const style = failed
          ? { ...styles.attachChip, ...styles.attachChipInvalid }
          : revealed ? { ...styles.attachChip, ...styles.attachChipHover } : styles.attachChip
        return h('div', {
          style,
          title,
          onMouseEnter: () => setRevealed(true),
          onMouseLeave: () => setRevealed(false),
          onClick: failed ? () => onRetry(file) : undefined,
        },
          h('span', { style: styles.attachChipIcon }, fileGlyph(14)),
          h('span', { style: styles.attachChipLabel }, file.name),
          uploading ? h('span', { style: styles.attachChipSpinner, 'aria-hidden': 'true' }, spinnerGlyph(12)) : null,
          revealed
            ? h('button', {
                type: 'button',
                style: styles.attachChipRemove,
                title: '移除',
                'aria-label': `移除 ${file.name}`,
                onClick: (event) => { event.stopPropagation(); onRemove(file.id) },
              }, closeGlyph(12))
            : null,
        )
      }

      /** 底部输入区：药丸容器 + 模型/推理等级 + 状态行。 */
      function renderComposer() {
        /* 权限 chip 常显（原生 PermissionSelect 只要拿到目录就一直在）：
           会话小页里可能没有 `permission/preset` 事件（长会话的 20 条窗口里不一定有），
           此时回落到目录默认档，而不是整块消失。 */
        const shownPermission = permissionPreset
          ?? permissionDefault
          ?? permissionOptions[0]?.value
          ?? null
        /** 输入框共用属性：受控值 + 自适应高度 + Enter 提交（Shift+Enter 换行）。 */
        const inputProps = (style, placeholder) => ({
          ref: inputRef, className: 'rp-composer-input', style, rows: 1, value: promptText, placeholder,
          onChange: (event) => { setPromptText(event.target.value); growComposer(event.target) },
          /* 聚焦时按当前内容重量（切回会话、草稿被灌进来之后才拿得到真实 scrollHeight）。 */
          onFocus: (event) => growComposer(event.currentTarget),
          /* 粘贴带文件就收下来（原生 PASTE_COMMAND：先吃附件，只有纯文本才走默认粘贴）。 */
          onPaste: (event) => { takePaste(event) },
          onKeyDown: (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void submitComposer()
            }
          },
        })
        return h('div', { style: styles.composerWrap },
          /* 沉底按钮锚在输入卡右上：右侧内缩 16、底边离卡片顶 16（原生 `.toBottom`） */
          h('div', { style: { position: 'relative', width: '100%', maxWidth: cardWidth, height: 0, margin: '0 auto', zIndex: 9, pointerEvents: 'none' } },
            showToBottom ? h('div', { style: { position: 'absolute', right: 16, bottom: 16 } }, renderToBottom()) : null,
          ),
          interactions.length === 0 ? null : h('div', { style: { ...styles.convApprovals, maxWidth: cardWidth } },
            interactions.map((entry) => h('div', { key: entry.eventId, style: styles.approvalCard },
              h('div', { style: { fontSize: 13, fontWeight: 600 } },
                entry.kind === 'approval' ? `需要审批：${entry.toolName}` : `需要回答：${entry.toolName}`),
              h('div', { style: styles.muted }, entry.detail),
              h('div', { style: styles.row },
                entry.kind === 'approval' ? h('button', { style: styles.primary, onClick: () => void answerInteraction(entry, 'allowed-once') }, '允许一次') : null,
                entry.kind === 'approval' ? h('button', { style: styles.button, onClick: () => void answerInteraction(entry, 'rejected') }, '拒绝') : null,
                h('button', { style: styles.button, onClick: () => void answerInteraction(entry, 'next') },
                  entry.kind === 'approval' ? '交给下一个处理器' : '跳过'),
              ),
            )),
          ),
          h('div', { style: { ...styles.composerPill, maxWidth: cardWidth, '--dsw-elevation-stroke-color': 'var(--dsw-alias-border-l2, #e3e4e6)' } },
            h('div', { style: styles.overlayAnchor }, plusOpen ? renderPlusMenu() : null),
            renderStagedAttachments(),
            /* textarea 的节点位置在两种模式下保持不变（原生也是同一个编辑器，chip 只是里面的一个装饰），
               否则切模式会重挂节点、丢掉已量好的高度和滚动位置。 */
            (() => {
              /* chip 宽度固定（左内距 4 + 标签实宽 + 2 + X 槽 13 + 右内距 3），不随 hover 变、也不留估宽余量：
                 X 右侧只剩 3px，和左侧离斜杠的 4px 基本对称。 */
              const estimate = [...(pendingCommand?.label ?? '')]
                .reduce((sum, char) => sum + (char.codePointAt(0) > 0x2e80 ? 14 : 7), 0)
              const labelWidth = chipLabelWidth !== null && chipLabelWidth.label === pendingCommand?.label
                ? chipLabelWidth.width
                : estimate
              const chipWidth = pendingCommand === null ? 0 : Math.ceil(labelWidth) + 22
              /* chip 与幽灵提示属于首行：内容滚上去后它们跟着看不见（原生内联原子被裁掉的效果）。 */
              const lineHidden = chipScrolled ? 'hidden' : undefined
              return h('div', { 'data-rp-command-line': '', ref: chipLineRef, style: { position: 'relative', width: '100%', minWidth: 0 } },
                pendingCommand === null
                  ? null
                  : h('span', {
                      'data-rp-command-chip': '',
                      style: { ...styles.commandToken, width: `${chipWidth}px`, visibility: lineHidden },
                      onClick: () => inputRef.current?.focus(),
                    },
                    pendingCommand.label,
                    /* hover 才淡入的取消钮：撤掉 chip，正文原位不动（不插空格、不留缩进）。 */
                    h('button', {
                      'data-rp-command-cancel': '',
                      style: styles.commandCancel,
                      'aria-label': '取消该模式',
                      onClick: cancelPendingCommand,
                    }, closeGlyph(10)),
                  ),
                /* 与原生一致：认领后的提示是 chip 之后的幽灵文本（`p::after`），空草稿才显示；
                   textarea 的 placeholder 会折行后被单行高度裁掉。 */
                pendingCommand === null || promptText !== ''
                  ? null
                  : h('span', {
                      'aria-hidden': 'true',
                      'data-rp-command-hint': '',
                      style: { ...styles.commandHint, paddingLeft: `${chipWidth + 14}px`, visibility: lineHidden },
                    }, pendingCommand.hint),
                /* 原生 chip 是正文里的一个内联原子：首行从 chip 右侧起，折行回到正文左边缘。
                   这里用 text-indent 表达同一件事（首行缩进 = chip 占位，后续行不缩进）。 */
                h('textarea', {
                  ...inputProps(
                    { ...styles.composerInput, width: '100%', textIndent: `${chipWidth}px` },
                    pendingCommand === null ? '发消息或创建任务' : '',
                  ),
                  onScroll: (event) => setChipScrolled(event.currentTarget.scrollTop > 0),
                }),
              )
            })(),
            h('div', { style: styles.composerRow },
              h('div', { style: { position: 'relative' } },
                h('button', {
                  'data-dsh-popup': 'plus',
                  style: plusOpen ? { ...styles.plusCircle, ...styles.plusCircleOpen } : styles.plusCircle,
                  title: '添加文件、目标、计划，或执行指令',
                  onClick: () => {
                    setPermissionOpen(false)
                    setPickerOpen(false)
                    setPlusOpen((previous) => !previous)
                  },
                }, plusGlyph()),
              ),
              shownPermission === null
                ? null
                : h('div', { style: { position: 'relative' } },
                    h('button', {
                      'data-dsh-popup': 'permission',
                      style: styles.permissionButton,
                      title: '对端会话的权限预设（切换会写入对端会话状态）',
                      disabled: permissionBusy,
                      onClick: () => {
                        setPermissionPending(null)
                        setPlusOpen(false)
                        setPickerOpen(false)
                        setPermissionOpen((previous) => !previous)
                      },
                    },
                    permissionIcon(shownPermission, 14),
                    h('span', null, permissionLabel(shownPermission) ?? shownPermission),
                    caretIcon(permissionOpen),
                    ),
                    permissionOpen ? renderPermissionMenu() : null,
                  ),
              h('div', { style: { flex: 1 } }),
              h('div', { style: { position: 'relative' } },
                h('button', {
                  'data-dsh-popup': 'model',
                  style: styles.modelButton,
                  title: '模型与推理等级（写入对端会话状态）',
                  disabled: modelBusy || catalog === null,
                  onClick: () => {
                    setPlusOpen(false)
                    setPermissionOpen(false)
                    setPickerOpen((previous) => !previous)
                    setPickerSection('root')
                  },
                },
                modelBusy
                  ? '切换中…'
                  : h('span', { style: styles.modelValue }, modelNameOf(catalog, selection) || '模型'),
                modelBusy
                  ? null
                  : h('span', { style: styles.modelEffort }, effortNameOf()),
                caretIcon(pickerOpen),
                ),
                pickerOpen && catalog !== null ? renderModelPicker() : null,
              ),
              h('button', {
                /* 有附件也能发（原生 enable = 非空正文 或 有附件） */
                style: sending ? styles.sendCircle : (promptText.trim() === '' && pendingCommand === null && pendingFiles.length === 0 ? { ...styles.sendCircle, opacity: 0.4, cursor: 'default' } : styles.sendCircle),
                disabled: sending || (promptText.trim() === '' && pendingCommand === null && pendingFiles.length === 0),
                onClick: () => void submitComposer(),
                title: '发送',
                }, sending ? sendingGlyph() : sendGlyph()),
            ),
          ),
          renderStatusLine(),
          h('input', {
            ref: fileInputRef,
            type: 'file',
            multiple: true,
            style: { display: 'none' },
            onChange: (event) => {
              const chosen = Array.from(event.target.files ?? [])
              if (chosen.length > 0) stageFiles(chosen)
              event.target.value = ''
            },
          }),
          exportNotice === null ? null : renderExportNotice(),
        )
      }

      /** 取消已认领的 `/目标` / `/计划`：只撤 chip，草稿正文原位不动（不补空格、不留缩进）。 */
      function cancelPendingCommand() {
        setPendingCommand(null)
        setTimeout(() => inputRef.current?.focus(), 0)
      }

      /**
       * 发送：带待插入指令时拼成完整命令行；附件按 receiptId 一起交给对端（原生同一个 content 数组）。
       * 还在上传或上传失败时先拦住 —— 原生也是「等所有附件就绪才发」。
       */
      async function submitComposer() {
        const prefix = pendingCommand?.prefix ?? ''
        const line = `${prefix}${promptText}`.trim()
        if (pendingFiles.some((file) => file.status === 'uploading')) {
          setError('附件还在上传，稍等一下再发')
          return
        }
        if (pendingFiles.some((file) => file.status === 'error')) {
          setError('有附件没传上去：点一下卡片重试，或先移除')
          return
        }
        const receipts = pendingFiles
          .filter((file) => file.receiptId !== '')
          .map((file) => ({ type: 'file', receiptId: file.receiptId }))
        if (line === '' && receipts.length === 0) return
        const sent = await sendPrompt(activePeer, openSession, line, receipts)
        if (sent) releaseStaged()
      }




      /** 「+」菜单：添加（文件/目标/计划）与指令（压缩/下载日志）。 */
      function renderPlusMenu() {
        const rows = [
          { section: '添加', key: 'file', label: '文件', en: 'file', hint: '' },
          { key: 'goal', label: '目标', en: 'goal', hint: '设置或查看长期任务目标' },
          { key: 'plan', label: '计划', en: 'plan', hint: '进入或退出计划模式' },
          { section: '指令', key: 'compact', label: '压缩', en: 'compact', hint: '压缩以上对话内容' },
          { key: 'export', label: '下载日志', en: 'export', hint: '将当前会话内容导出为 ZIP' },
        ]
        return h('div', { 'data-dsh-popup': 'plus', style: styles.plusMenu },
          rows.map((row) => h('div', { key: row.key },
            row.section === undefined
              ? null
              : h('div', { style: row.section === '指令' ? { ...styles.plusSection, marginTop: 3 } : styles.plusSection }, row.section),
            h('button', {
              style: styles.plusRow,
              ...hoverBackdrop(T.hoverStrong),
              onClick: () => {
                if (row.key === 'file') { setPlusOpen(false); fileInputRef.current?.click(); return }
                if (row.key === 'goal') {
                  setPlusOpen(false)
                  setPendingCommand({ label: '/目标', prefix: '/goal ', hint: '输入目标，智能体将持续执行' })
                  setTimeout(() => inputRef.current?.focus(), 0)
                  return
                }
                if (row.key === 'plan') {
                  setPlusOpen(false)
                  setPendingCommand({ label: '/计划', prefix: '/plan ', hint: '描述你的任务以生成计划' })
                  setTimeout(() => inputRef.current?.focus(), 0)
                  return
                }
                if (row.key === 'compact') {
                  setPlusOpen(false)
                  void runCommand(activePeer, openSession, '/compact')
                  return
                }
                if (row.key === 'export') {
                  setPlusOpen(false)
                  // 与原生一致：`export` 是对端 Host 的真实命令（`command/run` / `command/done`
                  // 由对端事件流回传），ZIP 再走本机转发路由取。
                  void runCommand(activePeer, openSession, '/export')
                  downloadExport()
                }
              },
            },
            plusIcon(row.key),
            h('span', { style: styles.plusLabel }, row.label),
            h('span', { style: styles.plusEn }, row.en),
            h('span', { style: { flex: 1 } }),
            row.hint === '' ? null : h('span', { style: styles.plusHint }, row.hint),
            )),
          ),
        )
      }

      /** 模型 / 权限 chip 的 12px 折叠箭头（同原生 12px chevron，展开时旋转）。 */
      function caretIcon(open) {
        return h('svg', {
          width: 12, height: 12, viewBox: '0 0 12 12',
          style: { flex: 'none', color: 'var(--dsw-alias-label-caption, #81858C)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms ease' },
        },
        h('path', {
          d: 'M3 4.5L6 7.5L9 4.5', fill: 'none', stroke: 'currentColor',
          strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
        }))
      }

      /** 菜单图标：纸夹 / 靶 / 清单 / 圆 / 下载箭头。 */
      function plusIcon(kind) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }
        const shapes = kind === 'file'
          ? [h('path', { key: 'a', d: 'M6.4 9.6l3.8-3.8a1.9 1.9 0 0 1 2.7 2.7l-4.4 4.4a3 3 0 0 1-4.2-4.2l4-4', ...stroke })]
          : kind === 'goal'
            ? [h('circle', { key: 'a', cx: 8, cy: 8, r: 5.2, ...stroke }), h('circle', { key: 'b', cx: 8, cy: 8, r: 1.6, ...stroke })]
            : kind === 'plan'
              ? [h('rect', { key: 'a', x: 3, y: 2.6, width: 10, height: 11, rx: 1.6, ...stroke }),
                  h('path', { key: 'b', d: 'M5.6 6h4.8M5.6 8.6h4.8M5.6 11.2h3', ...stroke })]
              : kind === 'compact'
                ? [h('circle', { key: 'a', cx: 8, cy: 8, r: 5.2, ...stroke })]
                : [h('path', { key: 'a', d: 'M8 3v7m0 0l-2.6-2.6m2.6 2.6l2.6-2.6', ...stroke }),
                    h('path', { key: 'b', d: 'M4 12.4h8', ...stroke })]
        return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', style: { flex: 'none', color: 'var(--dsw-alias-menu-icon, #6f7377)' } },
          shapes)
      }

      /** 下载对端会话日志：走本机转发路由，不暴露对端令牌。 */
      function downloadExport() {
        if (openSession === null) return
        const url = `/api/remote-peers/export?id=${encodeURIComponent(activePeer)}`
          + `&sessionId=${encodeURIComponent(openSession)}&includeDescendants=true`
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `dsh-session-${openSession}.zip`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        setExportNotice({ sessionId: openSession })
      }

      /** 弹窗外壳：遮罩点击关闭，内层截住冒泡；`width` 为 null 时用默认宽度。 */
      function dialogShell(onClose, width, ...children) {
        const panel = width === null ? styles.permDialog : { ...styles.permDialog, width }
        return h('div', { style: styles.permDialogOverlay, onClick: onClose },
          h('div', { style: panel, onClick: (event) => event.stopPropagation() }, ...children))
      }

      /** 弹窗标题栏：左侧图标（可空）+ 标题 + 右侧 ×。 */
      function dialogHead(leading, title, onClose) {
        return h('div', { style: styles.permDialogHead },
          leading,
          h('span', { style: { flex: 1 } }, title),
          h('button', { style: styles.ghostButton, onClick: onClose }, '×'))
      }

      /** 导出的提示弹窗（与原生一致：标题 + 说明 + 关闭）。 */
      function renderExportNotice() {
        const close = () => setExportNotice(null)
        return dialogShell(close, 'min(380px, 100%)',
          dialogHead(null, 'Session 导出已开始下载', close),
          h('div', { style: styles.permDialogBody },
            `Session：${exportNotice.sessionId}　浏览器正在下载 Session ZIP 文件。`),
          h('div', { style: styles.permDialogFooter },
            h('button', { style: styles.darkButton, onClick: close }, '关闭')))
      }

      /** 当前模型的推理等级显示名（取 catalog 的 efforts.name）。 */
      function effortNameOf() {
        const model = currentModelOf()
        const efforts = model?.reasoning?.efforts ?? []
        const value = selection?.reasoningEffort ?? model?.reasoning?.defaultEffort
        const row = efforts.find((effort) => effort.id === value)
        return row?.name ?? (typeof value === 'string' ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '')
      }

      /** 当前选择对应的 catalog 模型项。 */
      function currentModelOf() {
        const groups = catalog?.groups ?? []
        const group = groups.find((item) => item.id === selection?.provider)
          ?? groups.find((item) => (item.models ?? []).some((model) => model.id === selection?.model))
        return group?.models?.find((model) => model.id === selection?.model)
      }

      /** 右向 chevron：12px 描边（同 IconChevronRightOutlineRegular）。 */
      function chevronRight() {
        return h('svg', { width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', style: { flex: 'none', color: 'var(--dsw-alias-menu-icon, #6f7377)' } },
          h('path', { d: 'M4.5 3L7.5 6L4.5 9', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' }))
      }

      /** 模型 / 推理等级两级菜单：根行 → 各自列表（照 ModelSelect 的两层结构）。 */
      function renderModelPicker() {
        const groups = catalog?.groups ?? []
        const model = currentModelOf()
        const efforts = model?.reasoning?.efforts ?? []
        const hoverRow = {
          ...hoverBackdrop(T.hoverStrong),
        }
        if (pickerSection === 'model') {
          return h('div', { 'data-dsh-popup': 'model', style: styles.modelMenu },
            groups.map((group) => h('div', { key: group.id },
              h('div', { style: styles.modelGroupHeading }, group.name || group.id),
              (group.models ?? []).map((row) => h('button', {
                key: `${group.id}:${row.id}`,
                style: styles.modelOption,
                disabled: modelBusy,
                title: row.description ?? row.name,
                ...hoverRow,
                onClick: () => void changeModel(activePeer, openSession, group, row),
              },
              h('span', { style: styles.modelOptionName }, row.name || row.id),
              h('span', { style: styles.modelCheck },
                selection?.provider === group.id && selection?.model === row.id ? '✓' : ''),
              )),
            )),
          )
        }
        if (pickerSection === 'effort') {
          const choices = [
            ...(model?.reasoning?.defaultEffort === undefined
              ? [{ id: 'provider-default', name: '默认', value: undefined }]
              : []),
            ...efforts.map((effort) => ({ id: effort.id, name: effort.name, value: effort.id, description: effort.description })),
          ]
          const effective = selection?.reasoningEffort ?? model?.reasoning?.defaultEffort
          return h('div', { 'data-dsh-popup': 'model', style: styles.modelMenu },
            choices.map((choice) => h('button', {
              key: choice.id,
              style: styles.modelOption,
              disabled: modelBusy,
              title: choice.description ?? '',
              ...hoverRow,
              onClick: () => void changeEffort(activePeer, openSession, choice.value),
            },
            h('span', { style: styles.modelOptionName }, choice.name),
            h('span', { style: styles.modelCheck }, effective === choice.value ? '✓' : ''),
            )),
          )
        }
        return h('div', { 'data-dsh-popup': 'model', style: styles.modelMenu },
          h('button', {
            style: styles.modelCell,
            ...hoverRow,
            onClick: () => setPickerSection('model'),
          },
          h('span', { style: styles.modelCellLabel }, '模型'),
          h('span', { style: styles.modelCellValue }, modelNameOf(catalog, selection) || '—'),
          chevronRight(),
          ),
          efforts.length === 0
            ? null
            : h('button', {
                style: styles.modelCell,
                disabled: modelBusy,
                ...hoverRow,
                onClick: () => setPickerSection('effort'),
              },
              h('span', { style: styles.modelCellLabel }, '推理等级'),
              h('span', { style: styles.modelCellValue }, effortNameOf()),
              chevronRight(),
              ),
        )
      }

      /** 底部状态行：1 轮 17 步 · 170 tok/s · 4.8M tok · 缓存命中 99.7% · 28%。 */
      /** 40px 内视为仍在尾部：隐藏回到底部按钮，新内容继续跟随。 */
      function onBodyScroll() {
        const element = bodyRef.current
        if (element === null) return
        setRailPreview(null)
        const distance = element.scrollHeight - element.scrollTop - element.clientHeight
        const following = distance < 40
        const movedUp = element.scrollTop < lastScrollTopRef.current - 2
        lastScrollTopRef.current = element.scrollTop
        // 只有用户自己往上滚/拖/按键造成的上移才算「离开尾部」；内容长高（浏览器锚定把 scrollTop 挤走）
        // 一律不算，保持跟随并补一次沉底 —— 否则每次流式结尾都会把 tail -f 弄丢。
        const byUser = draggingRef.current || Date.now() - gestureAtRef.current < 600
        if (following) {
          followRef.current = true
          setShowToBottom(false)
        } else if (movedUp && byUser) {
          followRef.current = false
          setShowToBottom(true)
        } else if (followRef.current) {
          element.scrollTop = element.scrollHeight
          lastScrollTopRef.current = element.scrollTop
          setShowToBottom(false)
          return
        } else {
          setShowToBottom(true)
        }
        setShowToBottom(!following)
        // 逼近窗口顶部就向前翻一页（原生 scroll-to-top 自动 prepend）。
        if (element.scrollTop < 120) void loadOlderHistory(activePeer, openSession)
        // 每根刻度代表一条用户消息：视口顶部以下最近的那条提问行，决定高亮哪一轮。
        const viewportTop = element.getBoundingClientRect().top + 40
        let active = null
        for (const node of element.querySelectorAll('[data-rp-turn-anchor]')) {
          if (node.getBoundingClientRect().top <= viewportTop) active = Number(node.getAttribute('data-rp-turn-anchor'))
          else break
        }
        if (active !== null && active !== railTurn) setRailTurn(active)
      }

      /** 沉底按钮：34px 圆钮、floating 底色 + panel 阴影，点击平滑回到最新。 */
      function renderToBottom() {
        return h('button', {
          type: 'button',
          style: toBottomHover ? { ...styles.toBottom, ...styles.toBottomHover } : styles.toBottom,
          'aria-label': '回到最新消息',
          title: '回到最新消息',
          onMouseEnter: () => setToBottomHover(true),
          onMouseLeave: () => setToBottomHover(false),
          onClick: () => {
            const element = bodyRef.current
            if (element === null) return
            followRef.current = true
            setShowToBottom(false)
            element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
          },
        }, toBottomGlyph())
      }




      /** 统计行三颗药丸：先取对端投影（整段持久日志），拿不到才退回窗口事件折叠。 */
      function renderStatusLine() {
        const stats = projections?.sessionStats
        const usage = projections?.tokenUsage
        const pressure = projections?.contextPressure
        const fallback = metricsOf(rawEvents)
        const turns = typeof stats?.turns === 'number' ? stats.turns : fallback.turns
        const steps = typeof stats?.steps === 'number' ? stats.steps : fallback.steps
        const speed = typeof stats?.decodeMs === 'number' && stats.decodeMs > 0
          ? speedText(stats.decodeTokens / (stats.decodeMs / 1000))
          : speedText(fallback.tokensPerSecond)
        let totalTokens = fallback.totalTokens
        let hit = cacheHitText(fallback.cacheHitRate.value, fallback.cacheHitRate.base)
        if (usage !== undefined) {
          const billedInput = Number(usage.uncachedInputTokens ?? 0)
            + Number(usage.cacheReadTokens ?? 0)
            + Number(usage.cacheWriteTokens ?? 0)
          totalTokens = billedInput + Number(usage.outputTokens ?? 0)
          hit = cacheHitText(Number(usage.cacheReadTokens ?? 0), billedInput)
        }

        let contextUsed = fallback.contextUsed
        if (pressure !== undefined) {
          const used = pressure.projectedTokens ?? pressure.pressureTokens
          contextUsed = typeof used === 'number' && typeof pressure.contextWindow === 'number'
            ? Math.min(100, Math.round((used / pressure.contextWindow) * 100))
            : 0
        }

        const counts = `${turns} 轮 ${steps} 步`
        const usageParts = [
          totalTokens > 0 ? `${formatTokens(totalTokens)} tok` : null,
          hit === null ? null : `缓存命中 ${hit}%`,
        ].filter((part) => part !== null)
        return h('div', { style: { ...styles.statusLine, maxWidth: cardWidth } },
          steps === 0
            ? null
            : h('button', {
                type: 'button',
                style: pillStyle('activity'),
                'aria-haspopup': 'dialog',
                'data-rp-anchor': '',
                'aria-expanded': statDialog !== null && statDialog.kind === 'activity',
                onClick: (event) => openStatDialog('activity', event),
                ...pillHover('activity'),
              },
                gaugeGlyph(14),
                h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } },
                  speed === null ? counts : `${counts} · ${speed}`),
              ),
          usageParts.length === 0
            ? null
            : h('button', {
                type: 'button',
                style: pillStyle('usage'),
                'aria-haspopup': 'dialog',
                'data-rp-anchor': '',
                'aria-expanded': statDialog !== null && statDialog.kind === 'usage',
                onClick: (event) => openStatDialog('usage', event),
                ...pillHover('usage'),
              },
                databaseGlyph(14),
                h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' } }, usageParts.join(' · ')),
              ),
          contextUsed > 0
            ? h('button', {
                type: 'button',
                style: pillStyle('context'),
                'aria-label': `上下文已用 ${contextUsed}%`,
                'aria-haspopup': 'dialog',
                'data-rp-anchor': '',
                'aria-expanded': statDialog !== null && statDialog.kind === 'context',
                onMouseEnter: (event) => {
                  const rect = event.currentTarget.getBoundingClientRect()
                  setTooltip({ text: `上下文已用 ${contextUsed}%`, top: rect.top - 32, centerX: rect.left + rect.width / 2 })
                },
                onMouseLeave: () => setTooltip(null),
                onClick: (event) => { setTooltip(null); openStatDialog('context', event) },
                ...pillHover('context'),
              },
                contextGlyph(contextUsed, 14),
                h('span', null, `${contextUsed}%`),
              )
            : null,
        )
      }

      /** 药丸底样式：展开时保持高亮（原生 `button.pill[aria-expanded='true']`）。 */
      function pillStyle(kind) {
        const open = statDialog !== null && statDialog.kind === kind
        return open ? { ...styles.statusPill, ...styles.statusPillOpen } : styles.statusPill
      }

      /** 药丸 hover：换 `interactive-bg-hover` 与二级文字色。 */
      function pillHover(kind) {
        return {
          onMouseEnter: (event) => {
            if (statDialog !== null && statDialog.kind === kind) return
            event.currentTarget.style.background = T.hoverStrong
            event.currentTarget.style.color = T.sec
          },
          onMouseLeave: (event) => {
            if (statDialog !== null && statDialog.kind === kind) return
            event.currentTarget.style.background = 'transparent'
            event.currentTarget.style.color = T.ter
          },
        }
      }

      /** 打开统计浮层：锚在药丸上方 8px、左缘跟随药丸并 clamp 在窗口内。同一时刻只留一个浮层（另一个先关）。 */
      function openStatDialog(kind, event) {
        event.stopPropagation()
        setUsageDialog(null)
        const rect = event.currentTarget.getBoundingClientRect()
        setStatDialog((current) => (current !== null && current.kind === kind
          ? null
          : {
              kind,
              bottom: Math.max(12, window.innerHeight - rect.top + 8),
              left: Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - 452)),
            }))
      }

      /** 底部三类浮层：会话统计 / Token 用量（stat-dialog 皮肤）、上下文已用（ContextMeter 皮肤）。 */
      function renderStatDialog() {
        const kind = statDialog.kind
        if (kind === 'context') return renderContextPanel()
        const stats = projections?.sessionStats
        const usage = projections?.tokenUsage
        const rows = []
        if (kind === 'activity') {
          const speed = typeof stats?.decodeMs === 'number' && stats.decodeMs > 0
            ? speedText(stats.decodeTokens / (stats.decodeMs / 1000))
            : null
          if (Number(stats?.llmMs) > 0) rows.push(['模型用时', formatDurationCompact(stats.llmMs)])
          if (Number(stats?.toolMs) > 0) rows.push(['工具调用用时', formatDurationCompact(stats.toolMs)])
          if (Number(stats?.ttftSteps) > 0) rows.push(['首 token 平均（TTFT）', formatDurationCompact(stats.ttftMs / stats.ttftSteps)])
          if (speed !== null) rows.push(['输出速度（TPS）', speed])
        } else {
          const billedInput = Number(usage?.uncachedInputTokens ?? 0)
            + Number(usage?.cacheReadTokens ?? 0)
            + Number(usage?.cacheWriteTokens ?? 0)
          const hit = cacheHitText(Number(usage?.cacheReadTokens ?? 0), billedInput, 1)
          const write = Number(usage?.cacheWriteTokens ?? 0)
          if (hit !== null) rows.push(['缓存命中', `${hit}%`])
          rows.push(['未缓存输入', `${formatExactTokens(Number(usage?.uncachedInputTokens ?? 0))} tok`])
          rows.push(['缓存读取', `${formatExactTokens(Number(usage?.cacheReadTokens ?? 0))} tok`])
          if (write !== 0) rows.push(['缓存写入', `${formatExactTokens(write)} tok`])
          rows.push(['输出', `${formatExactTokens(Number(usage?.outputTokens ?? 0))} tok`])
        }
        const title = kind === 'activity' ? '会话统计' : 'Token 用量'
        const value = kind === 'activity'
          ? `${Number(stats?.turns ?? 0)} 轮 ${Number(stats?.steps ?? 0)} 步`
          : `${formatExactTokens((Number(usage?.uncachedInputTokens ?? 0) + Number(usage?.cacheReadTokens ?? 0)
            + Number(usage?.cacheWriteTokens ?? 0)) + Number(usage?.outputTokens ?? 0))} tok`
        return h('div', {
          style: { ...styles.usageDialog, bottom: statDialog.bottom, left: statDialog.left },
          role: 'dialog',
          'aria-label': title,
          'data-dsh-popup': '',
          onClick: (event) => event.stopPropagation(),
        },
        h('div', { style: styles.usageDialogTitle },
          h('span', { style: styles.usageDialogTitleLabel }, kind === 'activity' ? gaugeGlyph(14) : databaseGlyph(14), h('span', null, title)),
          h('span', { style: { fontVariantNumeric: 'tabular-nums' } }, value),
        ),
        h('div', { style: styles.usageDialogRule, 'aria-hidden': '' }),
        h('dl', { style: styles.usageDialogDetails },
          rows.flatMap(([label, text]) => [
            h('dt', { key: `dt-${label}`, style: styles.usageDialogDt }, label),
            h('dd', { key: `dd-${label}`, style: styles.usageDialogDd }, text),
          ]),
        ),
        )
      }

      /** 上下文占用面板：ContextMeter `.panel` —— 264px、12px 内边距、4px 分段条 + 三段图例。 */
      function renderContextPanel() {
        const pressure = projections?.contextPressure
        const breakdown = projections?.contextBreakdown
        const used = pressure?.projectedTokens ?? pressure?.pressureTokens
        const window = pressure?.contextWindow
        const percent = typeof used === 'number' && typeof window === 'number'
          ? Math.min(100, Math.round((used / window) * 100))
          : 0
        const parts = [
          ['系统提示词', Number(breakdown?.systemTokens ?? 0), 'var(--dsw-alias-chart-system, #8b93a5)'],
          ['工具定义', Number(breakdown?.toolsTokens ?? 0), 'var(--dsw-alias-chart-tools, #9b8cf5)'],
          ['对话消息', Number(breakdown?.messageTokens ?? 0), 'var(--dsw-alias-chart-messages, #3f7cfd)'],
        ]
        const total = parts.reduce((sum, part) => sum + part[1], 0)
        const segments = total > 0
          ? parts.map(([label, value, color]) => ({ key: label, color, width: percent * value / total }))
          : [{ key: 'total', color: T.ter, width: percent }]
        return h('div', {
          style: { ...styles.contextPanel, bottom: statDialog.bottom, left: statDialog.left },
          role: 'dialog',
          'aria-label': '上下文已用',
          'data-dsh-popup': '',
          onClick: (event) => event.stopPropagation(),
        },
        h('div', { style: styles.contextHeader },
          h('span', { style: styles.contextHeadline }, '上下文已用'),
          h('span', { style: styles.contextPercent }, `${percent}%`),
          h('span', { style: styles.contextFigures },
            `~${formatTokens(Number(used ?? 0))} / ${formatTokens(Number(window ?? 0))}`),
        ),
        h('div', { style: styles.contextBar },
          segments.filter((segment) => segment.width > 0).map((segment) => h('div', {
            key: segment.key,
            style: { flex: 'none', minWidth: 2, height: '100%', borderRadius: 1, background: segment.color, width: `${segment.width}%` },
          })),
        ),
        h('div', { style: styles.contextRows },
          parts.map(([label, value, color]) => h('div', { key: `ctx-${label}`, style: styles.contextRow },
            h('span', { style: styles.contextRowLabel },
              h('span', { style: { ...styles.contextSwatch, background: color } }),
              label),
            h('span', { style: styles.contextRowValue }, `~${formatTokens(value)}`),
          )),
        )
        )
      }



      /** 弹窗警示图标：18px 三角描边（对齐 Modal 的 IconWarningOutlineRegular）。 */
      function warningIcon(size) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', style: { display: 'block' } },
          h('path', {
            d: 'M8 2.4l6 10.9H2z', stroke: 'currentColor', strokeWidth: 1.2, strokeLinejoin: 'round',
          }),
          h('path', { d: 'M8 6.4v3', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
          h('circle', { cx: 8, cy: 11.3, r: 0.65, fill: 'currentColor' }),
        )
      }

      /** 权限档图标：逐路径照搬 ui-primitives/PermissionIcon.tsx（strokeWidth=1，默认 16px）。 */
      function permissionIcon(value, size = 16) {
        const shield = 'M6.59624 2.14853C7.50155 1.80917 8.49914 1.80919 9.40444 2.14859L13.9245 3.84317V7.11961C13.9245 11.6089 10.5565 13.5975 8.00035 14.5779C5.44423 13.5975 2.07544 11.6089 2.07544 7.11961V3.84317L6.59624 2.14853Z'
        const shapes = value === 'read-only'
          ? [
              h('path', { key: 'check', d: 'M5.08545 8.13775L7.18455 10.2368C7.26636 10.3187 7.4003 10.3142 7.47649 10.2271L11.5148 5.61194', stroke: 'currentColor' }),
              h('path', { key: 'shield', d: shield, stroke: 'currentColor', strokeLinejoin: 'round' }),
            ]
          : value === 'workspace-write'
            ? [
                h('path', {
                  key: 'body',
                  d: 'M6.4209 1.68067C7.43922 1.299 8.56177 1.29898 9.58008 1.68067L14.0996 3.375C14.2946 3.44811 14.4236 3.63455 14.4238 3.84278V6.89063C14.1115 6.71853 13.7761 6.58312 13.4238 6.48926V4.18946L9.22852 2.61621C8.43657 2.31947 7.56341 2.31939 6.77148 2.61621L2.5752 4.18946V7.11914C2.5752 11.1796 5.52369 13.056 8 14.0391C8.27653 13.9293 8.55827 13.8067 8.8418 13.6729C9.07101 13.9468 9.33228 14.1929 9.62012 14.4053C9.12409 14.6579 8.63578 14.8696 8.17871 15.0449C8.0637 15.0889 7.93628 15.0889 7.82129 15.0449C5.22011 14.0472 1.5752 11.9381 1.5752 7.11914V3.84278C1.57541 3.63469 1.70463 3.44821 1.89941 3.375L6.4209 1.68067Z',
                  fill: 'currentColor',
                }),
                h('path', { key: 'line1', d: 'M5.26392 6.60339H10.7361', stroke: 'currentColor' }),
                h('path', { key: 'line2', d: 'M5.26392 9.86902H8.32833', stroke: 'currentColor' }),
                h('path', { key: 'pen', d: 'M10.0317 13.2229C10.263 13.3929 10.4943 13.563 10.7256 13.733C10.7932 13.6482 10.8608 13.5634 10.9284 13.4786C12.1455 11.9522 13.3626 10.4258 14.5798 8.89935C14.6474 8.81455 14.715 8.72975 14.7826 8.64495C14.4143 8.37419 14.046 8.10344 13.6777 7.83268C13.6169 7.92252 13.5562 8.01236 13.4954 8.10219C12.4016 9.71926 11.3078 11.3363 10.214 12.9534C10.1532 13.0432 10.0924 13.1331 10.0317 13.2229Z', fill: 'currentColor' }),
                h('path', { key: 'cursor', d: 'M12.6516 12.6696C12.6516 12.925 12.6516 13.1804 12.6516 13.4359C12.6952 13.4378 12.7387 13.4398 12.7823 13.4417C13.5663 13.4768 14.3504 13.5118 15.1345 13.5469C15.178 13.5488 15.2216 13.5508 15.2651 13.5527C15.2651 13.2194 15.2651 12.8861 15.2651 12.5527C15.2216 12.5547 15.178 12.5566 15.1345 12.5586C14.3504 12.5936 13.5663 12.6287 12.7823 12.6637C12.7387 12.6657 12.6952 12.6676 12.6516 12.6696Z', fill: 'currentColor' }),
              ]
            : value === 'auto'
              ? [
                  h('path', { key: 'shield', d: shield, stroke: 'currentColor', strokeLinejoin: 'round' }),
                  h('path', { key: 'a', d: 'M5.75 10.15L8 4.95L10.25 10.15M6.43 8.59H9.57', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' }),
                ]
              : [
                  h('path', { key: 'shield', d: shield, stroke: 'currentColor', strokeLinejoin: 'round' }),
                  h('path', { key: 'stick', d: 'M8 4.39209V9.89209', stroke: 'currentColor' }),
                  h('path', { key: 'dot', d: 'M8 10.8081V11.8081', stroke: 'currentColor' }),
                ]
        return h('svg', {
          width: size, height: size, viewBox: '0 0 16 16', fill: 'none',
          strokeWidth: 1, style: { flex: 'none', display: 'block' },
        }, shapes)
      }

      /** 权限下拉：三档一列，选中项右侧打勾；完全权限走独立的风险确认弹窗。 */
      function renderPermissionMenu() {
        /** 当前生效的档：会话没写过 preset 时用目录默认档（chip 显示的就是它）。 */
        const currentPreset = permissionPreset ?? permissionDefault
        const values = permissionOptions.length === 0
          ? ['read-only', 'workspace-write', 'danger-full-access']
          : permissionOptions.map((option) => option.value)
        return h('div', { 'data-dsh-popup': 'permission', style: styles.permissionMenu },
          values.map((value) => h('button', {
            key: value,
            style: styles.permissionRow,
            ...hoverBackdrop(T.hoverStrong),
            disabled: permissionBusy,
            onClick: () => {
              if (value === currentPreset) { setPermissionOpen(false); return }
              if (value === 'danger-full-access') {
                setPermissionOpen(false)
                setPermissionRiskAck(false)
                setPermissionPending(value)
                return
              }
              void changePermission(activePeer, openSession, value)
            },
          },
          permissionIcon(value, 16),
          h('span', { style: { flex: 1 } }, permissionLabel(value) ?? value),
          value === currentPreset ? h('span', { style: styles.permissionCheck }, '✓') : null,
          )),
        )
      }

      /** 完全权限的风险确认弹窗：对齐原生（标题 + 说明 + 勾选 + 取消/确认）。 */
      function renderPermissionDialog() {
        if (permissionPending === null) return null
        const close = () => setPermissionPending(null)
        return dialogShell(close, null,
          h('div', { style: styles.permDialogContent },
            dialogHead(h('span', { style: styles.permWarn }, warningIcon(18)), '确认启用完全权限？', close),
            h('div', { style: styles.permDialogBody },
              h('p', { style: { margin: 0 } },
                '启用完全权限后，智能体将减少确认步骤，并且可以直接执行更多操作，包括敏感操作、文件修改或外部命令。仅建议在你信任当前任务时使用。'),
              h('label', { style: styles.riskRow },
                h('input', {
                  type: 'checkbox',
                  checked: permissionRiskAck,
                  onChange: (event) => setPermissionRiskAck(event.target.checked),
                  style: { flex: '0 0 auto', width: 14, height: 14, margin: '3px 0 0', accentColor: 'var(--dsw-alias-brand-primary, #3964FE)', cursor: 'pointer' },
                }),
                h('span', null, '我已了解风险，并愿意继续'),
              ),
            ),
          ),
          h('div', { style: styles.permDialogFooter },
            h('button', { style: styles.permCancel, onClick: close }, '取消'),
            h('button', {
              style: permissionRiskAck && !permissionBusy ? styles.permConfirm : { ...styles.permConfirm, ...styles.permConfirmDisabled },
              disabled: !permissionRiskAck || permissionBusy,
              onClick: () => void changePermission(activePeer, openSession, permissionPending),
            }, permissionBusy ? '启用中…' : '启用完全权限'),
          ))
      }

    }

    function field(label, value, onChange, options = {}) {
      const invalid = options.invalid === true
      return h('label', { style: { display: 'flex', flexDirection: 'column', gap: 4, flex: options.width === '100%' ? 1 : 'none', minWidth: 0 } },
        h('span', { style: styles.muted },
          label,
          options.required === true
            ? h('span', { style: styles.fieldRequired }, '*')
            : null),
        h('input', {
          style: {
            ...styles.input,
            width: options.width === '100%' ? '100%' : options.width,
            fontFamily: options.mono ? styles.mono.fontFamily : undefined,
            ...(invalid ? styles.inputInvalid : null),
          },
          value: value ?? '',
          placeholder: options.placeholder ?? '',
          'aria-required': options.required === true ? 'true' : undefined,
          onChange: (event) => onChange(event.target.value),
        }),
      )
    }

    /** 写剪贴板：优先 `navigator.clipboard`，不可用时退到临时 textarea + `execCommand`。 */
    async function copyText(value) {
      try {
        await navigator.clipboard.writeText(value)
      } catch {
        const area = document.createElement('textarea')
        area.value = value
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.append(area)
        area.select()
        document.execCommand('copy')
        area.remove()
      }
    }

    /**
     * 把粘进来的整串 `host:port` 拆开：`192.168.130.24:62907`、`http://host:port/`、     * `host port` 都按地址 + 端口拆；拆不出来就返回 null，交给调用方原样当地址。
     */
    function splitHostPort(text) {
      const raw = String(text ?? '').trim().replace(/^[a-z][a-z0-9+.-]*:\/\//iu, '')
      if (raw === '') return null
      const match = /^(?:\[([^\]]+)\]|([^/\s:]+))[:：]\s*(\d{1,5})(?:[/?#]\S*)?$/u.exec(raw)
        ?? /^(?:\[([^\]]+)\]|([^/\s:]+))\s+(\d{1,5})$/u.exec(raw)
      if (match === null) return null
      const host = match[1] ?? match[2]
      const port = String(Number(match[3]))
      if (Number(port) < 1 || Number(port) > 65535) return null
      return { host, port }
    }

    /** 会话标题：原生 Rows.tsx 的 displayTitle —— blank 显示「新会话」，否则标题或「未命名」。 */
    function sessionTitle(session) {
      if (session?.blank === true) return '新会话'
      const title = session?.projections?.values?.title
      return typeof title === 'string' && title !== '' ? title : '未命名'
    }

    /** 把一条 forwarded waterfall 归一成可展示、可回传的条目。 */
    function describeWaterfall(frame) {
      const request = frame?.request ?? {}
      const sessionId = typeof request.sessionId === 'string' ? request.sessionId : ''
      if (frame.event === 'approval/request') {
        return {
          kind: 'approval',
          eventId: frame.eventId,
          toolName: typeof request.toolName === 'string' ? request.toolName : '工具调用',
          detail: readableReason(request.displayReason ?? request.reason),
          sessionId,
        }
      }
      if (frame.event === 'user-questions/request') {
        const questions = Array.isArray(request.questions) ? request.questions : []
        const first = questions[0]
        return {
          kind: 'question',
          eventId: frame.eventId,
          toolName: '提问',
          detail: typeof first?.question === 'string' ? first.question : JSON.stringify(first ?? request).slice(0, 200),
          sessionId,
        }
      }
      return undefined
    }

    /** 异常转可读文案（取 message，非 Error 时原样转字符串）。 */
    function errorText(failure) {
      return String(failure?.message ?? failure)
    }

    /** 原生 `isImageMediaType` 认的四种图片类型：只有它们才走缩略图草稿。 */
    const IMAGE_MEDIA_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

    /**
     * 剪贴板里的文件，按剪贴板顺序（原生 `clipboardFiles` 的同一取法）。被条目 API 报成目录的成员
     * 直接丢掉 —— 网关只传单个文件，文件夹没有落点。
     * @param transfer - 一次粘贴事件的 clipboardData
     * @returns 能当附件粘贴的 File 列表
     */
    function clipboardFilesOf(transfer) {
      if (transfer === null || transfer === undefined) return []
      const files = []
      for (const item of transfer.items ?? []) {
        if (item.kind !== 'file') continue
        const file = typeof item.getAsFile === 'function' ? item.getAsFile() : null
        if (file === null) continue
        const entryOf = typeof item.webkitGetAsEntry === 'function'
          ? () => item.webkitGetAsEntry()
          : typeof item.getAsEntry === 'function' ? () => item.getAsEntry() : null
        if (entryOf !== null && entryOf()?.isDirectory === true) continue
        files.push(file)
      }
      return files
    }

    /** RPC 信封校验：对端说 ok 才算成功，否则按对端文案抛错；返回值用 `.value` 取。 */
    function envelopeOf(result, fallback) {
      const envelope = result?.result
      if (envelope?.ok !== true) {
        const code = envelope?.error?.code
        throw new Error(envelope?.error?.message ?? (code === undefined ? fallback : `${fallback}（${code}）`))
      }
      return envelope
    }

    /** 审批原因可能是本地化文本对象，取可读的一段。 */
    function readableReason(value) {
      if (value === undefined || value === null) return ''
      if (typeof value === 'string') return value
      if (typeof value === 'object' && typeof value.text === 'string') return value.text
      return JSON.stringify(value).slice(0, 200)
    }

    /** 从消息内容里挑出图片/文件附件，用于只读展示（跨端传输本期不做）。 */
    function attachmentsOf(content) {
      if (!Array.isArray(content)) return []
      const out = []
      for (const part of content) {
        const type = part?.type
        if (type !== 'image' && type !== 'file' && type !== 'attachment' && type !== 'document') continue
        const path = typeof part.path === 'string' ? part.path : ''
        // 图片/文件块的权威来源是 `part.attachment`（`ImageAttachmentRef`/`FileAttachmentRef`）：
        // 它带着名字、字节数、宽高，图片还能按 id 走 `session/attachment` 取字节。
        const ref = part.attachment !== null && typeof part.attachment === 'object' ? part.attachment : undefined
        const name = ref?.name ?? part.name ?? part.filename ?? part.fileName
          ?? (path === '' ? (type === 'image' ? '图片' : '文件') : path.split(/[\\/]/).pop())
        out.push({
          kind: type === 'image' ? 'image' : 'file',
          name: String(name),
          path,
          attachment: ref,
          bytes: typeof ref?.bytes === 'number' ? ref.bytes : undefined,
          meta: typeof part.caption === 'string' ? part.caption
            : typeof part.title === 'string' ? part.title
              : typeof part.mimeType === 'string' ? part.mimeType
                : '',
        })
      }
      return out
    }

    /** 从一条 Session 事件抽出可读文本：用户输入或助手回复。 */
    /** 队列插入项 → 待发提问；工具通知、审批策略变更这些 `next-step` 通知不算。 */
    function pendingPromptsOf(inserted) {
      const out = []
      for (const entry of inserted ?? []) {
        if (entry?.source?.kind !== 'user') continue
        const text = textOf(entry?.content)
        const files = attachmentsOf(entry?.content)
        if (text === '' && files.length === 0) continue
        out.push({ role: 'user', text, files, pending: true })
      }
      return out
    }

    /** 斜杠命令 id → 名字：command/run 记下，command/done 用来补名字。 */
    const commandNames = new Map()
    function messageOf(event) {
      // 正常提问落的是 `user/message`（`data.content` + `source.kind==='user'`）。
      // `agent/inbox/spliced` 不在这里出正文：它是队列插入/撤回，属于「待发」状态，
      // 由 `pendingPromptsOf()` 单独收（混进来会让同一条提问出现两次且轮次错位）。
      if (event?.type === 'user/message') {
        const content = event.data?.content
        const text = textOf(content)
        const files = attachmentsOf(content)
        if (event.data?.source?.kind === 'user' && (text !== '' || files.length > 0)) {
          return { role: 'user', text, files, seq: event.seq, time: event.time }
        }
      }
      if (event?.type === 'assistant/message') {
        const content = event.data?.message?.content
        const text = textOf(content)
        const files = attachmentsOf(content)
        if (text !== '' || files.length > 0) {
          return { role: 'assistant', text, files, seq: event.seq, time: event.time, turn: event.data?.turn }
        }
      }
      // 斜杠命令：run 先落一行「执行中」，done 落最终结果（图 5 的两行就是这两条）。
      // `/permission` 例外 —— 权限变化原生只体现在左下角 chip 上，不占正文一行。
      if (event?.type === 'command/run') {
        const name = typeof event.data?.name === 'string' ? event.data.name : 'command'
        if (typeof event.data?.commandId === 'string') commandNames.set(event.data.commandId, name)
        if (name === 'permission') return undefined
        return { role: 'command', name, text: '正在执行…', seq: event.seq }
      }
      if (event?.type === 'command/done') {
        const name = commandNames.get(event.data?.commandId) ?? 'command'
        if (name === 'permission') return undefined
        return {
          role: 'command',
          name,
          text: typeof event.data?.text === 'string' ? event.data.text : '',
          kind: event.data?.kind,
          seq: event.seq,
        }
      }
      return undefined
    }

    /** 事件页 → 可读消息列表；`present` 卡片落在它所属 turn 的末尾，`turn-process` 落在该轮第一条助手消息之前。 */
    function collectMessages(records) {
      const messages = []
      const presents = new Map()
      const changes = new Map()
      const starts = new Map()
      const ends = new Map()
      const queued = []
      let currentTurn = null
      for (const record of records) {
        if (record?.type !== 'event') continue
        const event = record.event
        if (event?.type === 'turn/start') {
          starts.set(event.data?.turn, event.time)
          currentTurn = event.data?.turn
          continue
        }
        if (event?.type === 'turn/end') {
          ends.set(event.data?.turn, { time: event.time, reason: event.data?.reason?.kind })
          continue
        }
        if (event?.type === 'workspace/changes') {
          changes.set(event.data?.turn, event.seq)
          continue
        }
        // 排队中的提问：`inserted` 入队、`removedCount` 表示被消费后撤回。它们没有轮次，
        // 只在窗口末尾作为「待发」露出来；真正提交的那条会以 `user/message` 再出现一次。
        if (event?.type === 'agent/inbox/spliced') {
          const removed = typeof event.data?.removedCount === 'number' ? event.data.removedCount : 0
          if (removed > 0) queued.splice(0, removed)
          queued.push(...pendingPromptsOf(event.data?.inserted))
          continue
        }
        const files = presentOf(event)
        if (files !== undefined) {
          presents.set(event.data?.turn, { files, seq: event.seq })
          continue
        }
        const item = messageOf(event)
        if (item !== undefined) {
          if (item.role === 'user' && typeof item.turn !== 'number') item.turn = currentTurn
          messages.push(item)
        }
      }
      messages.push(...queued)
      // 卡片挂到该轮最后一条助手消息上：正文 → 卡片 → 动作行（原生 turn-tail 顺序）。
      const tailAssistant = new Map()
      messages.forEach((item, at) => {
        if (item.role === 'assistant' && typeof item.turn === 'number') tailAssistant.set(item.turn, at)
      })
      const out = []
      const inserted = new Set()
      let lastUserText = null
      for (const [at, item] of messages.entries()) {
        // 同一条提问偶尔会以两条事件相邻出现（重放/插入残留），相邻重复只留一条。
        if (item.role === 'user') {
          const text = String(item.text ?? '').trim()
          if (text !== '' && text === lastUserText) continue
          lastUserText = text === '' ? null : text
        } else {
          lastUserText = null
        }
        if (item.role === 'assistant' && typeof item.turn === 'number' && !inserted.has(item.turn)) {
          inserted.add(item.turn)
          const end = ends.get(item.turn)
          if (end !== undefined) out.push(turnProcessItem(item.turn, starts.get(item.turn), end))
        }
        const cards = tailAssistant.get(item.turn) === at ? presents.get(item.turn) : undefined
        const changeSeq = tailAssistant.get(item.turn) === at ? changes.get(item.turn) : undefined
        out.push({
          ...item,
          ...cards === undefined ? {} : { cards: cards.files, cardsSeq: cards.seq },
          ...changeSeq === undefined ? {} : { changeSeq, changeTurn: item.turn },
        })
      }
      return out
    }

    /** 一轮结束的完成行：「已完成，用时 6 秒」；中止/失败换成对应文案。 */
    function turnProcessItem(turn, startMs, end) {
      const elapsedMs = typeof startMs === 'number' && typeof end?.time === 'number'
        ? Math.max(1000, end.time - startMs)
        : undefined
      return { role: 'turnProcess', turn, elapsedMs, reason: end?.reason }
    }

    /**
     * 交付文件清单的权威来源是 `deliverables/presented` 事件（`{turn, callId, files}`），
     * 由 Host 在 `present` 调用结算时写入；工具调用参数只作为旧日志的兜底。
     */
    function presentOf(event) {
      if (event?.type === 'deliverables/presented') {
        const files = Array.isArray(event.data?.files) ? event.data.files : []
        const cleaned = files
          .filter((file) => typeof file?.path === 'string' && file.path.trim() !== '')
          .map((file) => ({ path: file.path, description: typeof file.description === 'string' ? file.description : '' }))
        // 同一轮同一路径只保留最后一次声明（原生 `presentedForClosing` 按 path 覆盖）。
        if (cleaned.length === 0) return undefined
        const unique = new Map()
        for (const file of cleaned) unique.set(file.path, file)
        return [...unique.values()]
      }
      if (event?.type !== 'tool/call' || event.data?.name !== 'present') return undefined
      let args
      try {
        args = JSON.parse(event.data.arguments ?? '')
      } catch {
        return undefined
      }
      const files = Array.isArray(args?.files) ? args.files : []
      const cleaned = files
        .filter((file) => typeof file?.path === 'string' && file.path !== '')
        .map((file) => ({ path: file.path, description: typeof file.description === 'string' ? file.description : '' }))
      return cleaned.length === 0 ? undefined : cleaned
    }

    /** 对端绝对路径 → 本机转发 URL；路径只作为查询参数，不做任何本地映射。 */
    /** 本机网关的 SSE 入口：`endpoint` 是斜杠形态的方法名，`payload` 是 RPC 的 args 包。 */
    function streamUrlOf(peerId, endpoint, payload) {
      return `/api/remote-peers/stream?id=${encodeURIComponent(peerId)}`
        + `&endpoint=${encodeURIComponent(endpoint)}`
        + `&payload=${encodeURIComponent(JSON.stringify(payload ?? { args: {} }))}`
    }
    function remoteFileUrl(peerId, path, extra) {
      const params = new URLSearchParams()
      params.set('id', peerId)
      params.set('path', path)
      for (const [key, value] of Object.entries(extra ?? {})) params.set(key, String(value))
      return `/api/remote-peers/file?${params.toString()}`
    }

    function isAbsPath(value) {
      return typeof value === 'string' && (/^[A-Za-z]:[\\/]/.test(value) || value.startsWith('/'))
    }


    function baseNameOf(value) {
      const clean = String(value ?? '')
      const at = Math.max(clean.lastIndexOf('/'), clean.lastIndexOf('\\'))
      return at === -1 ? clean : clean.slice(at + 1)
    }

    /** 预览标题：原生会把 `.md` 去掉扩展名时只截断标题，路径行仍保留全路径。 */
    function dirNameOf(value) {
      const clean = String(value ?? '')
      const at = Math.max(clean.lastIndexOf('/'), clean.lastIndexOf('\\'))
      return at <= 0 ? clean : clean.slice(0, at)
    }

    function joinPathOf(base, relative) {
      if (isAbsPath(relative)) return relative
      const separator = base.includes('\\') ? '\\' : '/'
      return `${base.replace(/[\\/]$/u, '')}${separator}${relative}`
    }



    /** 消息时钟：与原生死齐 —— 当天只给 `HH:mm`，隔天补 `M月D日`，跨年再补年份。 */
    function formatClock(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return ''
      const date = new Date(value)
      const now = new Date()
      const pad = (number) => String(number).padStart(2, '0')
      const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}`
      const sameDay = date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate()
      if (sameDay) return clock
      const ymd = date.getFullYear() === now.getFullYear()
        ? `${date.getMonth() + 1}月${date.getDate()}日`
        : `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
      return `${ymd} ${clock}`
    }

    /** 轮耗时：45.2s 级只到秒，越过一分钟给「X 分 Y 秒」。 */
    function formatRunDuration(ms) {
      const seconds = Math.round(ms / 1000)
      if (seconds < 60) return `${Math.max(1, seconds)} 秒`
      return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`
    }

    /** assistant 实时分片：只取文本，兼容 text / chunks / delta 三种包装。 */
    /** 思考正文的展示文本：`<signature>` 起始块整段剥掉（原生 `reasoningText`）。 */
    function reasoningDisplayText(text) {
      if (typeof text !== 'string') return ''
      if (text[0] !== '<') return text
      const opening = '<signature>'
      if (opening.startsWith(text)) return ''
      if (!text.startsWith(opening)) return text
      const closing = '</signature>'
      const end = text.indexOf(closing, opening.length)
      if (end === -1) return ''
      let start = end + closing.length
      while (start < text.length) {
        if (text[start] === '\n') start += 1
        else if (text[start] === '\r' && text[start + 1] === '\n') start += 2
        else break
      }
      return text.slice(start)
    }

    /** 折叠摘要（结束态）：第一行。 */
    function firstLineOfText(text) {
      const newline = text.indexOf('\n')
      return newline === -1 ? text : text.slice(0, newline)
    }

    /** 折叠摘要（流式中）：最近一个「已写完段落」的首行（原生 `latestCompletedParagraphFirstLine`）。 */
    function latestParagraphFirstLine(text) {
      let summary = ''
      let paragraphStart = 0
      const separator = /\r?\n(?:[\t ]*\r?\n)+/gu
      while (true) {
        const nextParagraph = separator.exec(text)
        const paragraphEnd = nextParagraph === null ? text.length : nextParagraph.index + nextParagraph[0].indexOf('\n')
        const newline = text.indexOf('\n', paragraphStart)
        if (newline !== -1 && newline <= paragraphEnd) {
          const candidate = text.slice(paragraphStart, newline).trim()
          if (candidate !== '') summary = candidate
        }
        if (nextParagraph === null) return summary
        paragraphStart = nextParagraph.index + nextParagraph[0].length
      }
    }

    /**
     * 流式 chunk 里的正文。思考（reasoning）的增量必须丢掉：原生只把思考放进
     * 「已完成」明细的首行摘要，正文区只流回答文本，否则思考会先刷满正文再被清掉。
     */
    function chunkText(chunk) {
      if (typeof chunk === 'string') return chunk
      if (chunk === null || typeof chunk !== 'object') return ''
      const kind = typeof chunk.type === 'string' ? chunk.type : ''
      // 只让正文增量进流式区：`reasoning-delta`（思考）与 `tool-call-delta`（参数片段）
      // 都带 text 字段，但原生正文区不显示它们。
      if (kind !== '' && /reasoning|thinking|thought|tool/u.test(kind)) return ''
      if (typeof chunk.text === 'string') return chunk.text
      if (typeof chunk.delta === 'string') return chunk.delta
      if (Array.isArray(chunk.chunks)) {
        return chunk.chunks.map((item) => (typeof item === 'string' ? item : (item?.text ?? ''))).join('')
      }
      if (Array.isArray(chunk.content)) {
        return chunk.content.filter((part) => part?.type === 'text' && typeof part.text === 'string').map((part) => part.text).join('')
      }
      return ''
    }

    function textOf(content) {
      if (!Array.isArray(content)) return ''
      return content
        .filter((part) => part?.type === 'text' && typeof part.text === 'string')
        .map((part) => part.text)
        .join('')
    }

    /** 侧栏图标：两端口互通示意。 */
    function RemotePeersIcon(props) {
      const size = props?.size ?? 20
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, opacity: props?.active === false ? 0.7 : 1 },
        h('path', { d: 'M4 8h6v8H4z M14 8h6v8h-6z' }),
        h('path', { d: 'M10 12h4' }),
      )
    }

    /** Client 插件入口：管理面板 + 每个他端一条左栏入口。 */
    function apply(ctx) {
      ensureScrollSkin()
      const api = {
        async call(endpoint, payload) {
          const connection = ctx.get('connection')
          if (connection === undefined) throw new Error('连接尚未就绪，请稍后重试')
          const result = await connection.rpc.call('/remote-peers', endpoint, payload ?? {})
          if (result === undefined || result.ok !== true) {
            throw new Error(result?.error?.message ?? `调用 ${endpoint} 失败`)
          }
          return result.value
        },
      }

      /** 渲染器里的未捕获异常也落一份 diag.log：面板空白时才有据可查（热更新会重复 apply，装一次即可）。 */
      if (globalThis.addEventListener !== undefined && globalThis.__rpErrorHook !== true) {
        globalThis.__rpErrorHook = true
        globalThis.addEventListener('error', (event) => reportClientFailure(api, `window-error ${String(event?.message ?? '')}`, event?.error ?? event?.message))
        globalThis.addEventListener('unhandledrejection', (event) => reportClientFailure(api, 'unhandledrejection', event?.reason))
      }

      /** 已注册的左栏入口：peerId → { panel 释放器, main 释放器, holder }。 */
      const entries = new Map()
      let latestPeers = []
      let slotsReady = false

      /** 左栏行的显示名：用户填的名字优先，否则 host:port。 */
      const peerLabelOf = (peer) => (peer?.name ? String(peer.name) : `${peer?.host ?? ''}:${peer?.port ?? ''}`)

      /** 注册一条他端的左栏行，order 与「远程端」同一块。 */
      const registerPeerRow = (key, order, holder) => ctx.slots.register({
        name: 'sidebar.panellist',
        id: key,
        // 与「远程端」同属一块，排在该槽位最后（见 PANEL_ORDER_BASE）。
        order,
        label: () => peerLabelOf(holder.current),
      }, RemotePeersIcon)

      /** 以当前他端清单为准，增删左栏入口；改名时换一行注册（原生只在槽位变化时重读 label）。 */
      const syncPeers = (peers) => {
        latestPeers = Array.isArray(peers) ? peers : []
        if (!slotsReady) return
        const ids = new Set(latestPeers.map((peer) => peer.id))
        for (const [id, entry] of [...entries]) {
          if (ids.has(id)) continue
          try { entry.panel() } catch { /* 释放失败不影响其他入口 */ }
          try { entry.main() } catch { /* 同上 */ }
          entries.delete(id)
        }
        latestPeers.forEach((peer, index) => {
          const key = `${PANEL_ID}:${peer.id}`
          const order = PANEL_ORDER_BASE + 1 + index
          const existing = entries.get(peer.id)
          if (existing !== undefined) {
            const renamed = peerLabelOf(existing.holder.current) !== peerLabelOf(peer)
            existing.holder.current = peer
            if (!renamed) return
            try { existing.panel() } catch { /* 旧行已释放 */ }
            existing.panel = registerPeerRow(key, order, existing.holder)
            return
          }
          const holder = { current: peer }
          try {
            const panel = registerPeerRow(key, order, holder)
            const main = ctx.slots.register({
              name: 'main',
              key,
            }, () => h(PanelBoundary, {
              onFailure: (failure) => reportClientFailure(api, 'panel-render', failure),
            }, h(RemotePeersPanel, { api, focusPeer: holder.current, onPeersChanged: syncPeers })))
            entries.set(peer.id, { panel, main, holder })
          } catch (failure) {
            console.warn('remote-peers: 注册左栏入口失败', failure)
          }
        })
      }

      ctx.slots.inject('sidebar.panellist', () => {
        slotsReady = true
        syncPeers(latestPeers)
        return ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          // 本插件所有入口共用同一段 order，紧挨着且整体排在原生入口（插件 0、自动化任务 10…）之后。
          order: PANEL_ORDER_BASE,
          label: () => '远程端',
        }, RemotePeersIcon)
      })
      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
      }, () => h(RemotePeersPanel, { api, onPeersChanged: syncPeers })))

      // 启动时先取一次清单，左栏入口不必等用户打开管理页。
      void api.call('peers/list').then((value) => syncPeers(value?.peers ?? [])).catch(() => {})
    }

    const inject = ['slots']

    exports.name = 'remote-peers'
    exports.inject = inject
    exports.apply = apply
    exports.PANEL_ID = PANEL_ID