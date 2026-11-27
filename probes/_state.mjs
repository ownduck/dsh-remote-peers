// 探针共享取数：本机网关的密钥与状态目录不写死个人路径。
// 优先 `RP_STATE_DIR`，否则按 DSH 的约定取 `$DSH_HOME/remote-peers`。
import { readFileSync } from 'node:fs'
import { readLocalToken } from './_state.mjs'
import { join } from 'node:path'
import { readLocalToken } from './_state.mjs'

/** 本插件状态目录（`state.json` / `token` / `peers.json` 所在）。 */
export function stateDir() {
  return process.env.RP_STATE_DIR ?? join(process.env.DSH_HOME ?? '.', 'remote-peers')
}

/** 本机网关共享密钥。 */
export function readLocalToken() {
  return readFileSync(join(stateDir(), 'token'), 'utf8').trim()
}
