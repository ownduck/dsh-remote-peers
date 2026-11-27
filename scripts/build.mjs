/**
 * 构建 Client 面：把 src/client.js 连同第三方渲染库（pdfjs-dist / xlsx）打成一个
 * `lib/client.js`，外壳与参考插件（dsh-skill-experts / dsh-custom-env）一致：
 * `window.__ModuleLoader__.load({ id, factory: (require) => … })`，format cjs。
 *
 * 这样运行时不再有「动态导入拿不到命名空间」的问题，插件分发也不需要对方装 npm 依赖。
 */
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(join(root, 'lib'), { recursive: true })

/** pdf.js 的 worker 源码在构建期内联成字符串（去掉 ESM 的 export 尾巴，普通 worker 可直接跑）。 */
const vendorTextPlugin = {
  name: 'vendor-text',
  setup(build) {
    build.onLoad({ filter: /pdf\.worker\.min\.mjs$/ }, (args) => ({
      contents: readFileSync(args.path, 'utf8')
        .replaceAll('import.meta.url', '"about:blank"')
        .replace(/export\s*\{[^}]*\}\s*;?\s*$/u, ''),
      loader: 'text',
    }))
  },
}

const result = await esbuild.build({
  absWorkingDir: root,
  entryPoints: [join(root, 'src', 'client.js')],
  outfile: join(root, 'lib', 'client.js'),
  bundle: true,
  platform: 'browser',
  format: 'cjs',
  target: 'es2022',
  minify: false,
  sourcemap: false,
  // 宿主注入的模块保持外部引用；其余（pdfjs-dist、xlsx）全部打进 bundle。
  external: [
    'react',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'react-dom',
    'react-dom/client',
    '@deepseek-ai/cordis',
    '@deepseek-ai/dsh-api-remotes/client',
    '@deepseek-ai/dsh-client-locale/client',
    '@deepseek-ai/dsh-client-ui-layout/client',
    '@deepseek-ai/dsh-client-ui-renderer/client',
    '@deepseek-ai/dsh-client-ui-primitives',
    '@deepseek-ai/dsh-client-ui-slots',
  ],
  logLevel: 'info',
  plugins: [vendorTextPlugin],
  banner: {
    js: [
      'window.__ModuleLoader__.load({',
      '  id: "dsh-remote-peers",',
      '  factory: (require) => {',
      'var module = { exports: {} };',
      'var exports = module.exports;',
      'Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });',
    ].join('\n'),
  },
  footer: {
    js: 'return module.exports;\n  },\n});',
  },
})

if (result.errors.length > 0) {
  process.exitCode = 1
} else {
  process.stdout.write('build: wrote lib/client.js\n')
}
