/** 源码入口（esbuild 打桩前）：不带上 ModuleLoader 外壳，构建脚本统一加 banner/footer。 */
const react = require('react')
const PDFJS = require('pdfjs-dist')
const XLSX_LIB = require('xlsx')
/** 构建期内联的 pdf.js worker 源码（已去掉 export 尾巴，按普通 worker 运行）。 */
import pdfWorkerSource from '../vendor/pdfjs/pdf.worker.min.mjs'
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
    const { useState, useEffect, useCallback, useRef } = react

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
        key: job.key, path: job.path, loaded: job.loaded, total: job.total, phase: job.phase,
      }))
      for (const item of STARTING.values()) {
        if (jobs.some((job) => job.key === item.key)) continue
        jobs.push({ key: item.key, path: item.path, loaded: 0, total: item.total, phase: 'starting' })
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

    /** 能直接作为图片预览的扩展名（其余走文本/表格视图）。 */
    const IMAGE_SUFFIXES = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'bmp', 'svg', 'ico'])
/** 右侧面板能内嵌渲染的类型：PDF 走 `<iframe>`、音视频走 `<video>/<audio>`，字节由转发路由直供。 */
const PDF_SUFFIXES = new Set(['pdf'])
const VIDEO_SUFFIXES = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogv', 'mkv', 'avi'])
const AUDIO_SUFFIXES = new Set(['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'opus'])
/** Office 容器格式：对端 `officeKit/render` 转成 PDF 再看（与主体 office 同一批扩展名，表格另走 SheetJS）。 */
const OFFICE_SUFFIXES = new Set(['doc', 'docx', 'ppt', 'pptx'])
/** 纯文本系：只有这些扩展名才按行分页读取，其余（zip/docx/xlsx…）按二进制处理。 */
const TEXT_SUFFIXES = new Set([
  'txt', 'text', 'log', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonc', 'jsonl', 'ndjson',
  'js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'tsx', 'jsx', 'css', 'scss', 'less', 'html', 'htm',
  'xml', 'svgz', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'env', 'properties', 'gitignore',
  'py', 'go', 'rs', 'java', 'kt', 'c', 'h', 'cc', 'cpp', 'hpp', 'cs', 'php', 'rb', 'lua', 'pl',
  'sh', 'bash', 'zsh', 'ps1', 'bat', 'cmd', 'sql', 'gradle', 'dockerfile', 'makefile', 'lock',
  'srt', 'vtt', 'diff', 'patch', 'tex', 'rtf',
])
/**
 * 扩展名 → 语法语言，逐条照抄主体 `packages/util/code-language/src/index.ts` 的
 * `LANGUAGE_EXTENSIONS`（`CODE_HIGHLIGHT_EXTENSIONS` 就是它的键集合）。
 * 命中的文件按 `code` 预览：交给原生 `MarkdownText` 的代码块渲染，拿到和高亮同一个引擎。
 */
const LANGUAGE_BY_EXT = new Map(Object.entries({
  typescript: ['ts', 'tsx', 'mts', 'cts'],
  javascript: ['js', 'jsx', 'mjs', 'cjs'],
  shellscript: ['sh', 'bash', 'zsh'],
  fish: ['fish'],
  json: ['json', 'jsonc', 'jsonl', 'ndjson', 'ipynb'],
  python: ['py', 'pyw', 'pyi'],
  ruby: ['rb', 'rake', 'gemspec'],
  go: ['go'],
  rust: ['rs'],
  java: ['java'],
  c: ['c', 'h'],
  cpp: ['cc', 'cpp', 'cxx', 'hh', 'hpp', 'hxx'],
  csharp: ['cs'],
  kotlin: ['kt', 'kts'],
  swift: ['swift'],
  php: ['php'],
  yaml: ['yaml', 'yml'],
  toml: ['toml'],
  ini: ['ini', 'conf', 'cfg', 'properties'],
  dotenv: ['env'],
  diff: ['diff', 'patch'],
  http: ['http'],
  mdx: ['mdx'],
  rst: ['rst'],
  latex: ['tex', 'sty', 'cls'],
  bibtex: ['bib'],
  asciidoc: ['adoc'],
  css: ['css'],
  scss: ['scss'],
  less: ['less'],
  sql: ['sql'],
  xml: ['xml', 'xsd', 'xsl', 'xslt', 'plist'],
  lua: ['lua'],
  bat: ['bat', 'cmd'],
  powershell: ['ps1', 'psm1', 'psd1'],
  r: ['r'],
  julia: ['jl'],
  dart: ['dart'],
  scala: ['scala'],
  clojure: ['clj', 'cljs', 'edn'],
  erlang: ['erl', 'hrl'],
  elixir: ['ex', 'exs'],
  haskell: ['hs'],
  fsharp: ['fs', 'fsi', 'fsx'],
  vb: ['vb'],
  perl: ['pl', 'pm'],
  verilog: ['v'],
  'system-verilog': ['sv', 'svh'],
  graphql: ['graphql', 'gql'],
  proto: ['proto'],
  hcl: ['tf', 'tfvars', 'hcl'],
  nix: ['nix'],
  vue: ['vue'],
  svelte: ['svelte'],
  make: ['makefile', 'mk'],
  cmake: ['cmake'],
  groovy: ['gradle', 'groovy'],
}).flatMap(([language, suffixes]) => suffixes.map((suffix) => [suffix, language])))

    /** 滚动条皮肤（动态类 CSS 做不到 ::-webkit-scrollbar，只能注入一条只作用于本插件容器的样式）： 5px 宽、透明轨道、`scrollbar-bg-l1` 圆角拇指、hover 换 `scrollbar-hover-l1` —— 与 ui-theme `scrollbar.css` 同值。刻意... */
    const SCROLL_SKIN = [
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
      '[data-rp-change-header]:hover [data-rp-change-counts] { display: none; }',
      '[data-rp-change-header]:hover [data-rp-change-hint] { display: inline; }',
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
    /** 样式里复用最多的设计令牌：同一 var 的同一 fallback 只写一次。 */
    const T = {
      ter: 'var(--dsw-alias-label-tertiary, #9aa0a6)',
      pri: 'var(--dsw-alias-label-primary, inherit)',
      sec: 'var(--dsw-alias-label-secondary, inherit)',
      radiusMd: 'var(--dsw-radius-md, 8px)',
      radiusSm8: 'var(--dsw-radius-sm, 8px)',
      radiusLg10: 'var(--dsw-radius-lg, 10px)',
      menuBlur: 'var(--dsw-menu-backdrop-filter, blur(40px) saturate(150%))',
      elevationProminent: 'var(--dsw-elevation-prominent, 0 12px 32px rgba(0,0,0,0.16))',
    }
    const styles = {
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
      /* 行本体：原生 `.projectRow`/`.sessionRow` —— 32px、0 8px、md 圆角、gap 6 */
      sessionTreeRow: { display: 'flex', alignItems: 'center', gap: 6, boxSizing: 'border-box', width: '100%', height: 32, margin: 0, padding: '0 8px', border: 0, borderRadius: 'var(--dsw-radius-md, 8px)', background: 'transparent', color: 'inherit', font: 'inherit', textAlign: 'left', cursor: 'pointer' },
      sessionTreeRowHovered: { background: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.04))' },
      /* 前导槽：原生 `.slot` —— 16×20 居中，常态放文件夹图标，hover 换成实心三角（`.projectRow:hover` 的 folder/chevron 互换） */
      treeLeadSlot: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 20, color: 'var(--dsw-alias-label-tertiary, #a6a9ae)' },
      sessionTreeLabel: { flex: '1 1 auto', minWidth: 0, overflow: 'hidden', fontSize: 14, lineHeight: '20px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
      sessionTreeMeta: { flex: 'none', fontSize: 11, lineHeight: '16px', color: 'var(--dsw-alias-label-tertiary, #a6a9ae)' },
      sessionTreeTime: { flex: 'none', fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary, #a6a9ae)' },
      /* 文件夹行右侧的新会话钮：原生 `.iconButton` —— 24×24 命中区（margin -4 压回 16）、14 图标、`label-tertiary`，hover 转 `label-primary` */
      sessionTreeAction: { flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, margin: -4, padding: 0, border: 0, borderRadius: 'var(--dsw-radius-xs, 4px)', background: 'transparent', color: 'var(--dsw-alias-label-tertiary, #a6a9ae)', cursor: 'pointer' },
      /* 工作区行 hover 时的动作列：原生 `.rowActions` —— 20 高、gap 13（两枚 -4 外边距的 24 钮叠出 ~5px 视觉间距） */
      sessionTreeActions: { flex: 'none', display: 'inline-flex', alignItems: 'center', height: 20, gap: 13 },
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
      splitMain: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, border: 0, background: 'transparent', color: T.pri, cursor: 'pointer', padding: 0 },
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

    /** 面板组件：所有数据经本机 Host 的 /remote-peers 通道取得。 */
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
      const [promptText, setPromptText] = useState('')
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
      const [sessionTreeHover, setSessionTreeHover] = useState('')
      /** 正在为哪个工作区建新会话（工作区 id），空串表示没有在飞。 */
      const [creatingIn, setCreatingIn] = useState('')
      /** 打开的工作区 ⋯ 菜单：`{ workspaceId, title, top, left }`，null 表示关着。 */
      const [wsMenu, setWsMenu] = useState(null)
      /** 重命名工作区对话框：`{ workspaceId, title }`（title 是确认时的基线，不是草稿）。 */
      const [renameAsk, setRenameAsk] = useState(null)
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
            const localKey = `${entry.peerId}:${entry.path}`
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
                notice(`下载失败：${String(entry.failure ?? '未知错误')}`, false)
              }
              LIVE_DOWNLOADS.delete(localKey)
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
              remoteKey: entry.key,
              localPath: typeof entry.localPath === 'string' ? entry.localPath : '',
            })
          }
          for (const localKey of [...LIVE_DOWNLOADS.keys()]) {
            if (list.some((entry) => `${entry.peerId}:${entry.path}` === localKey)) continue
            const gone = LIVE_DOWNLOADS.get(localKey)
            LIVE_DOWNLOADS.delete(localKey)
            // 任务从 Host 表里退场 = 写完改名成功（取消先进 CANCELLING，失败另有标记），
            // 这时本机副本已经是真的，卡片按钮可以直接切到「已下载」。
            if (gone === undefined || gone.loaded <= 0) continue
            if (CANCELLING.has(localKey) || failedKeysRef.current.has(localKey)) continue
            setLocalCopies((previous) => (previous[localKey] === true ? previous : { ...previous, [localKey]: true }))
          }
          const next = [...LIVE_DOWNLOADS.values()].map((job) => `${job.key}|${job.phase}|${job.loaded}|${job.total}`).join(',')
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
      /** 待插入的指令（目标、计划）：显示蓝色指令名 + 输入提示。 */
      const [pendingCommand, setPendingCommand] = useState(null)
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
              // `null` = 这一项对端答不上来：记成 `error` 占位，免得滚回去又重问一遍。
              const settled = typeof size === 'number' && size > 0 ? size : 'error'
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

      /** provider/model 的人类可读名字。 */
      function modelNameOf(nextCatalog, selection) {
        if (selection === undefined || selection === null) return ''
        for (const group of nextCatalog?.groups ?? []) {
          if (group.id !== selection.provider && selection.provider !== '') continue
          for (const model of group.models ?? []) {
            if (model.id === selection.model) return model.name
          }
        }
        return selection.model
      }

      /** 权限预设（沙箱模式）的显示名，与宿主文案一致。 */
      function permissionLabel(value) {
        const known = {
          'read-only': '仅可查看',
          'workspace-write': '工作区内修改',
          'danger-full-access': '完全权限',
          auto: '自动审查',
        }
        if (typeof value !== 'string' || value === '') return null
        return known[value] ?? value
      }

      /** 会话当前的权限预设：取最后一次 `permission/preset` 事件。 */
      function permissionOf(events) {
        for (let index = events.length - 1; index >= 0; index -= 1) {
          const preset = events[index]?.data?.preset
          if (events[index]?.type === 'permission/preset' && typeof preset === 'string') return preset
        }
        return null
      }

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

      /** 预设 id → 显示名。内置预设宿主不给 name，用宿主自带的中文名。 */
      function presetNameOf(id, roster) {
        const builtin = {
          standard: '标准模式',
          ptc: 'PTC 模式',
          minimal: '极简模式',
          cordis: '创造模式',
        }
        if (typeof id !== 'string' || id === '') {
          const fallback = (roster ?? []).find((preset) => preset.isDefault === true)
          return fallback === undefined ? null : presetNameOf(fallback.id, roster)
        }
        const row = (roster ?? []).find((preset) => preset.id === id)
        if (typeof row?.name === 'string' && row.name !== '') return row.name
        return builtin[id] ?? id
      }

      /** 当前会话的模式名，取 session/list 的 agentPreset 投影。 */
      function presetOfSession(sessionId, roster) {
        const item = sessions.find((session) => session.sessionId === sessionId)
        const id = item?.projections?.values?.agentPreset
        return presetNameOf(typeof id === 'string' ? id : null, roster)
      }

      /** 会话当前模型选择：优先取最近一次 request/header 的 config，其次消息 source。 */
      function selectionOf(events, nextCatalog) {
        for (let index = events.length - 1; index >= 0; index -= 1) {
          const config = events[index]?.data?.header?.config
          if (config !== undefined && typeof config.model === 'string') {
            return {
              provider: typeof config.provider === 'string' ? config.provider : '',
              model: config.model,
              reasoningEffort: typeof config.reasoningEffort === 'string' ? config.reasoningEffort : undefined,
            }
          }
          const source = events[index]?.data?.message?.source
          if (source !== undefined && typeof source.model === 'string') {
            return {
              provider: typeof source.provider === 'string' ? source.provider : '',
              model: source.model,
              reasoningEffort: typeof events[index]?.data?.request?.config?.reasoningEffort === 'string'
                ? events[index].data.request.config.reasoningEffort
                : undefined,
            }
          }
        }
        const fallback = nextCatalog?.default
        return fallback === undefined ? null
          : { provider: fallback.provider, model: fallback.model, reasoningEffort: fallback.reasoningEffort }
      }

      /** 会话指标：轮/步、tok/s、累计 token、缓存命中率、上下文占用。 */
      /** 折叠会话事件里的统计指标：轮/步、速度、token 合计、缓存命中率、上下文占用。 */
      function metricsOf(events) {
        let turns = 0
        let steps = 0
        /** 三个互斥的 prompt 侧计费桶：未命中输入 / 缓存读 / 缓存写（同 `tokenUsage`）。 */
        let uncachedInput = 0
        let outputTokens = 0
        let cacheRead = 0
        let contextWindow = 0
        /** 最近一次 usage 样本的 prompt 侧规模（原生 `pressureTokens`），不是累计值。 */
        let pressureTokens = 0
        let lastStepStart = 0
        let lastStepEnd = 0
        let lastStepOutput = 0
        for (const event of events) {
          const data = event?.data ?? {}
          if (event?.type === 'turn/start' && typeof data.turn === 'number') {
            turns = Math.max(turns, data.turn)
          }
          if (event?.type === 'step/start') {
            steps += 1
            lastStepStart = typeof event.time === 'number' ? event.time : 0
            lastStepOutput = 0
          }
          if (event?.type === 'step/end') lastStepEnd = typeof event.time === 'number' ? event.time : 0
          if (event?.type === 'assistant/message' || event?.type === 'assistant/attempt') {
            const usage = data.usage ?? {}
            const measured = data.usage !== undefined
            if (measured) {
              uncachedInput += Number(usage.inputTokens ?? 0)
              outputTokens += Number(usage.outputTokens ?? 0)
              cacheRead += Number(usage.cacheReadTokens ?? 0)
              const sample = Number(usage.inputTokens ?? 0)
                + Number(usage.cacheReadTokens ?? 0)
                + Number(usage.cacheWriteTokens ?? 0)
              if (sample > 0) pressureTokens = sample
            }
            if (typeof data.usage?.outputTokens === 'number') lastStepOutput += data.usage.outputTokens
          }
          if (event?.type === 'request/context' && typeof data.contextWindow === 'number') {
            contextWindow = data.contextWindow
          }
        }
        const elapsed = lastStepEnd > lastStepStart ? (lastStepEnd - lastStepStart) / 1000 : 0
        const tokensPerSecond = elapsed > 0 ? Math.round(lastStepOutput / elapsed) : 0
        const cacheWrite = 0
        const billedInput = uncachedInput + cacheRead + cacheWrite
        /** 缓存命中分子/分母：原生 `billedInputTokens` 的三个计费桶。 */
        const cacheHitRate = { value: cacheRead, base: billedInput }
        /** 原生 `contextOccupancy`：最近一次样本的 prompt 规模 / 路由上下文容量。 */
        const contextUsed = contextWindow > 0 && pressureTokens > 0
          ? Math.min(100, Math.round((pressureTokens / contextWindow) * 100))
          : 0
        const totalTokens = billedInput + outputTokens
        return { turns, steps, tokensPerSecond, totalTokens, cacheHitRate, contextUsed }
      }

      /** 最近一次请求的推理等级。 */
      function effortOf(events) {
        for (let index = events.length - 1; index >= 0; index -= 1) {
          const effort = events[index]?.data?.header?.config?.reasoningEffort
          if (typeof effort === 'string' && effort !== '') return effort
        }
        return undefined
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
          setPromptText('')
          resetComposerHeight()
          setPendingCommand(null)
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
          setPromptText('')
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
      const openPeerPath = useCallback(async (file) => {
        const path = peerAbsoluteOf(file)
        if (path === '' || activePeer === '') return
        const name = baseNameOf(path)
        // 成功路径完全静默：不弹任何提示（用户明确要求「打开」不出现 toast）。
        try {
          const result = await call('open-local', { id: activePeer, path, sessionId: openSession ?? '' })
          // 本机端点回的是解包后的值（`{ path, action }`），不是 `proxy` 那种 `{ result }` 信封。
          const opened = result?.result?.ok === true ? result.result.value : result
          if (typeof opened?.path !== 'string') throw new Error('本机没能打开这个文件')
          if (opened.reused === true) setLocalCopies((previous) => (previous[`${activePeer}:${path}`] === true ? previous : { ...previous, [`${activePeer}:${path}`]: true }))
          setError('')
        } catch (failure) {
          notice(errorText(failure), false)
        }
      }, [call, activePeer, openSession])


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
        const key = `${activePeer}:${path}`
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
        const key = `${activePeer}:${path}`
        setTooltip(null)
        if (LIVE_DOWNLOADS.has(key) || STARTING.has(key)) return
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
          }
          // 否则等 Host 的第一块字节：轮询看到 loaded > 0 就切进度，失败则由轮询弹提示。
        }).catch((failure) => {
          STARTING.delete(key)
          notifyDownloads()
          diagNote(`download save failed ${path}: ${errorText(failure)}`)
          notice(`下载失败：${errorText(failure)}`, false)
        })
      }, [activePeer, openSession, fileSizes])

      /**
       * 取消入口（第一段）：只弹确认框。大文件误点一下就会丢掉进度，先在「继续下载 / 取消下载」里选。
       */
      const cancelPeerDownload = useCallback((file) => {
        const key = `${activePeer}:${peerAbsoluteOf(file)}`
        if (LIVE_DOWNLOADS.get(key) === undefined && !STARTING.has(key)) return
        setDownloadCancelAsk({ file })
      }, [activePeer])

      /**
       * 取消入口（第二段）：确认后真正停掉 —— Host 中止取字节并丢掉 `.part`，
       * 与进度是否推进完全解耦，卡住不动也能点掉。
       */
      const doCancelDownload = useCallback((file) => {
        const key = `${activePeer}:${peerAbsoluteOf(file)}`
        STARTING.delete(key)
        const job = LIVE_DOWNLOADS.get(key)
        LIVE_DOWNLOADS.delete(key)
        // 刚取消的任务 Host 可能还报一两轮，先压住，别让卡片闪回来。
        CANCELLING.set(key, Date.now())
        notifyDownloads()
        const remoteKey = typeof job?.remoteKey === 'string' ? job.remoteKey : `${activePeer}|${peerAbsoluteOf(file)}`
        void call('download/cancel', { key: remoteKey }).catch(() => {})
      }, [activePeer])

      /** 取消下载的确认框：讲清会丢掉多少进度、并且不会留在本机。 */
      function renderDownloadCancelDialog() {
        const file = downloadCancelAsk?.file
        const close = () => setDownloadCancelAsk(null)
        const key = file === undefined ? '' : `${activePeer}:${peerAbsoluteOf(file)}`
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
        renameAsk === null ? null : renderRenameDialog(),
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

      /**
       * 复刻原生 `ReasoningRow`：24px 一行「思考」，折叠态给首行摘要素描，
       * 流式中取最近一个完整段落的首行、右侧渐隐 + shimmer；点开看完整思考正文。
       */
      /**
       * 本轮进行中的第一行状态：未推进时是「正在分析请求」，一旦有内容/工具/思考就变成
       * 「已完成分析」（复刻本体的请求分析行 —— 分析阶段收尾，后面的步骤行跟着往上长）。
       * 对端在思考阶段本端原先完全没有反馈，这两行给出「已经收到、正在处理」的即时信号。
       */
      function renderLiveStatusRow() {
        if (turnStartedAt === 0) return null
        const advanced = liveText !== '' || reasoningDisplayText(liveReasoning).trim() !== '' || pendingToolOf() !== null
        return h('div', { style: styles.liveStatusRow, 'data-rp-live-status': '' },
          h('span', { style: styles.liveStatusIcon },
            advanced
              ? h('svg', { width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' },
                  h('rect', { x: 2.6, y: 2.6, width: 10.8, height: 10.8, rx: 1.2 }),
                  h('path', { d: 'M6.2 6.2 9.8 9.8M9.8 6.2 6.2 9.8' }))
              : spinnerGlyph(13)),
          h('span', null, advanced ? '已完成分析' : '正在分析请求'),
        )
      }

      /**
       * 进行中的工具行：`正在调用工具 · <工具名>`。对端已经发出 `tool/call`、还没结算
       * `tool/result` 的那一步就是「正在跑」的那一步，复刻本体这一行的转圈图标。
       */
      function renderLiveToolRow() {
        const pending = pendingToolOf()
        if (pending === null) return null
        const name = typeof pending.data?.name === 'string' ? pending.data.name : ''
        return h('div', { key: 'tool', style: styles.liveStatusRow, 'data-rp-live-tool': name },
          h('span', { style: styles.liveStatusIcon }, spinnerGlyph(13)),
          h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
            name === '' ? '正在调用工具' : `正在调用工具 · ${name}`),
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
        if (text.trim() === '') return null
        const running = liveText === ''
        const active = turnStartedAt !== 0
        const summary = (running ? latestParagraphFirstLine(text) : firstLineOfText(text)).replaceAll('**', '')
        const open = liveReasoningOpen
        const row = h('div', {
          style: styles.thinkRow,
          'data-rp-think-row': '',
          role: 'button',
          tabIndex: 0,
          'aria-expanded': open ? 'true' : 'false',
          'aria-label': '思考',
          onKeyDown: (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            setLiveReasoningOpen((value) => !value)
          },
          onClick: () => setLiveReasoningOpen((value) => !value),
        },
          h('span', { style: styles.thinkLeading },
            open
              ? h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
                  h('path', { d: 'M3 10.5 8 5.5 13 10.5' }))
              : [
                  h('span', { key: 'icon', style: styles.thinkIconIdle, 'data-rp-think-icon': '', dangerouslySetInnerHTML: { __html: PROCESS_ROW_ICONS.think } }),
                  h('svg', { key: 'chevron', 'data-rp-think-chevron': '', style: styles.thinkChevron, width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1 },
                    h('path', { d: 'M3 5.5 8 10.5 13 5.5' })),
                ]),
          h('span', { style: styles.thinkTitle }, active ? `正在思考，用时 ${formatRunDuration(Math.max(1000, Date.now() - turnStartedAt))}…` : '思考'),
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
        return h('div', { key: 'think', style: styles.thinkRoot }, row, body)
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

      /** 树行的通用外壳：缩进按层级、hover 底色、右侧列固定不挤。行本体是 div（行内还要放按钮，
         原生这两层也是 div + role=button），键盘 Enter/Space 与点击同效。 */
      function treeRowShell(key, depth, body, onClick, title, forceActive) {
        const active = sessionTreeHover === key || forceActive === true
        return h('div', {
          key,
          role: 'button',
          tabIndex: 0,
          // 只留 aria-label：`title` 会冒出浏览器原生提示条，和行内按钮的自绘 tooltip 打架
          'aria-label': title,
          style: active ? { ...styles.sessionTreeRow, ...styles.sessionTreeRowHovered, paddingLeft: 8 + depth * 16 } : { ...styles.sessionTreeRow, paddingLeft: 8 + depth * 16 },
          onMouseEnter: () => setSessionTreeHover(key),
          onMouseLeave: () => setSessionTreeHover((current) => (current === key ? '' : current)),
          onClick,
          onKeyDown: (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            onClick()
          },
        }, body)
      }

      /** 文件夹行：chevron + 文件夹图标 + 名字，点击折叠/展开。目录节点（无工作区身份）右侧留数量与相对时间；
          工作区行右侧不再显示数量/时间，hover 时换成「⋯ + 新会话」两枚图标钮 —— 原生 `.rowResting`/`.rowActions` 的互换。 */
      function renderTreeFolder(key, depth, label, count, latest, workspaceId) {
        const open = sessionTreeOpen[key] !== false
        // 菜单开着的那一行保持展开态外观（原生 `.projectRow.menuOpen` 让 `.rowActions` 一直显示）
        const menuOpen = wsMenu !== null && wsMenu.workspaceId === workspaceId
        const hovered = sessionTreeHover === key || menuOpen
        const busy = workspaceId !== undefined && creatingIn === workspaceId
        const actions = workspaceId !== undefined
          ? (hovered
              ? [h('div', { key: 'actions', style: styles.sessionTreeActions },
                  h('button', {
                    key: 'menu',
                    type: 'button',
                    'aria-label': '更多',
                    'data-rp-anchor': '',
                    style: styles.sessionTreeAction,
                    onMouseEnter: (event) => {
                      event.currentTarget.style.color = 'var(--dsw-alias-label-primary, inherit)'
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
                      setWsMenu({ workspaceId, title: label, top: clampMenuTop(rect), left: clampMenuLeft(rect.left) })
                    },
                  }, h('span', { style: { fontSize: 15, lineHeight: 1, letterSpacing: 1 } }, '⋯')),
                  h('button', {
                    key: 'new',
                    type: 'button',
                    'aria-label': '新会话',
                    style: busy ? { ...styles.sessionTreeAction, cursor: 'default' } : styles.sessionTreeAction,
                    disabled: busy,
                    onMouseEnter: (event) => {
                      event.currentTarget.style.color = 'var(--dsw-alias-label-primary, inherit)'
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
              : [])
          : [
              h('span', { key: 'count', style: styles.sessionTreeMeta }, String(count)),
              h('span', { key: 'time', style: styles.sessionTreeTime }, relativeTimeText(latest)),
            ]
        return treeRowShell(key, depth,
          [
            // 原生 `.slot`：常态是文件夹，hover 换成实心三角（`.folder`/`.chevron` 互换），没有单独的常驻 caret
            h('span', { key: 'lead', style: styles.treeLeadSlot }, hovered ? triangleFillGlyph(open) : navFolderGlyph(open)),
            h('span', { key: 'label', style: styles.sessionTreeLabel }, label),
            ...actions,
          ],
          () => setSessionTreeOpen((previous) => ({ ...previous, [key]: previous[key] === false })),
          label,
          hovered,
        )
      }

      /** 会话行：缩进到文件层级，右侧相对时间；整行可点开会话。 */
      function renderTreeSession(session, depth, note) {
        return treeRowShell(`s:${session.sessionId}`, depth,
          [
            h('span', { key: 'label', style: styles.sessionTreeLabel }, sessionTitle(session)),
            note === '' ? null : h('span', { key: 'note', style: styles.sessionTreeMeta }, note),
            h('span', { key: 'time', style: styles.sessionTreeTime }, relativeTimeText(session.updatedAt)),
          ],
          () => void openRemoteSession(activePeer, session.sessionId),
          `${sessionTitle(session)} · ${session.sessionId} · ${session.cwd ?? ''}`,
        )
      }

      /** 组内最近时间：用于文件夹行右侧的时间列。 */
      function latestOf(rows) {
        return rows.reduce((newest, row) => {
          const stamp = typeof row.updatedAt === 'number' ? row.updatedAt : Date.parse(String(row.updatedAt ?? ''))
          return Number.isFinite(stamp) && stamp > newest ? stamp : newest
        }, 0)
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
          if (keyword === '') return true
          // 只匹配会话名称（原生「搜索会话名称」）：带上 cwd 会把路径里凑巧含关键词的会话也搜出来
          return sessionTitleOf(session.sessionId).toLowerCase().includes(keyword)
        })
        // 排序固定按最近更新（视图选项不再提供排序入口）。
        list.sort((left, right) => stampOf(right) - stampOf(left))
        return { list: [...list], archivedSet }
      }

      /** 一组会话行（按当前排序）。 */
      function sessionRows(rows, depth, note) {
        return rows.map((session) => renderTreeSession(session, depth, typeof note === 'function' ? note(session) : (note ?? '')))
      }

      /** 工作区树：按 cwd 逐级拆目录，叶子下挂会话（原生「按工作区树」）。 */
      function workspaceTreeOf(list) {
        const root = { key: 'wt:root', label: '', children: new Map(), rows: [] }
        const nodeFor = (parent, segment) => {
          const key = `${parent.key}/${segment}`
          const existing = parent.children.get(segment)
          if (existing !== undefined) return existing
          const node = { key, label: segment, children: new Map(), rows: [] }
          parent.children.set(segment, node)
          return node
        }
        for (const session of list) {
          const segments = String(session.cwd ?? '').split(/[\\/]+/u).filter((part) => part !== '')
          let node = root
          for (const segment of segments) node = nodeFor(node, segment)
          node.rows.push(session)
        }
        return root
      }

      /** 递归渲染工作区树节点：文件夹行 + 子目录 + 直挂会话。 */
      function renderWorkspaceTree(node, depth, archivedSet) {
        const rows = []
        const countOf = (item) => item.rows.length + [...item.children.values()].reduce((sum, child) => sum + countOf(child), 0)
        const latestOfNode = (item) => latestOf([...item.rows, ...[...item.children.values()].map((child) => ({ updatedAt: latestOfNode(child) }))])
        const emit = (item) => {
          const open = sessionTreeOpen[item.key] !== false
          rows.push(renderTreeFolder(item.key, depth, item.label, countOf(item), latestOfNode(item)))
          if (!open) return
          for (const session of sessionRows(item.rows, depth + 1, (row) => (archivedSet.has(String(row.sessionId)) ? '已归档' : ''))) rows.push(session)
          for (const child of item.children.values()) emit(child)
        }
        for (const child of node.children.values()) emit(child)
        return rows
      }

      /** 会话树：`workspace` 按工作区分组、`tree` 按工作区目录树、`list` 单列表。 */
      function renderSessionList() {
        const { list, archivedSet } = visibleSessions()

        if (list.length === 0) {
          return h('div', { style: styles.muted },
            sessions.length === 0 ? '没有读到会话。' : '没有匹配的会话。')
        }

        if (groupMode === 'list') {
          return h('div', { style: styles.sessionTree },
            sessionRows(list, 0, (row) => (archivedSet.has(String(row.sessionId)) ? '已归档' : '')),
          )
        }

        if (groupMode === 'tree') {
          return h('div', { style: styles.sessionTree }, renderWorkspaceTree(workspaceTreeOf(list), 0, archivedSet))
        }

        const byId = new Map(list.map((session) => [session.sessionId, session]))
        const claimed = new Set()
        const groups = workspaces
          .map((workspace) => {
            const rows = (Array.isArray(workspace.sessionIds) ? workspace.sessionIds : [])
              .map((id) => byId.get(id))
              .filter((session) => session !== undefined)
            for (const row of rows) claimed.add(row.sessionId)
            return { key: `ws:${workspace.workspaceId}`, workspaceId: String(workspace.workspaceId), title: String(workspace.title ?? workspace.path ?? '未命名工作区'), rows }
          })
          .filter((group) => group.rows.length > 0)
        const orphans = list.filter((session) => !claimed.has(session.sessionId))
        const archived = list.filter((session) => archivedSet.has(String(session.sessionId)))

        /** 一层文件夹 + 其下会话行（展开时）。 */
        const folder = (group, depth, note) => {
          const open = sessionTreeOpen[group.key] !== false
          const rows = [renderTreeFolder(group.key, depth, group.title, group.rows.length, latestOf(group.rows), group.workspaceId)]
          if (open) for (const session of group.rows) rows.push(renderTreeSession(session, depth + 1, typeof note === 'function' ? note(session) : (note ?? '')))
          return rows
        }

        const children = []
        for (const group of groups) children.push(...folder(group, 0))
        if (orphans.length > 0) children.push(...folder({ key: 'orphans', title: '未归入工作区', rows: orphans }, 0))
        if (archived.length > 0) children.push(...folder({ key: 'archived', title: '已归档', rows: archived }, 0, '已归档'))
        return h('div', { style: styles.sessionTree }, children)
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
        setSessions([])
        setOpenSession(null)
        setSessionQuery('')
        setSessionSearchOpen(false)
        setViewMenu(null)
      }

      /** 远程端主界面头部：醒目的「返回远程端列表」胶囊 + 该端标题与地址。 */
      function renderPeerPageHeader(peer) {
        const hoverOn = (event) => {
          event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, #f2f3f5)'
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
            h('div', { style: styles.muted }, `${peer.host}:${peer.port} · 该端的全部会话`)),
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
        return h('div', { style: styles.card },
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
          h('div', { style: styles.muted }, `${peerNameOf(activePeer)} · ${groupMode === 'workspace' ? '工作区 → 会话' : groupMode === 'tree' ? '工作区目录树' : '单列表'} · 最近更新`),
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
        const title = item?.projections?.values?.title
        return typeof title === 'string' && title !== '' ? title : sessionId
      }

      /** 原生版式的会话页：标题栏 + 对话 tab + 消息列 + 药丸输入框。 */
      /** 预览卡里的单行化文本：压掉换行与多余空白。 */
      function oneLine(text) {
        return String(text ?? '').replace(/\s+/gu, ' ').trim().slice(0, 600)
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
                ? 'var(--dsw-alias-label-primary, #111)'
                : hovering ? 'var(--dsw-alias-label-tertiary, #6b7280)' : 'var(--dsw-alias-border-l4, rgba(0,0,0,0.14))'
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
                      event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, #f2f3f5)'
                      event.currentTarget.style.borderColor = 'var(--dsw-alias-border-l2, #e3e4e6)'
                      event.currentTarget.style.color = 'var(--dsw-alias-label-primary, #1f2329)'
                    },
                    onMouseLeave: (event) => {
                      event.currentTarget.style.background = 'transparent'
                      event.currentTarget.style.borderColor = 'transparent'
                      event.currentTarget.style.color = 'var(--dsw-alias-label-secondary, #6f7377)'
                    },
                    onClick: () => { closeStream(); setOpenSession(null); setMessages([]) },
                  }, backArrowGlyph(16)),
                  workspaceCrumb === null ? null : h('button', {
                    key: 'crumb-workspace',
                    type: 'button',
                    style: styles.crumbButton,
                    'data-rp-anchor': '',
                    'aria-label': `工作区 ${workspaceCrumb.title}`,
                    onMouseEnter: (event) => { event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.04))' },
                    onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent' },
                    onClick: (event) => {
                      event.stopPropagation()
                      if (wsMenu !== null && wsMenu.workspaceId === workspaceCrumb.workspaceId) {
                        setWsMenu(null)
                        return
                      }
                      const rect = event.currentTarget.getBoundingClientRect()
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
                        ? h('div', { style: styles.muted }, '这条会话没有可读的文本消息。')
                        : null,
                      renderHistoryEdge(),
                      messages.map((message, index) => renderMessage(message, index, tailIndexes.get(message.turn) === index)),
                      liveReasoning === '' && liveText === '' && turnStartedAt === 0
                        ? null
                        : h('div', { style: styles.liveFlow },
                            renderLiveStatusRow(),
                            renderLiveToolRow(),
                            renderLiveReasoningRow(),
                            liveText === ''
                              ? null
                              : h('div', { style: styles.assistantBlock },
                                  hostMarkdown === null
                                    ? renderRichText(liveText)
                                    : wrapMarkdownDelegate(h(hostMarkdown, { text: String(liveText ?? ''), labels: markdownLabels, streaming: true, ...markdownResolvers(messages.length === 0 ? undefined : messages[messages.length - 1].turn) })),
                                ),
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
          renameAsk === null ? null : renderRenameDialog(),
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

      /** 精确 token 数：带千分位（原生 `formatExactTokens` 用 locale 分组符）。 */
      function formatExactTokens(value) {
        return String(Math.max(0, Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/gu, ',')
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
        const key = `${activePeer}:${path}`
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
        const opening = targetPath !== '' && revealing[`${activePeer}:${targetPath}`] === true
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
      function clampMenuTop(rect) {
        const below = rect.bottom + 4
        const height = 52
        if (below + height <= globalThis.innerHeight - 12) return below
        return Math.max(12, rect.top - 4 - height)
      }

      /** 工作区行的 ⋯ 菜单：目前只有「重命名」（原生同一菜单里的「在文件夹显示」「删除工作区」未接）。 */
      function renderWorkspaceMenu() {
        const target = wsMenu
        return h('div', {
          style: { ...styles.wsMenu, top: target.top, left: target.left },
          'data-dsh-popup': '',
          onClick: (event) => event.stopPropagation(),
        },
          h('button', {
            type: 'button',
            style: styles.pathMenuItem,
            onClick: () => openRenameAsk(target.workspaceId, target.title),
            onMouseEnter: (event) => { event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.04))' },
            onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent' },
          },
            h('span', { style: { ...styles.menuIconSlot, color: 'var(--dsw-alias-menu-icon, #6f7377)' } }, renameGlyph(14)),
            h('span', { style: { flex: 1, minWidth: 0 } }, '重命名'),
          ),
        )
      }

      /** 重命名工作区对话框：原生 Modal（标题 + 输入框 + 取消/重命名），草稿空或未改动时确认钮禁用。 */
      function renderRenameDialog() {
        const draft = renameDraft.trim()
        const blocked = renaming || draft === '' || (renameAsk !== null && draft === renameAsk.title)
        return h('div', {
          style: { ...styles.permDialogOverlay, backdropFilter: 'var(--dsw-mask-blur, blur(2px))' },
          onClick: (event) => { if (event.target === event.currentTarget) closeRename() },
        },
          h('div', {
            style: styles.renameDialog,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': '重命名工作区',
          },
            h('div', { style: { display: 'flex', flexDirection: 'column', width: '100%' } },
              h('div', { style: { ...styles.permDialogHead, alignItems: 'center', justifyContent: 'space-between' } },
                h('h2', { style: { margin: 0, fontSize: 16, lineHeight: '24px', fontWeight: 500, color: T.pri } }, '重命名工作区'),
                h('button', {
                  type: 'button',
                  style: styles.ghostButton,
                  'aria-label': '关闭',
                  onMouseEnter: (event) => { event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.04))' },
                  onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent' },
                  onClick: closeRename,
                }, closeGlyph(14)),
              ),
              h('div', { style: { ...styles.permDialogBody, marginTop: 20 } },
                h('input', {
                  type: 'text',
                  style: styles.renameInput,
                  value: renameDraft,
                  autoFocus: true,
                  'aria-label': '工作区名称',
                  disabled: renaming,
                  onFocus: (event) => { event.currentTarget.select() },
                  onChange: (event) => { setRenameDraft(event.target.value); setRenameError('') },
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void confirmRename()
                    }
                    if (event.key === 'Escape' && !renaming) {
                      event.preventDefault()
                      closeRename()
                    }
                  },
                }),
                renameError === '' ? null : h('div', { style: styles.renameErrorText, role: 'alert' }, renameError),
              ),
            ),
            h('div', { style: styles.permDialogFooter },
              h('button', { type: 'button', style: styles.permCancel, onClick: closeRename }, '取消'),
              h('button', {
                type: 'button',
                style: blocked ? { ...styles.permConfirm, ...styles.permConfirmDisabled } : styles.permConfirm,
                disabled: blocked,
                onClick: () => void confirmRename(),
              }, renaming ? '重命名中…' : '重命名'),
            ),
          ),
        )
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

      /** 复制图标：ui-primitives `copy-outline`（16 视图框、regular 线重）。 */
      function copyGlyph(size = 14) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', strokeWidth: 1 },
          h('rect', { x: 1.52075, y: 4.07373, width: 10.3932, height: 10.3932, rx: 2, stroke: 'currentColor' }),
          h('path', {
            d: 'M11.9792 1.53296C13.36 1.53296 14.4792 2.65225 14.4792 4.03296V9.42847C14.4792 10.3756 13.9521 11.1987 13.1755 11.6228V10.3298C13.3652 10.0787 13.4792 9.7674 13.4792 9.42847V4.03296C13.4792 3.20453 12.8077 2.53296 11.9792 2.53296H6.58374C6.27966 2.53301 5.99684 2.6235 5.7605 2.77905H4.42358C4.85652 2.03463 5.66056 1.53304 6.58374 1.53296H11.9792Z',
            fill: 'currentColor',
          }),
        )
      }

      /** 复制成功后的勾选图标（check-outline）。 */
      function checkGlyph(size = 15) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' },
          h('path', { d: 'M3 8.6l3.2 3.2 6.6-8' }))
      }

      /** 用量（database-outline，15px）。 */
      function databaseGlyph(size = 15) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 },
          h('ellipse', { cx: 8, cy: 3.6, rx: 5, ry: 1.9 }),
          h('path', { d: 'M3 3.6v8.8c0 1 2.2 1.9 5 1.9s5-.9 5-1.9V3.6' }),
          h('path', { d: 'M3 8c0 1 2.2 1.9 5 1.9s5-.9 5-1.9' }))
      }

      /** 速度表盘（gauge-outline）。 */
      function gaugeGlyph(size = 14) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' },
          h('path', { d: 'M2.6 12.2a6 6 0 1 1 10.8 0' }),
          h('path', { d: 'M8 8.4l2.8-2.4' }),
          h('circle', { cx: 8, cy: 8.6, r: 0.9 }))
      }

      /** 上下文占用环：26% 这类读数，按百分比画弧。 */
      function contextGlyph(percent, size = 14) {
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

      function downloadGlyph() {
        return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', strokeWidth: 1 },
          h('path', { d: 'M8 1.95317V10.0469', stroke: 'currentColor' }),
          h('path', { d: 'M4.25 6.29688L8 10.0469L11.75 6.29688', stroke: 'currentColor' }),
          h('path', { d: 'M1.5 10.0469V13.158C1.5 13.3937 1.60536 13.6198 1.79289 13.7865C1.98043 13.9532 2.23478 14.0469 2.5 14.0469H13.5C13.7652 14.0469 14.0196 13.9532 14.2071 13.7865C14.3946 13.6198 14.5 13.3937 14.5 13.158V10.0469', stroke: 'currentColor' }),
        )
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

      /** 工具名 → 第二层每行前面的标签（原生 `message.stepProcess.done.*` 的单项写法）。 */
      function processToolLabelOf(name) {
        const labels = {
          pwsh: '运行命令', shell: '运行命令', bash: '运行命令', exec: '运行命令',
          read: '读取文件', Read: '读取文件',
          write: '写入文件',
          edit: '编辑文件', edit_file: '编辑文件', str_replace_editor: '编辑文件',
          web_search: '搜索网页', web_fetch: '访问网页',
          run_code: '运行代码',
          ask_user_question: '提问', question: '提问',
          update_plan: '更新计划', plan_write: '更新计划',
          subagent: '协调子智能体', send_message: '发消息', list_agents: '列出智能体',
          read_image: '读取图片', ReadImage: '读取图片',
        }
        return labels[name] ?? '调用工具'
      }

      /** 工具名 → 活动分类（原生 `ProcessActivitySummary` 的 kind）。 */
      function processToolKind(name) {
        const known = {
          pwsh: 'commands', shell: 'commands', bash: 'commands', exec: 'commands',
          read: 'read', Read: 'read',
          write: 'write',
          edit: 'edit', edit_file: 'edit', str_replace_editor: 'edit',
          web_search: 'webSearch', web_fetch: 'webFetch',
          run_code: 'code',
          ask_user_question: 'questions', question: 'questions',
          update_plan: 'plan', plan_write: 'plan',
          subagent: 'subagents', send_message: 'subagents', list_agents: 'subagents',
          read_image: 'readImage', ReadImage: 'readImage',
        }
        return known[name] ?? 'tools'
      }

      /** 分类 → 第一层分组标题（原生 `message.stepProcess.done.*` 的完整几项）。 */
      function processKindLabelOf(cat) {
        const labels = {
          read: '已读取文件',
          readImage: '已读取图片',
          write: '已写入文件',
          search: '已搜索代码',
          edit: '修改了文件',
          commands: '执行了命令',
          code: '运行了代码',
          webSearch: '已搜索网页',
          webFetch: '已访问网页',
          subagents: '已协调子智能体',
          plan: '更新了计划',
          questions: '向用户提出了问题',
          context: '已注入上下文',
          tools: '已调用工具',
        }
        return labels[cat] ?? '已调用工具'
      }

      /** 工具参数里的 `description` 是模型写的这一步意图；没有就退回命令首行。 */
      function processToolSummary(event) {
        let args = {}
        try {
          args = JSON.parse(event.data?.arguments ?? '{}')
        } catch {
          args = {}
        }
        if (typeof args.description === 'string' && args.description.trim() !== '') return oneLine(args.description)
        if (typeof args.command === 'string') {
          const line = args.command.split(/\r?\n/u).map((part) => part.trim()).find((part) => part !== '')
          if (line !== undefined) return oneLine(line)
        }
        return oneLine(args.path ?? args.file_path ?? args.filePath ?? args.query ?? args.name ?? event.data?.name ?? '')
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
              ? h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', style: { flex: 'none', color: 'var(--dsw-alias-label-tertiary, #8a8f99)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 140ms cubic-bezier(.2,.8,.2,1)' } },
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
                h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', style: { flex: 'none', color: 'var(--dsw-alias-label-tertiary, #8a8f99)', transform: groupOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 140ms cubic-bezier(.2,.8,.2,1)' } },
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
                ? { ...styles.msgAction, background: 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))' }
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
                  event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))'
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
              return IMAGE_SUFFIXES.has(extOf(value)) ? ensureRemoteImage(value) : undefined
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
            const cardKey = `${activePeer}:${peerAbsoluteOf(file)}`
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

      /** 文件大小：卡片上按 `12.3 MB` / `856 KB` 这种口吻显示，拿不到就给空串。 */
      function formatBytes(bytes) {
        if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes <= 0) return ''
        if (bytes >= 1024 * 1024) {
          const mb = bytes / 1024 / 1024
          return `${mb >= 100 ? Math.round(mb) : mb.toFixed(1)} MB`
        }
        if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
        return `${Math.round(bytes)} B`
      }

      /** 该文件当前的下载任务（没有则 undefined）：卡片据此在「下载 / 取消 NN%」之间切换。 */
      function downloadJobOf(path) {
        return downloads.find((item) => item.key === `${activePeer}:${path}`)
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
        if (job === undefined) {
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
          askSizeOf(`${activePeer}:${absolutePath}`, absolutePath)
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
       * 按扩展名挑预览方式。返回 `'binary'` 表示右侧面板无法内嵌渲染
       * （zip / docx / xlsx / pptx / exe…），调用方改走「显示文件位置」的路径页。
       */
      function previewModeOf(path) {
        const suffix = extOf(path)
        if (IMAGE_SUFFIXES.has(suffix)) return 'image'
        if (PDF_SUFFIXES.has(suffix)) return 'pdf'
        if (VIDEO_SUFFIXES.has(suffix)) return 'video'
        if (AUDIO_SUFFIXES.has(suffix)) return 'audio'
        if (OFFICE_SUFFIXES.has(suffix)) return 'office'
        if (suffix === 'xlsx' || suffix === 'xls') return 'excel'
        if (suffix === 'html' || suffix === 'htm') return 'html'
        if (suffix === 'csv' || suffix === 'tsv') return 'csv'
        if (suffix === 'md' || suffix === 'markdown') return 'markdown'
        if (LANGUAGE_BY_EXT.has(suffix)) return 'code'
        if (suffix === '' || TEXT_SUFFIXES.has(suffix)) return 'text'
        return 'binary'
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

      /** 「打开」图标：原生 `IconRightUpOutlineRegular`（应用内打开用这个箭头，不是文件夹）。 */
      function openInAppGlyph(size = 13) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', style: { flex: 'none', color: 'inherit' } },
          h('path', {
            d: 'M11.7256 2.77441C12.5538 2.77469 13.2256 3.44616 13.2256 4.27441V10.1416H12.2256V4.27441C12.2256 3.99844 12.0015 3.77469 11.7256 3.77441H5.7207V2.77441H11.7256Z',
            fill: 'currentColor',
          }),
          h('path', { d: 'M2.77441 13.2255L12.3756 3.62427', stroke: 'currentColor', strokeWidth: 1 }))
      }

      function folderGlyph(size = 14) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M2.4 12.6V4.6a1 1 0 0 1 1-1h3l1.4 1.8h4.8a1 1 0 0 1 1 1v6.2a1 1 0 0 1-1 1H3.4a1 1 0 0 1-1-1Z', ...stroke }))
      }

      /** 文件树开关：原生 `IconFolderCloseRegular` / `IconFolderOpenRegular`。 */
      function navFolderGlyph(open) {
        const icon = open ? hostPrimitives?.IconFolderOpenRegular : hostPrimitives?.IconFolderCloseRegular
        if (icon !== undefined && icon !== null) return h(icon, null)
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round', strokeLinejoin: 'round' }
        return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16' },
          h('path', { d: 'M1.9 12.4V4.4a1 1 0 0 1 1-1h3.2l1.3 1.7h6.7a1 1 0 0 1 1 1v6.3a1 1 0 0 1-1 1H2.9a1 1 0 0 1-1-1Z', ...stroke }),
          open ? h('path', { d: 'M2.2 8.2h11.6', ...stroke }) : null)
      }

      /** 分段按钮右格的下拉箭头（原生 12px chevron-down）。 */
      function caretDownGlyph() {
        return h('svg', { width: 12, height: 12, viewBox: '0 0 12 12', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M3 4.5L6 7.5L9 4.5', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }))
      }

      function refreshGlyph() {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
        return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M13 8a5 5 0 1 1-1.6-3.7', ...stroke }),
          h('path', { d: 'M13 2.6v3h-3', ...stroke }))
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
        const paneUi = downloadUiOf(`${activePeer}:${shownPath}`, shownPath, localCopies)
        /** 预览工具条上的「显示文件位置」也在等窗口：图标转圈、tooltip 换成「正在打开…」。 */
        const paneRevealing = revealing[`${activePeer}:${shownPath}`] === true
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

      /** 面板控件：全屏（原生 SidebarRight `FullscreenGlyph` 的四角弧块，16px，非 ui-primitives 的 fullscreen-outline）。 */
      function fullscreenGlyph() {
        return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none' },
          h('path', {
            d: 'M2.33203 10.4054V13.1681C2.33229 13.444 2.55605 13.6681 2.83203 13.6681H5.49512V14.6681H2.83203C2.00376 14.6681 1.33229 13.9963 1.33203 13.1681V10.4054H2.33203ZM14.6689 13.1681C14.6687 13.996 13.9968 14.6676 13.1689 14.6681H10.4951V13.6681H13.1689C13.4445 13.6676 13.6687 13.4437 13.6689 13.1681V10.4054H14.6689V13.1681ZM13.1689 1.33118C13.9969 1.33163 14.6688 2.00315 14.6689 2.83118V5.4054H13.6689V2.83118C13.6688 2.55544 13.4446 2.33162 13.1689 2.33118H10.4951V1.33118H13.1689ZM5.49512 2.33118H2.83203C2.55598 2.33118 2.33218 2.55516 2.33203 2.83118V5.4054H1.33203V2.83118C1.33218 2.00288 2.00369 1.33118 2.83203 1.33118H5.49512V2.33118Z',
            fill: 'currentColor',
          }))
      }

      /** 面板控件：退出全屏（原生 `ExitFullscreenGlyph`）。 */
      function exitFullscreenGlyph() {
        return h('svg', { width: 15, height: 15, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor' },
          h('path', { d: 'M9 2.5V6C9 6.26522 9.10536 6.51957 9.29289 6.70711C9.48043 6.89464 9.73478 7 10 7H13.5' }),
          h('path', { d: 'M7 13.5V10C7 9.73478 6.89464 9.48043 6.70711 9.29289C6.51957 9.10536 6.26522 9 6 9H2.5' }))
      }

      /** 面板控件：收起侧边栏（原生 `IconPanelLeftOutlineRegular` 镜像；图标组件不吃 style，镜像放在外壳上）。 */
      function collapseGlyph() {
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
      function caretRightGlyph(open) {
        return h('svg', { width: 12, height: 12, viewBox: '0 0 12 12', style: { flex: 'none', color: 'inherit', transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 120ms' } },
          h('path', { d: 'M4.5 3L7.5 6L4.5 9', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }))
      }

      /** 文件夹行的 hover 三角：原生 `IconTriangleRightFillRegular`（实心、14px，展开时旋转 90°）。 */
      function triangleFillGlyph(open) {
        return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', style: { flex: 'none', display: 'block', color: 'inherit', transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 150ms var(--ds-ease-in-out, ease-in-out)' } },
          h('path', { d: 'M5.5 4.5C5.5 4.40714 5.52586 4.31612 5.57467 4.23713C5.62349 4.15815 5.69334 4.09431 5.77639 4.05279C5.85945 4.01126 5.95242 3.99368 6.0449 4.00202C6.13738 4.01036 6.22572 4.04429 6.3 4.1L10.967 7.6C11.0291 7.64657 11.0795 7.70697 11.1142 7.77639C11.1489 7.84582 11.167 7.92238 11.167 8C11.167 8.07762 11.1489 8.15418 11.1142 8.22361C11.0795 8.29303 11.0291 8.35343 10.967 8.4L6.3 11.9C6.22572 11.9557 6.13738 11.9896 6.0449 11.998C5.95242 12.0063 5.85945 11.9887 5.77639 11.9472C5.69334 11.9057 5.62349 11.8419 5.57467 11.7629C5.52586 11.6839 5.5 11.5929 5.5 11.5V4.5Z', fill: 'currentColor' }))
      }

      /** 菜单里的「重命名」：原生 `IconEditOutlineRegular` 的原路径（方框 + 斜笔），14px。 */
      function renameGlyph(size = 14) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', display: 'block', color: 'inherit' } },
          h('path', { d: 'M8.85596 2.69971H4.19971C3.37141 2.69971 2.69992 3.37146 2.69971 4.19971V11.8003C2.69992 12.6285 3.37141 13.3003 4.19971 13.3003H11.8003C12.6283 13.2999 13.3001 12.6283 13.3003 11.8003V7.89893H14.3003V11.8003C14.3001 13.1806 13.1806 14.2999 11.8003 14.3003H4.19971C2.81913 14.3003 1.69992 13.1808 1.69971 11.8003V4.19971C1.69992 2.81918 2.81913 1.69971 4.19971 1.69971H8.85596V2.69971Z', fill: 'currentColor' }),
          h('path', { d: 'M7.7849 8.23878L13.888 2.13574', fill: 'none', stroke: 'currentColor', strokeWidth: 1 }))
      }

      /** 「新会话」：原生 `IconNewChatOutlineRegular` 的原路径（气泡 + 十字），14px、1px 描边。 */
      function newChatGlyph(size = 14) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round', strokeLinejoin: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', display: 'block', color: 'inherit' } },
          h('path', { d: 'M2.37091 11.2501C1.58745 9.89288 1.32067 8.29835 1.61969 6.76006C1.91872 5.22177 2.76342 3.8433 3.99826 2.87846C5.2331 1.91362 6.77494 1.42737 8.33988 1.50925C9.90482 1.59113 11.3875 2.23562 12.5149 3.32406C13.6425 4.41269 14.3387 5.87206 14.4754 7.4334C14.612 8.99474 14.18 10.5529 13.2587 11.8209C12.3375 13.0888 10.9891 13.9813 9.46194 14.3337C8.18691 14.628 6.85895 14.5294 5.64989 14.0605C5.1712 13.8748 4.76962 13.4932 4.26534 13.3967C3.67413 13.2835 2.95257 13.5598 2.03794 14.3337', ...stroke }),
          h('path', { d: 'M8 5V11', ...stroke }),
          h('path', { d: 'M5 8H11', ...stroke }))
      }

      function searchGlyph(size = 14) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, strokeLinecap: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('circle', { cx: 7, cy: 7, r: 4.4, ...stroke }),
          h('path', { d: 'M10.4 10.4L13.6 13.6', ...stroke }))
      }

      /** 「视图选项」字形：两条带滑块的横线（原生左栏 filters 图标）。 */
      function slidersGlyph(size = 15) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M2.6 5.4h10.8', ...stroke }),
          h('circle', { cx: 6.2, cy: 5.4, r: 1.5, ...stroke }),
          h('path', { d: 'M2.6 10.6h10.8', ...stroke }),
          h('circle', { cx: 10, cy: 10.6, r: 1.5, ...stroke }))
      }

      /** 单列表字形：三行等长横线。 */
      function listGlyph(size = 14) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M2.8 4.4h10.4', ...stroke }),
          h('path', { d: 'M2.8 8h10.4', ...stroke }),
          h('path', { d: 'M2.8 11.6h10.4', ...stroke }))
      }

      /** 隐藏已归档字形：带斜杠的眼睛。 */
      function eyeOffGlyph(size = 14) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M2.4 8c1.4-2.6 3.4-4 5.6-4s4.2 1.4 5.6 4c-1.4 2.6-3.4 4-5.6 4S3.8 10.6 2.4 8Z', ...stroke }),
          h('circle', { cx: 8, cy: 8, r: 1.7, ...stroke }),
          h('path', { d: 'M3 13L13 3', ...stroke }))
      }

      /** 全部对话字形：对话气泡。 */
      function chatGlyph(size = 14) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M13.2 8.4a4.6 4.6 0 0 1-4.6 4.6H6.2L3.4 14.2v-2.4A4.6 4.6 0 0 1 8.6 3.8a4.6 4.6 0 0 1 4.6 4.6Z', ...stroke }))
      }

      /** 已归档字形：带盖的盒子。 */
      function archiveGlyph(size = 14) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinecap: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M2.6 5.4h10.8v7.2a.8.8 0 0 1-.8.8H3.4a.8.8 0 0 1-.8-.8Z', ...stroke }),
          h('path', { d: 'M2.2 2.8h11.6v2.6H2.2Z', ...stroke }),
          h('path', { d: 'M6.2 8.4h3.6', ...stroke }))
      }

      /** 返回字形：细箭头（返回远程端列表用）。 */
      function backArrowGlyph(size = 15) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M13 8H3.4', ...stroke }),
          h('path', { d: 'M7 3.8L3 8l4 4.2', ...stroke }))
      }

      /** 关闭字形（18px 内的 ×，14px 线重 1）。 */
      function closeGlyph(size = 14) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' },
          h('path', { d: 'M4 4L12 12M12 4L4 12' }))
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

      /** 插件自带资源的取用路径：pdf.js 的 worker 与 cMap/字体/wasm 仍由宿主 asset 路由提供。 */
      function assetUrlOf(name) {
        return `/api/remote-peers/asset?name=${encodeURIComponent(name)}`
      }

      /** TEMP-DIAG：渲染器没有控制台，用宿主的一条 GET 路由把排障信息写进 diag.log。 */
      function diagNote(note) {
        try {
          void fetch(`/api/remote-peers/diag?note=${encodeURIComponent(note)}`).catch(() => {
            // 排障通道自身不可用时不打扰预览主流程。
            return undefined
          })
        } catch (oops) {
          // 同上：诊断写入失败不影响渲染。
          void oops
        }
      }

      /**
       * pdfjs 引擎：构建期由 esbuild 直接打进 bundle（与主体同版本 6.3.289），运行时不再做动态导入。
       * 这里只留一条断言，避免再把「拿不到模块」的问题带进渲染层。
       */
      function pdfjsEngine() {
        const lib = typeof PDFJS?.getDocument === 'function' ? PDFJS : PDFJS?.default
        if (typeof lib?.getDocument !== 'function' || typeof lib?.PDFWorker?.create !== 'function') {
          throw new Error(`pdfjs 未打进 bundle：keys=${Object.keys(PDFJS ?? {}).slice(0, 10).join(',')}`)
        }
        return lib
      }

      /** pdf.js 的 cMap / 标准字体 / wasm 资源按文件名取字节（原生是编译期 base64 内联的同一批资源）。 */
      function pdfBinaryDataFactory() {
        return class PdfBinaryData {
          async fetch({ kind, filename }) {
            const directory = kind === 'cMapUrl'
              ? 'pdfjs/cmaps/'
              : kind === 'standardFontDataUrl'
                ? 'pdfjs/standard_fonts/'
                : 'pdfjs/wasm/'
            const response = await fetch(assetUrlOf(`${directory}${filename}`))
            if (!response.ok) throw new Error(`pdfjs 资源缺失：${kind}/${filename}`)
            return new Uint8Array(await response.arrayBuffer())
          }
        }
      }

      /**
       * 起一个普通 worker 并等它就绪。worker 源码在构建期已内联（同时去掉了 export 尾巴），
       * `WorkerMessageHandler` 的静态块会自己 `initializeFromPort(self)`。
       */
      function startPdfWorker() {
        if (typeof pdfWorkerSource !== 'string' || pdfWorkerSource.length === 0) {
          return Promise.reject(new Error('pdf.worker 源码没有内联进 bundle'))
        }
        const url = URL.createObjectURL(new Blob([
          pdfWorkerSource,
          `\nself.postMessage({ type: 'rp-pdf-ready' });\n`,
        ], { type: 'text/javascript' }))
        const worker = new Worker(url)
        const ready = new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            cleanup()
            reject(new Error('worker 启动超时'))
          }, 15000)
          const onMessage = (event) => {
            if (event?.data?.type !== 'rp-pdf-ready') return
            cleanup()
            resolve(undefined)
          }
          const onError = (event) => {
            cleanup()
            reject(new Error(`worker 启动失败：${event?.message ?? '未知错误'}`))
          }
          const cleanup = () => {
            clearTimeout(timer)
            worker.removeEventListener('message', onMessage)
            worker.removeEventListener('error', onError)
          }
          worker.addEventListener('message', onMessage)
          worker.addEventListener('error', onError)
        })
        return ready.then(() => ({ worker, url }))
      }

      /**
       * PDF 预览：与原生 `pdf/LazyPdfBody` 同一套 pdfjs 渲染（canvas + 连续滚动），
       * 工具条按主体外观自绘：页码、缩放、适应宽度、旋转、下载。
       * `url` 是本机的转发路由（对端字节流），组件自己去取字节。
       */
      function PdfPreview(input) {
        const url = input.url
        const name = input.name
        const [phase, setPhase] = useState('loading')
        const [message, setMessage] = useState('')
        const [doc, setDoc] = useState(null)
        const [zoom, setZoom] = useState(null)
        const [pageNo, setPageNo] = useState(1)
        const [width, setWidth] = useState(0)
        const [rotation, setRotation] = useState(0)
        const holderRef = useRef(null)
        const pagesRef = useRef([])
        const scrollRef = useRef(null)

        useEffect(() => {
          let alive = true
          let task = null
          let worker = null
          let workerUrl = null
          let stage = '取字节'
          diagNote(`pdf mount ${String(url).slice(0, 120)}`)
          setPhase('loading')
          setDoc(null)
          ;(async () => {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`读取失败 ${response.status}`)
            const type = response.headers.get('content-type') ?? ''
            if (type.includes('json')) {
              const body = await response.json()
              throw new Error(body?.result?.error?.message ?? body?.error?.message ?? '对端没能转换这份文档')
            }
            const bytes = new Uint8Array(await response.arrayBuffer())
            stage = '装载 pdfjs'
            const lib = await pdfjsEngine()
            // 与原生 `openPdf` 一致：自己持有 worker、等它就绪，再用 PDFWorker.create({ port }) 交给 getDocument。
            stage = '启动 worker'
            const started = await startPdfWorker()
            worker = started.worker
            workerUrl = started.url
            stage = '解析文档'
            const bridge = lib.PDFWorker.create({ port: worker })
            task = lib.getDocument({
              data: bytes,
              worker: bridge,
              BinaryDataFactory: pdfBinaryDataFactory(),
              cMapPacked: true,
              useWorkerFetch: false,
              enableXfa: false,
              stopAtErrors: true,
            })
            const loaded = await task.promise
            if (!alive) return
            setDoc(loaded)
            setPhase('ready')
          })().catch((failure) => {
            if (!alive) return
            const text = String(failure?.message ?? failure)
            diagNote(`pdf preview failed at ${stage}: ${text}`)
            setMessage(`${stage}失败：${text}${vendorTrace.length === 0 ? '' : `（${vendorTrace.slice(-2).join(' / ')}）`}`)
            setPhase('error')
          })
          return () => {
            alive = false
            diagNote('pdf unmount')
            if (task !== null) void task.destroy()
            worker?.terminate()
            if (workerUrl !== null) URL.revokeObjectURL(workerUrl)
          }
        }, [url])

        // 适应宽度：以容器可用宽度对第 1 页取比例（缩放以百分比保存，切页不改比例）。
        useEffect(() => {
          if (doc === null) return
          let cancelled = false
          ;(async () => {
            const first = await doc.getPage(1)
            if (cancelled) return
            const base = first.getViewport({ scale: 1, rotation })
            const box = holderRef.current
            const available = (box?.clientWidth ?? 640) - 48
            setWidth(available)
            setZoom((current) => current ?? Math.round((available / base.width) * 100))
          })()
          return () => { cancelled = true }
        }, [doc, rotation])

        // 逐页渲染：每页一个 canvas，按当前缩放画；页容器先按比例占位，滚动不变形。
        useEffect(() => {
          if (doc === null || zoom === null) return
          let cancelled = false
          const targets = pagesRef.current
          ;(async () => {
            for (let index = 1; index <= doc.numPages; index += 1) {
              if (cancelled) return
              const page = await doc.getPage(index)
              if (cancelled) return
              const ratio = zoom / 100
              const viewport = page.getViewport({ scale: ratio, rotation })
              const canvas = targets[index - 1]
              if (canvas === undefined) continue
              const device = window.devicePixelRatio || 1
              canvas.width = Math.floor(viewport.width * device)
              canvas.height = Math.floor(viewport.height * device)
              canvas.style.width = `${viewport.width}px`
              canvas.style.height = `${viewport.height}px`
              const context = canvas.getContext('2d')
              await page.render({
                canvasContext: context,
                viewport,
                transform: device === 1 ? undefined : [device, 0, 0, device, 0, 0],
              }).promise
            }
          })()
          return () => { cancelled = true }
        }, [doc, zoom, width, rotation])

        const total = doc === null ? 0 : doc.numPages
        const step = (delta) => setZoom((current) => Math.max(20, Math.min(400, (current ?? 100) + delta)))
        const fit = () => {
          if (doc === null) return
          void doc.getPage(1).then((page) => {
            const base = page.getViewport({ scale: 1, rotation })
            const available = (holderRef.current?.clientWidth ?? 640) - 48
            setZoom(Math.round((available / base.width) * 100))
          })
        }
        const scrollToPage = (next) => {
          const target = pagesRef.current[next - 1]
          if (target !== undefined) target.scrollIntoView({ block: 'start', behavior: 'smooth' })
        }
        const trackPage = () => {
          const scroll = scrollRef.current
          if (scroll === null) return
          const top = scroll.getBoundingClientRect().top + 12
          let current = 1
          pagesRef.current.forEach((canvas, at) => {
            if (canvas !== undefined && canvas.getBoundingClientRect().top <= top) current = at + 1
          })
          setPageNo(current)
        }

        const toolbar = h('div', { style: styles.pdfBar },
          h('button', { type: 'button', style: styles.pdfTool, title: '上一页', onClick: () => scrollToPage(Math.max(1, pageNo - 1)) }, '‹'),
          h('span', { style: styles.pdfPageNo }, total === 0 ? '—' : `${pageNo} / ${total}`),
          h('button', { type: 'button', style: styles.pdfTool, title: '下一页', onClick: () => scrollToPage(Math.min(total || 1, pageNo + 1)) }, '›'),
          h('span', { style: styles.pdfDivider }),
          h('button', { type: 'button', style: styles.pdfTool, title: '缩小', onClick: () => step(-10) }, '−'),
          h('span', { style: styles.pdfZoom }, zoom === null ? '—' : `${zoom}%`),
          h('button', { type: 'button', style: styles.pdfTool, title: '放大', onClick: () => step(10) }, '+'),
          h('span', { style: { flex: 1 } }),
          h('button', { type: 'button', style: styles.pdfTool, title: '旋转 90°', onClick: () => setRotation((current) => (current + 90) % 360) }, '⟳'),
          h('button', { type: 'button', style: styles.pdfTool, title: '适应宽度', onClick: fit }, '⇔'),
          h('a', { href: url, download: name, style: styles.pdfToolLink, title: '下载' }, '⤓'),
        )

        if (phase === 'error') {
          return h('div', { style: styles.pdfWrap },
            toolbar,
            h('div', { style: styles.pdfError }, message || '文档打开失败'),
          )
        }
        if (phase === 'loading' || doc === null) {
          return h('div', { style: styles.pdfWrap }, toolbar, renderPreviewLoading())
        }
        return h('div', { style: styles.pdfWrap },
          toolbar,
          h('div', { style: styles.pdfScroll, ref: scrollRef, onScroll: trackPage },
            h('div', { style: styles.pdfPages, ref: holderRef },
              Array.from({ length: doc.numPages }, (_, at) => h('canvas', {
                key: `${at}`,
                ref: (element) => { pagesRef.current[at] = element ?? undefined },
                style: styles.pdfCanvas,
              })),
            ),
          ),
        )
      }


      /** 图片预览：适应宽度 / 百分比缩放 / Ctrl+滚轮缩放（对齐主体 image 的缩放视口）。 */
      function ImagePreview(input) {
        const url = input.url
        const name = input.name
        const [zoom, setZoom] = useState(null)
        const [size, setSize] = useState({ width: 0, height: 0 })
        const [failed, setFailed] = useState(false)
        const boxRef = useRef(null)
        const fit = () => {
          if (size.width === 0) return
          const available = (boxRef.current?.clientWidth ?? 600) - 32
          setZoom(Math.round((available / size.width) * 100))
        }
        const step = (delta) => setZoom((current) => Math.max(10, Math.min(400), (current ?? 100) + delta))
        return h('div', { style: styles.imgWrap },
          h('div', { style: styles.pdfBar },
            h('button', { type: 'button', style: styles.pdfTool, title: '缩小', onClick: () => step(-10) }, '−'),
            h('span', { style: styles.pdfZoom }, zoom === null ? '—' : `${zoom}%`),
            h('button', { type: 'button', style: styles.pdfTool, title: '放大', onClick: () => step(10) }, '+'),
            h('button', { type: 'button', style: styles.pdfTool, title: '适应宽度', onClick: fit }, '⇔'),
            h('button', { type: 'button', style: styles.pdfTool, title: '原始大小', onClick: () => setZoom(100) }, '1:1'),
            h('span', { style: { flex: 1 } }),
            h('a', { href: url, download: name, style: styles.pdfToolLink, title: '下载' }, '⤓'),
          ),
          h('div', {
            style: styles.imgScroll,
            ref: boxRef,
            onWheel: (event) => {
              if (!event.ctrlKey) return
              event.preventDefault()
              step(event.deltaY < 0 ? 10 : -10)
            },
          },
            h('img', {
              src: url,
              alt: name,
              style: zoom === null ? styles.previewImg : { ...styles.previewImg, width: Math.round(size.width * (zoom / 100)) || undefined },
              onLoad: (event) => {
                const image = event.currentTarget
                setSize({ width: image.naturalWidth, height: image.naturalHeight })
                if (zoom === null) {
                  const available = (boxRef.current?.clientWidth ?? 600) - 32
                  setZoom(Math.round((available / (image.naturalWidth || 1)) * 100))
                }
              },
              onError: () => setFailed(true),
            }),
            failed ? h('div', { style: styles.pdfError }, '图片不可用，可能已被移动或删除') : null,
          ),
        )
      }

      /** SheetJS 引擎：构建期由 esbuild 打进 bundle（主体 Excel 预览用的就是它，0.20.3）。 */
      function xlsxEngine() {
        const lib = typeof XLSX_LIB?.read === 'function' ? XLSX_LIB : XLSX_LIB?.default
        if (typeof lib?.read !== 'function') {
          throw new Error(`SheetJS 未打进 bundle：keys=${Object.keys(XLSX_LIB ?? {}).slice(0, 10).join(',')}`)
        }
        return lib
      }

      /**
       * Excel / XLS 预览：按主体同源方案用 SheetJS 解包，再按 `excel` 工具条外观自绘网格
       * （列标 + 行号 + 表头行 + 底部 Sheet 页签）。只读，不对对端文件做任何改动。
       */
      function ExcelPreview(input) {
        const url = input.url
        const [phase, setPhase] = useState('loading')
        const [message, setMessage] = useState('')
        const [sheets, setSheets] = useState([])
        const [active, setActive] = useState(0)
        useEffect(() => {
          let alive = true
          diagNote(`xlsx mount ${String(url).slice(-60)}`)
          setPhase('loading')
          setSheets([])
          ;(async () => {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`读取失败 ${response.status}`)
            const bytes = new Uint8Array(await response.arrayBuffer())
            const lib = await xlsxEngine()
            const book = lib.read(bytes, { type: 'array', cellDates: true })
            const list = (book.SheetNames ?? []).map((sheetName) => {
              const sheet = book.Sheets[sheetName] ?? {}
              const rows = lib.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '', blankrows: false })
              const widths = (sheet['!cols'] ?? []).map((column) => (column?.wpx ?? (column?.wch === undefined ? undefined : Math.round(column.wch * 8 + 10))))
              return { name: sheetName, rows, widths }
            })
            if (!alive) return
            setSheets(list)
            setActive(0)
            setPhase('ready')
          })().catch((failure) => {
            if (!alive) return
            setMessage(String(failure?.message ?? failure))
            setPhase('error')
          })
          return () => { alive = false }
        }, [url])

        if (phase !== 'ready') {
          return h('div', { style: styles.previewCsvBody },
            phase === 'error'
              ? h('div', { style: { ...styles.previewScroller, ...styles.previewTextDoc, color: 'var(--dsw-alias-state-error-primary, #c0392b)' } }, message || '表格打开失败')
              : renderPreviewLoading(),
          )
        }
        const sheet = sheets[active] ?? { name: '', rows: [], widths: [] }
        const shown = (sheet.rows ?? []).slice(0, 400)
        const columns = Math.max(1, shown.reduce((widest, row) => Math.max(widest, row.length), 1), sheet.widths.length)
        const template = `28px ${Array.from({ length: columns }, (_, at) => {
          const width = sheet.widths[at]
          return typeof width === 'number' && width > 0 ? `${Math.max(56, Math.min(320, width))}px` : 'minmax(88px, 1fr)'
        }).join(' ')}`
        return h('div', { style: styles.previewCsvBody },
          tableFormulaBar(shown[0]?.[0]),
          tableGrid(shown, columns, template),
          h('div', { style: styles.excelTabs },
            sheets.map((item, at) => h('button', {
              key: `${at}`,
              type: 'button',
              style: at === active ? { ...styles.excelTab, ...styles.excelTabActive } : styles.excelTab,
              onClick: () => setActive(at),
            }, item.name)),
            h('span', { style: { flex: 1 } }),
            h('span', { style: styles.csvFooterText }, `${shown.length} 行 · 100%`),
          ),
        )
      }

      function renderPreviewLoading() {
        return h('div', { style: styles.previewLoading, role: 'status', 'aria-label': '文档渲染中...' },
          h('svg', { width: 28, height: 28, viewBox: '0 0 24 24', style: styles.previewSpinner, 'aria-hidden': 'true' },
            h('g', { style: styles.previewSpinnerMotion },
              h('circle', { cx: 12, cy: 12, r: 9.5, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', opacity: 0.25 }),
              h('circle', { cx: 12, cy: 12, r: 9.5, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeDasharray: '12 150', style: styles.previewSpinnerArc }),
            ),
          ),
          h('span', null, '文档渲染中...'),
        )
      }

      /** 目录项里的文件字形（文档折角，14px）。 */
      function fileGlyph(size = 14) {
        const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: { flex: 'none', color: 'inherit' } },
          h('path', { d: 'M8.6 2.4H4.6a1 1 0 0 0-1 1v9.2a1 1 0 0 0 1 1h6.8a1 1 0 0 0 1-1V6.2Z', ...stroke }),
          h('path', { d: 'M8.6 2.4V6.2h3.8', ...stroke }))
      }

      /** 文件大小（原生文件树用 B/KB/MB 的紧凑写法）。 */
      function formatBytes(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) return ''
        if (value < 1024) return `${value} B`
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
        return `${(value / 1024 / 1024).toFixed(1)} MB`
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
          const emptyUi = downloadUiOf(`${activePeer}:${file.absolutePath}`, file.absolutePath, localCopies)
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
                      return IMAGE_SUFFIXES.has(extOf(target)) ? ensureRemoteImage(target) : undefined
                    },
                  },
                })),
          )
        }
        if (mode === 'code') {
          // 主体 code 预览：按 `CODE_HIGHLIGHT_EXTENSIONS` 认语言后交给同一个高亮引擎。
          // 这里借原生 `MarkdownText` 的围栏代码块（同一套 highlight + 复制工具条）拿到一致观感。
          const language = LANGUAGE_BY_EXT.get(extOf(path)) ?? ''
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

      /**
       * 表格网格（列标 + 行号 + 单元格）：CSV 预览与 xlsx 工作表预览共用同一套外观。
       * @param shown - 已截断到可视行数的二维单元格
       * @param columns - 列数
       * @param template - `gridTemplateColumns`（首列固定行号宽）
       */
      function tableGrid(shown, columns, template) {
        const headerRow = h('div', { key: 'cols', style: { display: 'grid', gridTemplateColumns: template, position: 'sticky', top: 0, zIndex: 2 } },
          h('div', { style: { ...styles.csvColHead, position: 'static' } }, ''),
          Array.from({ length: columns }, (_, at) => h('div', { key: at, style: { ...styles.csvColHead, position: 'static' } }, columnName(at))),
        )
        const bodyRows = shown.map((row, rowIndex) => h('div', { key: rowIndex, style: { display: 'grid', gridTemplateColumns: template } },
          h('div', { style: { ...styles.csvRowHead, position: 'static' } }, String(rowIndex + 1)),
          Array.from({ length: columns }, (_, at) => h('div', { key: at, style: styles.csvCell, title: row[at] ?? '' }, row[at] ?? '')),
        ))
        return h('div', { style: styles.csvGridWrap },
          h('div', { style: styles.csvGrid }, headerRow, bodyRows),
        )
      }

      /** 表格上方的 A1 / fx 条（公式栏外观，取当前选中单元格的值）。 */
      function tableFormulaBar(value) {
        return h('div', { style: styles.csvBar },
          h('span', { style: styles.csvCellRef }, 'A1'),
          h('span', { style: styles.csvFx }, 'fx'),
          h('span', { style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, value ?? ''),
        )
      }

      /** CSV：A1 / fx 工具条 + 列标 + 行号 + 单元格网格 + 底部 `CSV 100%`（同原生表格预览外观）。 */
      function renderCsvBody(text) {
        const rows = parseCsvRows(text)
        const shown = rows.slice(0, 200)
        const columns = shown.reduce((widest, row) => Math.max(widest, row.length), 1)
        const template = `28px repeat(${columns}, minmax(72px, 1fr))`
        return h('div', { style: styles.previewCsvBody },
          tableFormulaBar(shown[0]?.[0]),
          tableGrid(shown, columns, template),
          h('div', { style: styles.csvFooter },
            h('span', null, 'CSV'),
            h('span', { style: { flex: 1 } }),
            h('span', null, '100%'),
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

      /** 12px 细叉：原生 `IconCloseFillRegular` 的尺寸与观感（静止时透明、悬停才露出来）。 */
      function closeGlyph(size = 12) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': 'true', style: { display: 'block' } },
          h('path', {
            d: 'M3.4 3.4 12.6 12.6M12.6 3.4 3.4 12.6',
            fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round',
          }))
      }

      /** 16px 三角警告：对端明说拒绝了这份附件时盖在缩略图正中。 */
      function warningGlyph(size = 16) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': 'true', style: { display: 'block' } },
          h('path', { d: 'M8 2.4 14.4 13.2H1.6Z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }),
          h('path', { d: 'M8 6.2v3.2', stroke: 'currentColor', strokeWidth: 1.3 }),
          h('circle', { cx: 8, cy: 11.3, r: 0.85, fill: 'currentColor' }))
      }

      /** 16px 重试箭头：普通上传失败时盖在缩略图正中。 */
      function retryGlyph(size = 16) {
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', 'aria-hidden': 'true', style: { display: 'block' } },
          h('path', { d: 'M13 8a5 5 0 1 1-1.5-3.6', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }),
          h('path', { d: 'M13.2 2.4v3.4h-3.4', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3 }))
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
        /** 输入框共用属性：受控值 + 自适应高度 + Enter 提交（Shift+Enter 换行）。 */
        const inputProps = (style, placeholder) => ({
          ref: inputRef, className: 'rp-composer-input', style, rows: 1, value: promptText, placeholder,
          onChange: (event) => { setPromptText(event.target.value); growComposer(event.target) },
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
            pendingCommand === null
              ? h('textarea', inputProps(styles.composerInput, '发消息或创建任务'))
              : h('div', { style: { position: 'relative' } },
                  h('span', {
                    style: { ...styles.commandToken, width: `${pendingCommand.label.length * 15 + 6}px` },
                  }, pendingCommand.label),
                  h('textarea', inputProps(
                    { ...styles.composerInput, paddingLeft: `${pendingCommand.label.length * 15 + 16}px` },
                    pendingCommand.hint,
                  )),
                ),
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
              permissionPreset === null
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
                    permissionIcon(permissionPreset, 14),
                    h('span', null, permissionLabel(permissionPreset) ?? permissionPreset),
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

      /** 发送箭头：照搬 InputBar.tsx 的 16px 实心箭头（不是描边版 send-outline）。 */
      function sendGlyph() {
        return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', style: { display: 'block' } },
          h('path', {
            d: 'M8.3125 0.980183C8.66767 1.0531 8.97902 1.20418 9.2627 1.43233C9.48724 1.61297 9.73029 1.85793 9.97949 2.10714L14.707 6.83468L13.293 8.24874L9 3.95577V15.0417H7V3.95577L2.70703 8.24874L1.29297 6.83468L6.02051 2.10714C6.26971 1.85793 6.51277 1.61297 6.7373 1.43233C6.97662 1.23986 7.28445 1.04402 7.6875 0.980183C7.8973 0.947006 8.1031 0.95516 8.3125 0.980183Z',
            fill: 'currentColor',
          }))
      }

      /** 按钮内的转圈指示器：底环 + 旋转弧，沿用原生 1.5s 周期。 */
      function spinnerGlyph(size = 12) {
        const box = { display: 'block', flex: 'none' }
        return h('svg', { width: size, height: size, viewBox: '0 0 16 16', style: box, 'aria-hidden': 'true' },
          h('g', { style: { transformOrigin: 'center', animation: 'dsh-rp-spin 1s linear infinite' } },
            h('circle', { cx: 8, cy: 8, r: 6, fill: 'none', stroke: 'currentColor', strokeOpacity: 0.3, strokeWidth: 2 }),
            h('path', { d: 'M8 2a6 6 0 0 1 6 6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' })))
      }

      /** 发送中的转圈（同 InputBar .sendingSpinner：底环 35% + 2px 弧）。 */
      function sendingGlyph() {
        return h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', style: { display: 'block' } },
          h('circle', { cx: 8, cy: 8, r: 6, fill: 'none', stroke: 'currentColor', strokeOpacity: 0.35, strokeWidth: 2 }),
          h('path', { d: 'M8 2a6 6 0 0 1 6 6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }))
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
              onMouseEnter: (event) => { event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))' },
              onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent' },
              onClick: () => {
                if (row.key === 'file') { setPlusOpen(false); fileInputRef.current?.click(); return }
                if (row.key === 'goal') {
                  setPlusOpen(false)
                  setPendingCommand({ label: '/目标', prefix: '/goal ', hint: '输入目标，智能体将持续执行…' })
                  setPromptText('')
                  setTimeout(() => inputRef.current?.focus(), 0)
                  return
                }
                if (row.key === 'plan') {
                  setPlusOpen(false)
                  setPendingCommand({ label: '/计划', prefix: '/plan ', hint: '描述你的任务以生成计划' })
                  setPromptText('')
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
          onMouseEnter: (event) => { event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))' },
          onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent' },
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
        followRef.current = following
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

      /** 回到底部的 chevron-down（14px、1.3 stroke，同 IconChevronDownOutlineRegular）。 */
      function toBottomGlyph() {
        return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' },
          h('path', { d: 'M4 6.4L8 10.4L12 6.4' }))
      }

      /** 速度文案：原生 `formatTokensPerSecond` —— ≥10 取整，否则一位小数。 */
      function speedText(value) {
        const clamped = Math.max(0, value)
        if (!(clamped > 0)) return null
        return clamped >= 10 ? `${Math.round(clamped)} tok/s` : `${Math.round(clamped * 10) / 10} tok/s`
      }

      /** 缓存命中百分比：原生 `formatCacheHitPercent` —— 可指定小数位；不足 100% 绝不写成 100。 */
      function cacheHitText(cacheRead, billedInput, decimals = 0) {
        if (!(billedInput > 0) || cacheRead === null || cacheRead === undefined) return null
        if (cacheRead >= billedInput) return '100'
        const unit = decimals === 1 ? 10 : 1
        const units = Math.round((cacheRead / billedInput) * 100 * unit)
        if (units < 100 * unit) {
          if (decimals === 0) return String(units)
          const tenths = units / 10
          return Number.isInteger(tenths) ? String(tenths) : tenths.toFixed(1)
        }
        return decimals === 1 ? '99.9' : '99'
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
            event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))'
            event.currentTarget.style.color = 'var(--dsw-alias-label-secondary, #5f6368)'
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

      /** 统计浮层里的用时：45.2 秒 / 19分6秒（原生 `formatDuration`）。 */
      function formatDurationCompact(ms) {
        const seconds = Math.max(0, ms) / 1000
        if (seconds < 60) {
          const rounded = Math.round(seconds * 10) / 10
          return `${rounded} 秒`
        }
        const whole = Math.round(seconds)
        return `${Math.floor(whole / 60)}分${whole % 60}秒`
      }

      /** 「+」控件图标：照搬 ui-primitives plus-outline（16px、stroke 1）。 */
      function plusGlyph() {
        return h('svg', {
          width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', strokeWidth: 1.3,
          style: { display: 'block' },
        },
        h('path', { d: 'M8 2V14', stroke: 'currentColor' }),
        h('path', { d: 'M2 8H14', stroke: 'currentColor' }))
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
        const values = permissionOptions.length === 0
          ? ['read-only', 'workspace-write', 'danger-full-access']
          : permissionOptions.map((option) => option.value)
        return h('div', { 'data-dsh-popup': 'permission', style: styles.permissionMenu },
          values.map((value) => h('button', {
            key: value,
            style: styles.permissionRow,
            onMouseEnter: (event) => { event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,0.05))' },
            onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent' },
            disabled: permissionBusy,
            onClick: () => {
              if (value === permissionPreset) { setPermissionOpen(false); return }
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
          value === permissionPreset ? h('span', { style: styles.permissionCheck }, '✓') : null,
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

      /** 紧凑 token 数：原生 `formatTokens` —— 100 以上取整，以下保留一位小数。 */
      function formatTokens(value) {
        const scaled = (candidate) => (candidate >= 100
          ? String(Math.round(candidate))
          : String(Math.round(candidate * 10) / 10))
        if (value < 1000) return String(value)
        if (value < 1000000) return `${scaled(value / 1000)}K`
        return `${scaled(value / 1000000)}M`
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

    /** 会话标题取自 projections.title；没有就退回 cwd 目录名。 */
    function sessionTitle(session) {
      const title = session?.projections?.values?.title
      if (typeof title === 'string' && title !== '') return title
      const cwd = typeof session?.cwd === 'string' ? session.cwd : ''
      const last = cwd.split(/[\\/]/).filter(Boolean).pop()
      return last === undefined ? session?.sessionId ?? '未命名会话' : `${last}（未命名）`
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

    /** 扩展名（小写、不含点）。 */
    function extOf(name) {
      const clean = String(name ?? '').split(/[\\/]/).pop() ?? ''
      const at = clean.lastIndexOf('.')
      return at <= 0 ? '' : clean.slice(at + 1).toLowerCase()
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

    /** CSV：支持引号、成对引号与内嵌逗号/换行，够读导出表。 */
    function parseCsvRows(text) {
      const rows = []
      let row = []
      let field = ''
      let quoted = false
      const source = String(text ?? '')
      for (let index = 0; index < source.length; index += 1) {
        const char = source[index]
        if (quoted) {
          if (char === '"' && source[index + 1] === '"') {
            field += '"'
            index += 1
          } else if (char === '"') {
            quoted = false
          } else {
            field += char
          }
          continue
        }
        if (char === '"') { quoted = true; continue }
        if (char === ',') { row.push(field); field = ''; continue }
        if (char === '\r') continue
        if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue }
        field += char
      }
      if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }
      return rows
    }

    /** 0→A、25→Z、26→AA。 */
    function columnName(index) {
      let value = index
      let name = ''
      do {
        name = String.fromCharCode(65 + (value % 26)) + name
        value = Math.floor(value / 26) - 1
      } while (value >= 0)
      return name
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
            }, () => h(RemotePeersPanel, { api, focusPeer: holder.current, onPeersChanged: syncPeers }))
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
