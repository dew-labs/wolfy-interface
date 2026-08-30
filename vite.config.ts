import {execSync} from 'node:child_process'
import crypto from 'node:crypto'
import dns from 'node:dns'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {paraglideVitePlugin} from '@inlang/paraglide-js'
import {vite as millionLintVite} from '@million/lint'
import {partytownVite} from '@qwik.dev/partytown/utils'
import pluginOptimizeLocales from '@react-aria/optimize-locales-plugin'
import {inspectorServer} from '@react-dev-inspector/vite-plugin'
import babel from '@rolldown/plugin-babel'
import replace from '@rollup/plugin-replace'
import {sentryVitePlugin} from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import {tanstackRouter} from '@tanstack/router-plugin/vite'
import {Unhead} from '@unhead/react/vite'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import {FontaineTransform} from 'fontaine'
import {humanId} from 'human-id'
import {obfuscator} from 'rollup-obfuscator'
import AutoImport from 'unplugin-auto-import/vite'
import Unfonts from 'unplugin-fonts/vite'
import turboConsole from 'unplugin-turbo-console/vite'
// import OptimizeExclude from 'vite-plugin-optimize-exclude'
// import ViteRestart from 'vite-plugin-restart'
import {defineConfig, loadEnv, type PluginOption, type UserConfig} from 'vite'
import {patchCssModules} from 'vite-css-modules'
import {imagetools as pluginImageTools} from 'vite-imagetools'
// import pluginChecker from 'vite-plugin-checker'
import circleDependency from 'vite-plugin-circular-dependency'
// import {compression} from 'vite-plugin-compression2'
import dynamicImport from 'vite-plugin-dynamic-import'
import {createHtmlPlugin} from 'vite-plugin-html'
import {ViteImageOptimizer} from 'vite-plugin-image-optimizer' // vs unplugin-imagemin?
import lqip from 'vite-plugin-lqip'
import mkcert from 'vite-plugin-mkcert'
import {optimizeCssModules} from 'vite-plugin-optimize-css-modules'
import preload from 'vite-plugin-preload'
import reactFallbackThrottlePlugin from 'vite-plugin-react-fallback-throttle'
import {robots} from 'vite-plugin-robots'
import svgr from 'vite-plugin-svgr'

import generateW from './generateW.js'
import {globsRegexes} from './globs.js'

// import packageJson from './package.json'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const commitHash = (() => {
  try {
    // eslint-disable-next-line sonarjs/no-os-command-from-path -- it's safe
    return execSync('git rev-parse --short HEAD').toString().replaceAll('\n', '')
  } catch {
    // In case we running in a non-git environment, we can use a random hash
    return crypto.randomBytes(4).toString('hex')
  }
})()
const commitHashJson = JSON.stringify(commitHash)

dns.setDefaultResultOrder('verbatim')

const fontaineOptions = {
  fallbacks: ['BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans'],
  overrideName: (name: string) => `${name} fallback`,
  sourcemap: true,
}

const oneYearAgo = (() => {
  const tmp = new Date()
  tmp.setFullYear(tmp.getFullYear() - 1)
  return tmp.toISOString().slice(0, 10)
})()

// https://vitejs.dev/config/

export function getConfig(mode: string): UserConfig {
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
  const isDevMode = mode === 'development'

  const shouldDisableSentry = process.env.DISABLE_SENTRY === 'true' || inTestOrDevMode
  const shouldUseSourceMap = !shouldDisableSentry
  const shouldEnableProfile = process.env.ENABLE_PROFILE === 'true' && mode === 'development'
  // END: Verify the environment variables

  const plugins: PluginOption[] = [
    patchCssModules(),
    {
      ...pluginOptimizeLocales.vite({
        locales: ['en-US'],
      }),
      enforce: 'pre' as const,
    },
    paraglideVitePlugin({project: './project.inlang', outdir: './src/paraglide'}),
    AutoImport({
      include: [...(globsRegexes.SCRIPT as string[])],
      ignore: [],
      imports: [
        {
          '@/utils/hooks/useStableCallback': [['default', 'useStableCallback']],
        },
        {
          '@/utils/react/deepMemo': [['default', 'deepMemo']],
        },
        {
          '@/utils/react/markAsMemoized': [['default', 'markAsMemoized']],
        },
        {
          '@/utils/react/markAsStable': [['default', 'markAsStable']],
        },
        {
          'tiny-invariant': [['default', 'invariant']],
        },
        'react',
        {
          react: [
            'use',
            'act',
            'addTransitionType',
            'cache',
            'cacheSignal',
            'createContext',
            'Suspense',
            'Fragment',
            'ViewTransition',
            'Activity',
            'Profiler',
            'useEffectEvent',
            'useOptimistic',
            'useDebugValue',
          ],
        },
        {
          'react-dom': [
            'flushSync',
            'createPortal',
            'preconnect',
            'prefetchDNS',
            'preinit',
            'preinitModule',
            'preload',
            'preloadModule',
          ],
        },
        {
          from: 'react',
          imports: [
            'MemoizedValue',
            'MemoizedCallback',
            'Memoized',
            'MemoizedProps',
            'StableValue',
            'StableCallback',
            'Stable',
            'StableDispatchSetStateAction',
            'UnwrapMemoized',
            'UnwrapStable',
            'SyntheticEvent', // base of all events, use when unsure about event type
            'ReactEventHandler',
            'UIEventHandler',
            'MouseEventHandler',
            'TouchEventHandler',
            'PointerEventHandler',
            'ChangeEventHandler',
            'KeyboardEventHandler',
            'FormEventHandler',
            'ComponentProps',
            'ComponentPropsWithRef',
            'ComponentPropsWithoutRef',
            'CustomComponentPropsWithRef',
            'PropsWithoutRef',
            'PropsWithChildren',
            'ComponentRef',
            'Ref',
            'RefObject',
            'RefCallback',
            'Dispatch',
            'SetStateAction',
            'ReactNode', // best, accepts everything React can render (all possible return values of a component)
            'JSX', // JSX.IntrinsicElements: all HTML components
            'ComponentType', // generic custom component
            'ElementType',
            'ReactElement',
            'CSSProperties',
          ],
          type: true,
        },
        'jotai',
        'jotai/utils',
        {
          jotai: ['useStore'],
        },
        {
          '@/utils/jotai/useGetAtom': [['default', 'useGetAtom']],
        },
        {
          from: 'jotai',
          imports: ['Atom', 'Getter', 'Setter'],
          type: true,
        },
        {
          from: 'jotai/vanilla/store',
          imports: ['Store'],
          type: true,
        },
        {
          'jotai-effect': ['atomEffect'],
        },
        {
          'jotai-optics': ['focusAtom'],
        },
        {
          'jotai-mutative': ['atomWithMutative', 'withMutative', 'useMutativeAtom'],
        },
        {
          'jotai-location': ['atomWithLocation', 'atomWithSearchParams', 'atomWithHash'],
        },
        {
          'use-mutative': ['useMutative', 'useMutativeReducer'],
        },
        {
          clsx: ['clsx'],
        },
        {
          'react-use': ['useLatest'],
        },
        {
          '@tanstack/react-router': [
            'Link',
            'Outlet',
            'useAwaited',
            'useBlocker',
            'useCanGoBack',
            'useChildMatches',
            'useLinkProps',
            'useLoaderData',
            'useLoaderDeps',
            'useLocation',
            'useMatch',
            'useMatchRoute',
            'useMatches',
            'useNavigate',
            'useParentMatches',
            'useParams',
            'useRouteContext',
            'useRouter',
            'useRouterState',
            'useSearch',
          ],
        },
        {
          '@tanstack/react-query': [
            'skipToken',
            'useQuery',
            'useQueries',
            'useInfiniteQuery',
            'useMutation',
            'useIsFetching',
            'useIsMutating',
            'useMutationState',
            'useSuspenseQuery',
            'useSuspenseInfiniteQuery',
            'useSuspenseQueries',
            'useQueryClient',
            'usePrefetchQuery',
            'usePrefetchInfiniteQuery',
            'useQueryErrorResetBoundary',
            'queryOptions',
            'infiniteQueryOptions',
            'QueryErrorResetBoundary',
            'QueryObserver',
            'InfiniteQueryObserver',
            'QueriesObserver',
            'focusManager',
            'onlineManager',
            'notifyManager',
            'keepPreviousData',
          ],
        },
        {
          from: '@tanstack/react-query',
          imports: [
            'QueryClient',
            'UseQueryResult',
            'UseInfiniteQueryResult',
            'UseQueryOptions',
            'UseInfiniteQueryOptions',
          ],
          type: true,
        },
        {'@iconify/react': ['Icon']},
      ],
    }),
    lqip(), // switch to blurhash?
    pluginImageTools({
      async defaultDirectives(url, metadata) {
        if (!url.toString().endsWith('image-tools')) return new URLSearchParams()

        if (url.pathname.endsWith('.svg')) throw new Error('Why would you transform SVG files?')

        const format = ['avif']
        if (['.jxl', '.heif', '.jpeg', '.jpg'].find(ext => url.pathname.endsWith(ext))) {
          format.push('jpg')
        } else if (url.pathname.endsWith('.gif')) {
          format.push('gif')
        } else {
          // 'avif', '.png', '.tiff', '.webp', ...
          format.push('png')
        }

        const as = (() => {
          if (url.toString().endsWith('picture-image-tools')) return 'picture'
          if (url.toString().endsWith('srcset-image-tools')) return 'srcset' // only take `w` directive into consideration
          if (url.toString().endsWith('metadata-image-tools')) return 'metadata'
          // if (url.toString().endsWith('inline-image-tools')) return 'inline' // do not use inline
          if (url.toString().endsWith('url-image-tools')) return 'url'
          return 'picture'
        })()

        let w = url.searchParams.get('w') ?? ''

        if (!w) {
          const rawMinW = url.searchParams.get('minW')
          const minW = rawMinW ? parseInt(rawMinW) : 500 // Default 500px

          if (minW) {
            const meta = await metadata()
            if (meta.width && meta.height) w = generateW(meta.width, meta.height, minW)
          }
        }

        return new URLSearchParams({
          // effort: 'max',
          format: format.join(';'),
          // lossless: 'true',
          // quality: '100',
          withoutEnlargement: 'true',
          w,
          as,
        })
      },
    }), // always after the lqip
    dynamicImport(),
    preload(),
    robots({}),
    Unhead({
      sourcemap: shouldUseSourceMap,
      streaming: true,
    }),
    // Tree-shaking for sentry https://docs.sentry.io/platforms/javascript/guides/react/configuration/tree-shaking/
    replace({
      preventAssignment: false,
      __SENTRY_DEBUG__: mode !== 'production',
      // __SENTRY_TRACING__: false,
      __RRWEB_EXCLUDE_IFRAME__: true,
      __RRWEB_EXCLUDE_SHADOW_DOM__: true,
      // __SENTRY_EXCLUDE_REPLAY_WORKER__: true,
    }),
    partytownVite({dest: path.join(__dirname, 'dist', '~partytown')}),
    isDevMode && turboConsole({/* options here */}),
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
    react({
      compiler: true,
    }),
    babel({
      presets: [
        [
          'jotai-babel/preset',
          {
            customAtomNames: [],
          },
        ],
      ],
      plugins: [
        inTestOrDevMode
          ? false
          : [
              'react-remove-properties',
              {properties: ['data-testid', 'data-test-id', 'data-testId', 'data-testID']},
            ],
      ].filter(Boolean),
    }),
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
    reactFallbackThrottlePlugin(),
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {floatPrecision: 2},
      },
    }),
    ViteImageOptimizer({
      // https://sharp.pixelplumbing.com/api-output/
      cache: true,
      cacheLocation: './.imageoptimizercache',
    }),
    tanstackRouter({
      target: 'react',
      // autoCodeSplitting: true,
    }),
    mkcert(),
    obfuscator({sourceMap: shouldUseSourceMap}),
    isDevMode && inspectorServer(),
    // compression(), // Useful when serve dist as static files (https://nginx.org/en/docs/http/ngx_http_gzip_static_module.html), but not when serve dist with a backend (since the backend should handle compression)
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
    tailwindcss(),
    // NOTE: enable this if you need support for legacy browsers
    // Legacy plugin need extra setup for CSP (Content Security Policy)
    legacy({
      // `terser` package must be available in the dependencies
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: [],
      modernTargets: `since ${oneYearAgo}, not dead`,
      additionalModernPolyfills: [],
      modernPolyfills: true,
    }),
    circleDependency({
      circleImportThrowErr: false,
    }),
  ].filter(Boolean)

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
        release: {
          name: `${process.env.VITE_APP_NAME}-web@${commitHash}`,
          deploy: {
            env: mode,
            name: humanId({
              separator: '-',
              capitalize: false,
            }),
          },
        },
        bundleSizeOptimizations: {
          excludeDebugStatements: true,
          excludeTracing: true,
          excludeReplayShadowDom: true,
          excludeReplayIframe: true,
          excludeReplayWorker: true,
        },
        applicationKey: process.env.VITE_APP_NAME,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        reactComponentAnnotation: {enabled: true},
        telemetry: false,
        _experiments: {injectBuildInformation: true},
        sourcemaps: {
          filesToDeleteAfterUpload: [
            './**/*.map',
            '.*/**/public/**/*.map',
            './dist/**/client/**/*.map',
          ],
        },
      }) as PluginOption,
    )
  }

  const publicEnv = Object.keys(process.env)
    .filter(key => key.startsWith('VITE_'))
    .reduce(
      // @ts-expect-error - it's ok to assign to the object
      // eslint-disable-next-line no-sequences -- it's ok
      (pre, cur) => ((pre[`import.meta.env.${cur}`] = JSON.stringify(process.env[cur])), pre),
      {},
    )

  console.log(publicEnv)

  return {
    ssr: {
      noExternal: ['react-use'],
    },
    define: {
      global: 'globalThis',
      __COMMIT_HASH__: commitHashJson,
      ...publicEnv,
    },
    build: {
      sourcemap: shouldUseSourceMap && 'hidden',
      // manifest: true,
      // ssrManifest: true,
      // ssr: true,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{name: 'sentry', test: /@sentry\/react?/}],
          },
        },
      },
      target: 'baseline-widely-available',
      cssMinify: 'lightningcss',
    },
    oxc: {},
    optimizeDeps: {},
    css: {
      preprocessorMaxWorkers: true, // number of CPUs minus 1
      devSourcemap: shouldUseSourceMap,
      transformer: 'lightningcss',
      lightningcss: {
        cssModules: {},
      },
    },
    html: {
      additionalAssetSources: {
        img: {srcAttributes: ['data-src-dark', 'data-src-light']},
      },
    },
    plugins,
    resolve: {
      tsconfigPaths: true,
      alias: {
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
    },
    server: {
      open: true,
      host: '0.0.0.0',
      proxy: {
        '/api': {target: process.env.VITE_API_URL, changeOrigin: true, cookieDomainRewrite: ''},
      },
      cors: false,
    },
    assetsInclude: ['**/*.lottie'],
    devtools: {enabled: false},
  }
}

export default defineConfig(({mode}) => getConfig(mode))
