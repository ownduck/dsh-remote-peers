/** 会话语义层：模型/权限/预设选择、事件指标折叠、过程行标签与统计口径的格式化（纯函数）。 */
/** provider/model 的人类可读名字。 */
export function modelNameOf(nextCatalog, selection) {
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
export function permissionLabel(value) {
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
export function permissionOf(events) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const preset = events[index]?.data?.preset
    if (events[index]?.type === 'permission/preset' && typeof preset === 'string') return preset
  }
  return null
}

/** 预设 id → 显示名。内置预设宿主不给 name，用宿主自带的中文名。 */
export function presetNameOf(id, roster) {
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

/** 会话当前模型选择：优先取最近一次 request/header 的 config，其次消息 source。 */
export function selectionOf(events, nextCatalog) {
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
export function metricsOf(events) {
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
export function effortOf(events) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const effort = events[index]?.data?.header?.config?.reasoningEffort
    if (typeof effort === 'string' && effort !== '') return effort
  }
  return undefined
}

/** 工具名 → 第二层每行前面的标签（原生 `message.stepProcess.done.*` 的单项写法）。 */
export function processToolLabelOf(name) {
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
export function processToolKind(name) {
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
export function processKindLabelOf(cat) {
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
export function processToolSummary(event) {
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

/** 预览卡里的单行化文本：压掉换行与多余空白。 */
export function oneLine(text) {
  return String(text ?? '').replace(/\s+/gu, ' ').trim().slice(0, 600)
}

/** 速度文案：原生 `formatTokensPerSecond` —— ≥10 取整，否则一位小数。 */
export function speedText(value) {
  const clamped = Math.max(0, value)
  if (!(clamped > 0)) return null
  return clamped >= 10 ? `${Math.round(clamped)} tok/s` : `${Math.round(clamped * 10) / 10} tok/s`
}

/** 缓存命中百分比：原生 `formatCacheHitPercent` —— 可指定小数位；不足 100% 绝不写成 100。 */
export function cacheHitText(cacheRead, billedInput, decimals = 0) {
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

/** 紧凑 token 数：原生 `formatTokens` —— 100 以上取整，以下保留一位小数。 */
export function formatTokens(value) {
  const scaled = (candidate) => (candidate >= 100
    ? String(Math.round(candidate))
    : String(Math.round(candidate * 10) / 10))
  if (value < 1000) return String(value)
  if (value < 1000000) return `${scaled(value / 1000)}K`
  return `${scaled(value / 1000000)}M`
}

/** 精确 token 数：带千分位（原生 `formatExactTokens` 用 locale 分组符）。 */
export function formatExactTokens(value) {
  return String(Math.max(0, Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/gu, ',')
}

/** 统计浮层里的用时：45.2 秒 / 19分6秒（原生 `formatDuration`）。 */
export function formatDurationCompact(ms) {
  const seconds = Math.max(0, ms) / 1000
  if (seconds < 60) {
    const rounded = Math.round(seconds * 10) / 10
    return `${rounded} 秒`
  }
  const whole = Math.round(seconds)
  return `${Math.floor(whole / 60)}分${whole % 60}秒`
}
