import {execSync} from 'node:child_process'
import dns from 'node:dns'
import path from 'node:path'

import {vite as millionLintVite} from '@million/lint'
import {partytownVite} from '@qwik.dev/partytown/utils'
import pluginOptimizeLocales from '@react-aria/optimize-locales-plugin'
import {inspectorServer} from '@react-dev-inspector/vite-plugin'
import replace from '@rollup/plugin-replace'
import {sentryVitePlugin} from '@sentry/vite-plugin'
import {TanStackRouterVite} from '@tanstack/router-vite-plugin'
import UnheadVite from '@unhead/addons/vite'
// import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react-swc'
// import react from '@vitejs/plugin-react'
import {FontaineTransform} from 'fontaine'
import {obfuscator} from 'rollup-obfuscator'
import AutoImport from 'unplugin-auto-import/vite'
import Unfonts from 'unplugin-fonts/vite'
import turboConsole from 'unplugin-turbo-console/vite'
// import OptimizeExclude from 'vite-plugin-optimize-exclude'
// import ViteRestart from 'vite-plugin-restart'
import {defineConfig, loadEnv, type PluginOption} from 'vite'
// import pluginChecker from 'vite-plugin-checker'
import {compression} from 'vite-plugin-compression2'
import dynamicImport from 'vite-plugin-dynamic-import'
import {createHtmlPlugin} from 'vite-plugin-html'
import {ViteImageOptimizer} from 'vite-plugin-image-optimizer' // vs unplugin-imagemin?
import lqip from 'vite-plugin-lqip'
import mkcert from 'vite-plugin-mkcert'
import {optimizeCssModules} from 'vite-plugin-optimize-css-modules'
import preload from 'vite-plugin-preload'
import {robots} from 'vite-plugin-robots'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import globs from './globs.js'

// import packageJson from './package.json'

const commitHash = JSON.stringify(
  // eslint-disable-next-line sonarjs/no-os-command-from-path -- it's safe
  execSync('git rev-parse --short HEAD').toString().replaceAll('\n', ''),
)

dns.setDefaultResultOrder('verbatim')

const fontaineOptions = {
  fallbacks: ['BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans'],
  overrideName: (name: string) => `${name} fallback`,
  sourcemap: true,
}

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const dotEnv = loadEnv(mode, process.cwd(), '')
  process.env = {...process.env, ...dotEnv}

  // MARK: Verify the environment variables
  // how about validate with `@julr/vite-plugin-validate-env` ?
  if (!process.env.VITE_APP_NAME) {
    throw new Error('VITE_APP_NAME is required')
  }
  if (!process.env.VITE_API_URL) {
    throw new Error('VITE_API_URL is required')
  }
  if (!process.env.VITE_APP_TITLE) {
    throw new Error('VITE_APP_TITLE is required')
  }
  if (!process.env.VITE_APP_DESCRIPTION) {
    throw new Error('VITE_APP_DESCRIPTION is required')
  }

  const inTestOrDevMode = ['test', 'benchmark', 'development'].includes(mode)

  const shouldDisableSentry = process.env.DISABLE_SENTRY === 'true' || inTestOrDevMode
  const shouldEnableProfile = process.env.ENABLE_PROFILE === 'true' && mode === 'development'
  // END: Verify the environment variables

  const optimizeLocales = pluginOptimizeLocales.vite({locales: ['en-US']})

  if (Array.isArray(optimizeLocales)) {
    optimizeLocales.forEach(plugin => {
      plugin.enforce = 'pre' as const
    })
  } else {
    optimizeLocales.enforce = 'pre' as const
  }

  const plugins = [
    optimizeLocales,
    AutoImport({
      include: [...globs.SCRIPT],
      ignore: [],
      imports: [
        'react',
        'jotai',
        'react-i18next',
        {clsx: ['clsx']},
        {'react-use': ['useLatest']},
        {react: ['Suspense', 'createContext', 'use']},
        {
          from: 'react',
          imports: [
            'PropsWithChildren',
            'ChangeEventHandler',
            'MemoizedCallback',
            'MemoizedCallbackOrDispatch',
          ],
          type: true,
        },
      ],
    }) as PluginOption,
    lqip(), // switch o blurhash?
    dynamicImport(),
    preload(),
    robots({}),
    UnheadVite(),
    // Tree-shaking for sentry https://docs.sentry.io/platforms/javascript/guides/react/configuration/tree-shaking/
    replace({
      preventAssignment: false,
      __SENTRY_DEBUG__: mode !== 'production',
      // __SENTRY_TRACING__: false,
      __RRWEB_EXCLUDE_IFRAME__: true,
      __RRWEB_EXCLUDE_SHADOW_DOM__: true,
      // __SENTRY_EXCLUDE_REPLAY_WORKER__: true,
    }),
    tsconfigPaths(),
    partytownVite({dest: path.join(__dirname, 'dist', '~partytown')}),
    turboConsole({
      /* options here */
    }),
    createHtmlPlugin({
      minify: true,
      /**
       * After writing entry here, you will not need to add script tags in `index.html`, the original tags need to be deleted
       */
      entry: 'src/main.tsx',
      /**
       * Data that needs to be injected into the index.html ejs template
       */
      inject: {
        data: {
          title: process.env.VITE_APP_TITLE,
          description: process.env.VITE_APP_DESCRIPTION,
          ogImage: '/og.jpg',
          gtagTagId: process.env.GA_TAG_ID,
        },
        tags: [
          /**
           * Inject <div id='root'/> to body of `index.html`
           */
          {injectTo: 'body-prepend', tag: 'div', attrs: {id: 'root'}},
        ],
      },
    }),
    millionLintVite({enabled: shouldEnableProfile}),
    // SWC React
    react({
      plugins: [
        ['@swc-jotai/debug-label', {}],
        ['@swc-jotai/react-refresh', {}],
        inTestOrDevMode
          ? false
          : [
              '@swc/plugin-react-remove-properties',
              {
                // The regexes defined here are processed in Rust so the syntax is different from
                // JavaScript `RegExp`s. See https://docs.rs/regex.
                properties: ['^data-testid$', '^data-test-id$'], // Remove `data-testid` and `data-test-id`
              },
            ],
      ].filter(Boolean),
    }),
    // Babel React for react compiler
    // react({
    //   babel: {
    //     plugins: [
    //       [
    //         'babel-plugin-react-compiler',
    //         {
    //           // compilationMode: 'annotation',
    //         },
    //       ],
    //       ['jotai/babel/plugin-debug-label', {}],
    //       ['jotai/babel/plugin-react-refresh', {}],
    //       [
    //         'react-remove-properties',
    //         {properties: ['data-testid', 'data-test-id', 'data-testId', 'data-testID']},
    //       ],
    //     ],
    //   },
    // }),
    // process.env.VITEST
    //   ? undefined
    //   : pluginChecker({
    //       typescript: true,
    //       eslint: {
    //         lintCommand: packageJson.scripts['base:lint:script'],
    //         useFlatConfig: true,
    //       },
    //       // TODO: fix stylelint error
    //       // stylelint: {
    //       //   lintCommand: packageJson.scripts['base:lint:style'],
    //       // },
    //       overlay: {
    //         initialIsOpen: false,
    //       },
    //     }),
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {floatPrecision: 2},
      },
    }),
    ViteImageOptimizer({cache: true, cacheLocation: './.imageoptimizercache'}),
    TanStackRouterVite(),
    mkcert(),
    obfuscator({sourceMap: true}),
    inspectorServer(),
    compression(), // Useful when serve dist as static files (https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html), but not when serve dist with a backend (since the backend should handle compression)
    optimizeCssModules(),
    Unfonts({
      // Fontsource API
      fontsource: {
        /**
         * Fonts families lists
         */
        families: [
          // families can be either strings (load default font set)
          // Require the `@fontsource/abeezee` package to be installed.
          'Geist Sans',
          'Geist Mono',
          // {
          //   /**
          //    * Name of the font family.
          //    * Require the `@fontsource/roboto` package to be installed.
          //    */
          //   name: 'Roboto',
          //   /**
          //    * Load only a subset of the font family.
          //    */
          //   weights: [400, 700],
          //   /**
          //    * Restrict the font styles to load.
          //    */
          //   styles: ['italic', 'normal'],
          //   /**
          //    * Use another font subset.
          //    */
          //   subset: 'latin-ext',
          // },
          // {
          //   /**
          //    * Name of the font family.
          //    * Require the `@fontsource-variable/cabin` package to be installed.
          //    */
          //   name: 'Cabin',
          //   /**
          //    * When using variable fonts, you can choose which axes to load.
          //    */
          //   variable: {
          //     wght: true,
          //     slnt: true,
          //     ital: true,
          //   },
          // },
        ],
      },
      google: {
        preconnect: true,
        display: 'block',
        injectTo: 'head',
        families: [
          {name: 'Pixelify Sans', styles: 'wght@400..700', defer: true},
          {name: 'Silkscreen', styles: 'wght@400;700', defer: true},
        ],
      },
    }),
    FontaineTransform.vite(fontaineOptions),
    // NOTE: enable this if you need support for legacy browsers
    // Legacy plugin need extra setup for CSP (Content Security Policy)
    // legacy({
    //   // `terser` package must be available in the dependencies
    //   targets: ['defaults', 'not IE 11'],
    // }),
  ]

  // Put the Sentry vite plugin after all other plugins
  if (!shouldDisableSentry) {
    if (!process.env.SENTRY_AUTH_TOKEN) {
      throw new Error('SENTRY_AUTH_TOKEN is required')
    }

    if (!process.env.SENTRY_ORG) {
      throw new Error('SENTRY_ORG is required')
    }

    if (!process.env.SENTRY_PROJECT) {
      throw new Error('SENTRY_PROJECT is required')
    }

    plugins.push(
      sentryVitePlugin({
        // release: '',
        applicationKey: process.env.VITE_APP_NAME,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        reactComponentAnnotation: {enabled: true},
        telemetry: false,
        _experiments: {injectBuildInformation: true},
      }) as PluginOption,
    )
  }

  return {
    define: {__COMMIT_HASH__: commitHash},
    build: {
      sourcemap: true,
      // manifest: true,
      // ssrManifest: true,
      // ssr: true,
      rollupOptions: {output: {manualChunks: {sentry: ['@sentry/react']}}},
      target: 'esnext',
    },
    optimizeDeps: {
      esbuildOptions: {target: 'esnext', define: {global: 'globalThis'}, supported: {bigint: true}},
    },
    css: {
      preprocessorMaxWorkers: true, // number of CPUs minus 1
      devSourcemap: true,
      preprocessorOptions: {
        scss: {api: 'modern-compiler', sourceMap: true, sourceMapIncludeSources: true},
      },
    },
    json: {stringify: true},
    plugins,
    resolve: {alias: [{find: '@', replacement: '/src'}]},
    server: {
      open: true,
      host: '0.0.0.0',
      proxy: {
        '/api': {target: process.env.VITE_API_URL, changeOrigin: true, cookieDomainRewrite: ''},
      },
      cors: false,
    },
    assetsInclude: ['**/*.lottie'],
  }
})
