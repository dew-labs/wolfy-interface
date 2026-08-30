// TODO: using .ts config file https://eslint.org/docs/head/use/configure/configuration-files#typescript-configuration-files
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {fixupConfigRules} from '@eslint/compat'
import {FlatCompat} from '@eslint/eslintrc'
import eslint from '@eslint/js'
import pluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import restrictedGlobals from 'confusing-browser-globals'
import {defineConfig, globalIgnores} from 'eslint/config'
import pluginGitignore from 'eslint-config-flat-gitignore'
import {configs as pluginDependConfigs} from 'eslint-plugin-depend'
// import {plugin as pluginExceptionHandling} from 'eslint-plugin-exception-handling'
import {createNodeResolver, flatConfigs as pluginImportXConfigs} from 'eslint-plugin-import-x'
import pluginJsdoc from 'eslint-plugin-jsdoc'
import {configs as pluginJsoncConfigs} from 'eslint-plugin-jsonc'
import {configs as pluginMathConfigs} from 'eslint-plugin-math'
import pluginNoBarrelFiles from 'eslint-plugin-no-barrel-files'
import pluginNoOnlyTests from 'eslint-plugin-no-only-tests'
import pluginNoRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import pluginNoSecrets from 'eslint-plugin-no-secrets' // TODO: Leave this functionality for another step?
import pluginNoUseExtendNative from 'eslint-plugin-no-use-extend-native'
import pluginPromise from 'eslint-plugin-promise'
import {configs as pluginRegexpConfigs} from 'eslint-plugin-regexp'
// import pluginRemeda from 'eslint-plugin-remeda'
import pluginSecurity from 'eslint-plugin-security'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginSonarjs from 'eslint-plugin-sonarjs'
// import pluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'

import {extractAutoImportedReactComponents} from './extractAutoImports.js'
import globs from './globs.js'
import packageJson from './package.json' with {type: 'json'}
import {CAMEL_CASE} from './regexes.js'

const flatCompat = new FlatCompat({baseDirectory: path.dirname(fileURLToPath(import.meta.url))})

//------------------------------------------------------------------------------

const CONFIGS = {
  WEB: true,
  TYPESCRIPT: true,
  REACT: true,
  NEW_JSX_TRANSFORM: true, // the new JSX transform from React 17
  REACT_NATIVE: false,
  EXPO: false,
  CSS_MODULES: false,
  TAILWINDCSS: true,
  I18N: true,
  ICU_MESSAGE_FORMAT: false,
  NEXT_JS: fs.existsSync('next.config.js') || fs.existsSync('next.config.ts'),
  TEST: true,
  VITEST: true,
  PRETTIER: false,
  PNPM_WORKSPACES_CATALOGS: false,
  TANSTACK: {
    QUERY: true,
    ROUTER: true,
  },
  SONARQUBE_OR_SONAR_CLOUD: false,
  UNHEAD: true,
  LIBRARY: false,
}

const GLOBAL_IGNORES = [
  '.agent/',
  '.agents/',
  'public/*',
  '**/*.gen.ts',
  'vitest.config.ts.timestamp*',
  'src/paraglide/**/*',
]

//------------------------------------------------------------------------------

const expoConfig = CONFIGS.EXPO
  ? await import('eslint-config-expo/flat.js').then(module => module.default)
  : undefined
const pluginI18nJson = CONFIGS.ICU_MESSAGE_FORMAT
  ? await import('eslint-plugin-i18n-json').then(module => module.default)
  : undefined
const pluginReact = CONFIGS.REACT
  ? await import('eslint-plugin-react').then(module => module.default)
  : undefined
const pluginReactX = CONFIGS.REACT
  ? await import('@eslint-react/eslint-plugin').then(module => module.default)
  : undefined
const pluginReactCompiler = CONFIGS.REACT
  ? await import('eslint-plugin-react-compiler').then(module => module.default)
  : undefined
const pluginReactHooks = CONFIGS.REACT
  ? await import('eslint-plugin-react-hooks').then(module => module.default)
  : undefined
const pluginReactHooksAddons = CONFIGS.REACT
  ? await import('eslint-plugin-react-hooks-addons').then(module => module.default)
  : undefined
const pluginReactPerf = CONFIGS.REACT
  ? await import('eslint-plugin-react-perf').then(module => module.default)
  : undefined
const pluginJsxA11y = CONFIGS.REACT
  ? await import('eslint-plugin-jsx-a11y').then(module => module.default)
  : undefined
const {reactRefresh} = CONFIGS.REACT ? await import('eslint-plugin-react-refresh') : undefined
const pluginReactYouMightNotNeedAnEffect = CONFIGS.REACT
  ? await import('eslint-plugin-react-you-might-not-need-an-effect').then(module => module.default)
  : undefined
const pluginVitest = CONFIGS.VITEST
  ? await import('@vitest/eslint-plugin').then(module => module.default)
  : undefined
const {createTypeScriptImportResolver, defaultExtensions} = CONFIGS.TYPESCRIPT
  ? await import('eslint-import-resolver-typescript')
  : undefined
const tsEslint = CONFIGS.TYPESCRIPT ? await import('typescript-eslint') : undefined
const eslintPluginBetterTailwindcss = CONFIGS.TAILWINDCSS
  ? await import('eslint-plugin-better-tailwindcss').then(module => module.default)
  : undefined
const {getDefaultSelectors} = CONFIGS.TAILWINDCSS
  ? await import('eslint-plugin-better-tailwindcss/defaults')
  : undefined
const {SelectorKind} = CONFIGS.TAILWINDCSS
  ? await import('eslint-plugin-better-tailwindcss/types')
  : undefined
const pluginCssModules = CONFIGS.CSS_MODULES
  ? await import('eslint-plugin-css-modules').then(module => module.default)
  : undefined
const pluginI18next = CONFIGS.I18N
  ? await import('eslint-plugin-i18next').then(module => module.default)
  : undefined
const pluginJestDom =
  CONFIGS.TEST && CONFIGS.WEB
    ? await import('eslint-plugin-jest-dom').then(module => module.default)
    : undefined
const pluginTestingLibrary = CONFIGS.TEST
  ? await import('eslint-plugin-testing-library').then(module => module.default)
  : undefined
const pluginPrettierRecommended = CONFIGS.PRETTIER
  ? await import('eslint-plugin-prettier/recommended').then(module => module.default)
  : undefined
const pluginPnpmConfigs = CONFIGS.PNPM_WORKSPACES_CATALOGS
  ? await import('eslint-plugin-pnpm').then(module => module.configs)
  : undefined
const pluginQuery = CONFIGS.TANSTACK.QUERY
  ? await import('@tanstack/eslint-plugin-query').then(module => module.default)
  : undefined
const pluginRouter = CONFIGS.TANSTACK.ROUTER
  ? await import('@tanstack/eslint-plugin-router').then(module => module.default)
  : undefined
const pluginUnheadConfigs = CONFIGS.UNHEAD
  ? await import('@unhead/eslint-plugin').then(module => module.configs)
  : undefined

function createApplyTo(include, exclude = []) {
  const withTarget = (config, name) => ({
    ...config,
    name,
    files: [...include, ...(config.files ?? [])],
    ignores: [...exclude, ...(config.ignores ?? [])],
  })

  return (name, configs, enabled = true) => {
    if (!enabled) {
      return []
    }

    if (Array.isArray(configs)) {
      if (configs.length > 1) {
        return configs.map((cfg, index) => withTarget(cfg, `${name}-${index}`))
      }
    }

    const config = Array.isArray(configs) ? configs.at(0) : configs

    return [withTarget(config, name)]
  }
}

const applyTo = {
  all: createApplyTo(globs.SCRIPT_AND_JSONS),
  script: createApplyTo(globs.SCRIPT),
  scriptNotTest: createApplyTo(globs.SCRIPT, globs.TEST),
  json: createApplyTo(globs.JSON, globs.NOT_JSON),
  jsonc: createApplyTo(globs.JSONC),
  json5: createApplyTo(globs.JSON5),
  jsonC5: createApplyTo(globs.JSONC5),
  translations: createApplyTo(globs.TRANSLATIONS),
  typescript: createApplyTo(globs.TYPESCRIPT),
  javascript: createApplyTo(globs.JAVASCRIPT),
  react: createApplyTo(globs.REACT),
  reactHooks: createApplyTo(globs.REACT_HOOKS, globs.ROUTES),
  reactComponents: createApplyTo(globs.REACT_COMPONENTS, globs.ROUTES),
  routes: createApplyTo(globs.ROUTES),
  javascriptReact: createApplyTo(globs.REACT_JAVASCRIPT),
  typescriptReact: createApplyTo(globs.REACT_TYPESCRIPT),
  test: createApplyTo(globs.TEST, globs.TEST_2E2),
  testType: createApplyTo(globs.TEST_TYPE),
  testNotReact: createApplyTo(globs.TEST_NOT_REACT, globs.TEST_2E2),
  testReact: createApplyTo(globs.TEST_REACT, globs.TEST_2E2),
  testE2E: createApplyTo(globs.TEST_2E2),
  commonjs: createApplyTo(globs.COMMONJS),
}

//------------------------------------------------------------------------------

function getIgnoreConfigs() {
  return [
    pluginGitignore({
      root: true,
      files: ['.gitignore'],
      strict: false,
    }),
    globalIgnores(GLOBAL_IGNORES),
  ]
}

function getCoreConfigs() {
  return [
    ...applyTo.all('core/recommended', eslint.configs.recommended),
    ...applyTo.all('core/custom', {
      rules: {
        'no-restricted-globals': ['error'].concat(restrictedGlobals),
        'camelcase': ['error', {allow: ['contract_address']}],
        'grouped-accessor-pairs': 'error',
        'accessor-pairs': 'error',
        // 'default-case': ['error', {commentPattern: '^skip\\sdefault'}],
        // 'default-case-last': 'error', // Already supported by sonarjs/prefer-default-last
        // 'default-param-last': 'error',
        'no-promise-executor-return': 'error',
        'no-self-compare': 'error',
        'no-template-curly-in-string': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-await-in-loop': 'error',
        'require-atomic-updates': 'error',
        'eqeqeq': 'error',
        'func-name-matching': 'error',
        'func-names': ['error', 'as-needed'],
        'no-caller': 'error',
        'no-console': ['warn', {allow: ['warn', 'error', 'info']}],
        'no-div-regex': 'error',
        'no-else-return': 'error',
        'no-eval': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        'no-label-var': 'error',
        'no-implicit-coercion': ['error', {allow: ['!!', '~']}],
        'no-return-assign': 'error',
        'no-lone-blocks': 'error',
        'no-lonely-if': 'error',
        'no-loop-func': 'error',
        'no-new': 'error',
        'no-invalid-this': 'error',
        'no-implicit-globals': 'error',
        // 'no-magic-numbers': 'error',
        'no-multi-assign': 'error',
        'no-negated-condition': 'error',
        'no-nested-ternary': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-proto': 'error',
        'no-object-constructor': 'error',
        'no-octal-escape': 'error',
        // 'no-param-reassign': 'error',
        'no-script-url': 'error',
        'no-sequences': ['error', {allowInParentheses: true}],
        // 'no-shadow': 'error',
        'no-undef-init': 'error', // TODO: migrate to `unicorn/no-useless-undefined`
        'no-unneeded-ternary': 'error',
        'no-useless-call': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-concat': 'error',
        'no-useless-rename': 'error',
        'no-useless-return': 'error',
        'no-bitwise': 'error',
        'no-implied-eval': 'error',
        'no-unused-expressions': 'error',
        // 'new-cap': 'error',
        'object-shorthand': 'error',
        'prefer-exponentiation-operator': 'error',
        'prefer-named-capture-group': 'error',
        'prefer-object-spread': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'prefer-template': 'error',
        'prefer-object-has-own': 'error',
        'prefer-promise-reject-errors': 'error',
        'guard-for-in': 'error',
        'symbol-description': 'error',
        'yoda': 'error',
      },
    }),
    ...applyTo.all('core/security', pluginSecurity.configs.recommended),
    ...applyTo.all('core/promise', pluginPromise.configs['flat/recommended']),
    ...applyTo.all('core/promise/custom', {
      rules: {
        'promise/always-return': ['warn', {ignoreLastCallback: true}],
        'promise/no-callback-in-promise': [
          'warn',
          {
            exceptions: ['process.nextTick', 'setImmediate', 'setTimeout'],
          },
        ],
      },
    }),
    ...applyTo.all('core/import-x', pluginImportXConfigs.recommended),
    ...applyTo.all('core/import-x/custom', {
      settings: {
        'import-x/extensions': ['.js', '.jsx', '.cjs', '.mjs'],
        'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
        'import/resolver-next': [
          createNodeResolver({
            extensions: [
              '.js',
              ...(CONFIGS.REACT_NATIVE ? ['.web.js', '.ios.js', '.android.js'] : []),
            ],
          }),
        ],
        'import-x/cache': {
          lifetime: Number.POSITIVE_INFINITY,
        },
      },
      rules: {
        'import-x/no-unresolved': 'off', // will always contain false positives due to module resolution complexity
        'import-x/order': 'off',
        'import-x/namespace': 'off',
        'import-x/no-mutable-exports': 'error',
        'import-x/no-cycle': [
          'warn',
          {
            ignoreExternal: true,
          },
        ],
        'import-x/no-named-as-default': 'off', // lag
      },
    }),
    ...applyTo.all('core/no-use-extend-native', pluginNoUseExtendNative.configs.recommended),
    ...applyTo.all('core/eslint-comments', {
      ...pluginEslintComments.configs.recommended,
      // workaround for https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/215
      plugins: {
        '@eslint-community/eslint-comments': pluginEslintComments,
      },
    }),
    ...applyTo.all('core/eslint-comments/custom', {
      rules: {
        '@eslint-community/eslint-comments/require-description': [
          'error',
          {ignore: ['eslint-enable']},
        ],
      },
    }),
    {
      name: 'core/eslint-comments/special',
      rules: {
        '@eslint-community/eslint-comments/disable-enable-pair': 'off',
        '@eslint-community/eslint-comments/no-unlimited-disable': 'off',
        '@eslint-community/eslint-comments/require-description': 'off',
      },
      files: ['auto-imports.d.ts'],
    },
    ...applyTo.all('core/regexp', pluginRegexpConfigs.recommended),
    ...applyTo.all('core/depend', pluginDependConfigs['flat/recommended']),
    ...(CONFIGS.SONARQUBE_OR_SONAR_CLOUD
      ? []
      : applyTo.all('core/sonarjs', pluginSonarjs.configs.recommended)),
    ...(CONFIGS.SONARQUBE_OR_SONAR_CLOUD
      ? []
      : applyTo.all('core/sonarjs/duplicated', {
          rules: {
            // From https://community.sonarsource.com/t/documenting-and-clarifying-duplicate-eslint-rules/129385

            // Duplicates no-warning-comments
            'sonarjs/todo-tag': 'off',
            // Duplicates no-nested-ternary and unicorn/no-nested-ternary
            'sonarjs/no-nested-conditional': 'off',

            // Base ESLint rules duplications (same names)

            'sonarjs/no-delete-var': 'off',

            // eslint-plugin-autofix rules duplications (same names)

            'sonarjs/no-useless-catch': 'off',

            // Other regex-related duplications

            // Duplicates regexp/prefer-d, regexp/no-obscure-range and regexp/no-dupe-characters-character-class
            'sonarjs/duplicates-in-character-class': 'off',
            // Duplicates regexp/prefer-w, regexp/prefer-d, regexp/match-any
            'sonarjs/concise-regex': 'off',
            // Duplicates regexp/no-empty-alternative, regexp/no-trivially-nested-quantifier, regexp/no-dupe-disjunctions and regexp/no-trivially-nested-quantifier
            'sonarjs/empty-string-repetition': 'off',
            // Duplicates regexp/no-useless-character-class
            'sonarjs/single-char-in-character-classes': 'off',
            // Duplicates unicorn/better-regex and regexp/prefer-character-class
            'sonarjs/single-character-alternation': 'off',
            // Duplicates regexp/no-super-linear-move
            'sonarjs/slow-regex': 'off',
            // Duplicates regexp/no-empty-alternative
            'sonarjs/no-empty-alternatives': 'off',
            // Duplicates regexp/no-useless-dollar-replacements + regexp/no-unused-capturing-group
            'sonarjs/existing-groups': 'off',
            // Duplicates regexp/no-empty-capturing-group and regexp/no-empty-group
            'sonarjs/no-empty-group': 'off',

            // React/JSX-related duplications

            // Redundant in TypeScript
            'sonarjs/function-return-type': 'off',

            // [...]nobsoleted by @typescript-eslint
            'sonarjs/deprecation': 'off',
            'sonarjs/unused-import': 'off',

            // Redundant by some other rules
            'sonarjs/assertions-in-tests': 'off',
          },
        })),
    ...(CONFIGS.SONARQUBE_OR_SONAR_CLOUD
      ? []
      : applyTo.all('core/sonarjs/custom', {
          rules: {
            'sonarjs/no-duplicate-string': 'warn',
            'sonarjs/no-nested-functions': 'warn',
            'sonarjs/cognitive-complexity': 'warn',
            'sonarjs/no-selector-parameter': 'off',
            'sonarjs/prefer-read-only-props': 'off',
            'sonarjs/no-useless-intersection': 'off',
            'sonarjs/no-unused-vars': 'off',
            'sonarjs/no-commented-code': 'off', // lag
          },
        })),
    ...applyTo.all('core/no-relative-import-paths', {
      plugins: {
        'no-relative-import-paths': pluginNoRelativeImportPaths,
      },
      rules: {
        'no-relative-import-paths/no-relative-import-paths': [
          'warn',
          {allowSameFolder: true, rootDir: 'src', prefix: '@'},
        ],
      },
    }),
    ...applyTo.all('core/simple-import-sort', {
      plugins: {
        'simple-import-sort': pluginSimpleImportSort,
      },
      rules: {
        'sort-imports': 'off',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
      },
    }),
    ...applyTo.all('core/no-barrel-files', {
      plugins: {
        'no-barrel-files': pluginNoBarrelFiles, // switch to eslint-plugin-barrel-files?
      },
      rules: {
        'no-barrel-files/no-barrel-files': 'error',
      },
    }),
    ...applyTo.all('core/no-secrets', {
      plugins: {
        'no-secrets': pluginNoSecrets,
      },
      rules: {
        'no-secrets/no-secrets': [
          'error',
          {
            tolerance: 4.5,
            ignoreContent: [new RegExp(CAMEL_CASE)],
          },
        ],
      },
    }),
    ...applyTo.script('core/jsdoc', pluginJsdoc.configs['flat/recommended-error']),
    ...applyTo.script('core/jsdoc/custom', {
      rules: {
        'jsdoc/require-jsdoc': 'off',
        'jsdoc/tag-lines': ['error', 'any', {startLines: 1}],
      },
    }),
    ...(CONFIGS.LIBRARY
      ? applyTo.script('core/jsdoc/library', {
          rules: {
            'jsdoc/require-jsdoc': 'error',
          },
        })
      : []),
    ...applyTo.all('core/math', pluginMathConfigs.recommended),
    ...applyTo.all('core/math/custom', {
      rules: {
        'math/prefer-exponentiation-operator': 'error',
        // 'math/prefer-math-sum-precise': 'error' // TODO: enable this when Math.sumPrecise() become baseline available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sumPrecise
      },
    }),
    // ...applyTo.all('core/remeda', pluginRemeda.configs.recommended),
    // TODO: investigate why this is causing issues
    // ...applyTo.all('core/exception-handling', {
    //   plugins: {
    //     'exception-handling': pluginExceptionHandling,
    //   },
    //   rules: {
    //     'exception-handling/no-unhandled': 'error',
    //     'exception-handling/might-throw': 'error',
    //     'exception-handling/use-error-cause': 'error',
    //   },
    // }),
    // TODO: enable for new projects
    // ...applyTo.all('core/unicorn', pluginUnicorn.configs['flat/recommended']),
    // ...applyTo.all('core/unicorn/custom', {
    //   rules: {
    //     'unicorn/better-regex': 'warn',
    //     // 'unicorn/filename-case': [
    //     //   'error',
    //     //   {
    //     //     cases: {
    //     //       kebabCase: true,
    //     //       pascalCase: true,
    //     //       camelCase: true,
    //     //     },
    //     //   },
    //     // ],
    //     'unicorn/filename-case': 'off',
    //     'unicorn/prefer-spread': 'off',
    //     'unicorn/prevent-abbreviations': 'off',
    //     'unicorn/no-null': 'off',
    //     'unicorn/no-empty-file': 'off',
    //     'unicorn/no-negated-condition': 'off',
    //     'unicorn/no-array-push-push': 'warn',
    //     'unicorn/no-array-reduce': 'warn',
    //     'unicorn/prefer-math-min-max': 'off',
    //   },
    // }),
    ...applyTo.scriptNotTest('unhead', pluginUnheadConfigs.recommended),
  ]
}

function getWebConfigs() {
  if (!CONFIGS.WEB) return []

  return [
    // TODO: Waiting for https://github.com/kopiro/eslint-plugin-ssr-friendly/issues/30
    // ...applyTo.all(
    //   'core/ssr-friendly',
    //   fixupConfigRules(flatCompat.extends('plugin:ssr-friendly/recommended')),
    // ),
    ...applyTo.all('web', {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.worker,
          ...globals.serviceworker,
          ...globals.webextensions,
          document: 'readonly',
          navigator: 'readonly',
          window: 'readonly',
        },
      },
    }),
  ]
}

function getJsonConfigs() {
  // TODO: make `eslint-plugin-jsonc` working with `@eslint/json` https://github.com/ota-meshi/eslint-plugin-jsonc#experimental-support-for-eslintjson
  return [
    ...applyTo.json('json/json', pluginJsoncConfigs['flat/recommended-with-json']),
    // JSONC is just JSON with comments
    ...applyTo.jsonc('json/jsonc', pluginJsoncConfigs['flat/recommended-with-jsonc']),
    // JSON5 is much more: comments, trailing commas, multi-line strings, single or double quotes, object keys without quotes, and other features borrowed from ECMAScript 5.1,...
    ...applyTo.json5('json/json5', pluginJsoncConfigs['flat/recommended-with-json5']),
    ...applyTo.jsonC5('json', pluginJsoncConfigs['flat/prettier']),
  ]
}

function getCssModuleConfigs() {
  if (!CONFIGS.CSS_MODULES) return []

  return [
    ...applyTo.all('core/css-modules', {
      plugins: {
        'css-modules': pluginCssModules,
      },
      rules: pluginCssModules.configs.recommended.rules,
    }),
  ]
}

function getI18NConfigs() {
  if (!CONFIGS.I18N) return []

  return [
    ...applyTo.script('i18next', {
      plugins: {i18next: pluginI18next},
      rules: {
        'i18next/no-literal-string': 1,
      },
    }),
    ...(CONFIGS.ICU_MESSAGE_FORMAT
      ? applyTo.translations('i18n', {
          plugins: {
            'i18n-json': pluginI18nJson,
          },
          processor: {
            meta: {name: '.json'},
            ...pluginI18nJson.processors['.json'],
          },
          rules: {
            ...pluginI18nJson.configs.recommended.rules,
          },
        })
      : []),
  ]
}

function getTailwindCssConfigs() {
  if (!CONFIGS.TAILWINDCSS) return []

  return [
    ...applyTo.scriptNotTest('tailwindcss', {
      plugins: {
        'better-tailwindcss': eslintPluginBetterTailwindcss,
      },
      rules: {
        ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
      },
      settings: {
        'better-tailwindcss': {
          entryPoint: 'src/style/tailwind.css',
          detectComponentClasses: true,
          //   "tailwindConfig": "...",
          //   "attributes": [/* ... */],
          //   "callees": [/* ... */],
          //   "variables": [/* ... */],
          //   "tags": [/* ... */]
          selectors: [
            ...getDefaultSelectors(), // preserve default selectors
            {
              kind: SelectorKind.Attribute,
              match: [{type: 'objectValues'}],
              name: '[cC]lassNames$',
            },
          ],
        },
      },
    }),
    ...applyTo.scriptNotTest('tailwindcss/custom', {
      rules: {
        'better-tailwindcss/enforce-consistent-line-wrapping': 'off', // We rely on prettier or dprint to format
        'better-tailwindcss/enforce-consistent-variable-syntax': 'error',
      },
    }),
  ]
}

function getTypescriptConfigs() {
  if (!CONFIGS.TYPESCRIPT) return []

  return [
    ...applyTo.typescript('typescript/import-x', pluginImportXConfigs.typescript),
    ...applyTo.typescript('typescript/import-x/custom', {
      settings: {
        'import-x/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts', '.mtsx', '.ctsx'],
        },
        'import/resolver-next': [
          createTypeScriptImportResolver({
            alwaysTryTypes: true,
            // bun: true,
            extensions: [...defaultExtensions, '.mts', '.cts', '.d.mts', '.d.cts', '.mjs', '.cjs'],
          }),
          createNodeResolver({
            extensions: [
              '.js',
              ...(CONFIGS.REACT_NATIVE ? ['.web.js', '.ios.js', '.android.js'] : []),
            ],
          }),
        ],
      },
      rules: {
        // Turn off rules that typescript already provides https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
        'import-x/named': 'off',
        'import-x/namespace': 'off',
        'import-x/default': 'off',
        'import-x/no-named-as-default-member': 'off',
        'import-x/no-unresolved': 'off',
        'no-invalid-this': 'off', // Superseded by TypeScript's [`noImplicitThis`](https://www.typescriptlang.org/tsconfig/#noImplicitThis) compiler option (enabled by `strict` mode)
      },
    }),
    ...applyTo.typescript('typescript/strict', tsEslint.configs.strictTypeChecked),
    ...applyTo.typescript('typescript/stylistic', tsEslint.configs.stylisticTypeChecked),
    ...applyTo.typescript('typescript', {
      languageOptions: {
        parserOptions: {
          parser: tsEslint.parser,
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      rules: {
        // Our own rules set
        '@typescript-eslint/consistent-type-exports': [
          'error',
          {fixMixedExportsWithInlineTypeSpecifier: false},
        ],
        // '@typescript-eslint/promise-function-async': ['error'], // lag
        'no-loop-func': 'off',
        '@typescript-eslint/no-loop-func': 'error',
        '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
        '@typescript-eslint/no-unnecessary-qualifier': 'error',
        '@typescript-eslint/no-useless-empty-export': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            vars: 'all',
            args: 'after-used',
            caughtErrors: 'all',
            ignoreRestSiblings: false,
            reportUsedIgnorePattern: true,
            varsIgnorePattern: '^(?!__)_.*|^_$',
            argsIgnorePattern: '^(?!__)_.*|^_$',
            caughtErrorsIgnorePattern: '^(?!__)_.*|^_$',
            destructuredArrayIgnorePattern: '^(?!__)_.*|^_$',
          },
        ],
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': [
          'error',
          {allowDefaultCaseForExhaustiveSwitch: false},
        ],
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/restrict-template-expressions': [
          'warn',
          {
            allowAny: false,
            allowBoolean: false,
            allowNever: false,
            allowNullish: false,
            allowNumber: true,
            allowRegExp: false,
          },
        ], // TODO: enable
        '@typescript-eslint/no-deprecated': 'off', // lag
        '@typescript-eslint/no-unsafe-assignment': 'off', // lag
        '@typescript-eslint/no-misused-promises': 'off', // lag
        '@typescript-eslint/no-floating-promises': 'off', // lag
      },
    }),
    ...applyTo.typescript(
      'typescript/jsdoc',
      pluginJsdoc.configs['flat/recommended-typescript-error'],
    ),
    ...applyTo.typescript('typescript/jsdoc/custom', {
      rules: {
        'jsdoc/require-jsdoc': 'off',
      },
    }),
    ...(CONFIGS.LIBRARY
      ? applyTo.typescript('typescript/jsdoc/library', {
          rules: {
            'jsdoc/require-jsdoc': 'error',
          },
        })
      : []),
  ]
}

function getReactConfigs() {
  if (!CONFIGS.REACT) return []

  // TODO: add all react-use and other hooks libraries to staticHooks
  const reactUseStaticHooks = {
    useUpdate: true,
    useLatest: true,
  }

  // TODO: add all react-use and other hooks libraries to additionalHooks
  const reactUseAdditionalHooks = ['useIsomorphicLayoutEffect']

  const utilityHooks = ['useMemoClientValue', 'useMountedEffect', 'useAbortableEffect']

  const reactPerfIgnoreSources = Object.keys(packageJson.dependencies)
  const deepMemoizedComponents = ['RACLink', 'CopyableText', 'QueryErrorBoundary', 'Picture']
  const autoImportedComponents = extractAutoImportedReactComponents()
  const reactPrefForFunctionIgnoreComponent = [
    'BetterSuspense',
    'VisuallyHidden',
    ...autoImportedComponents,
  ]
  const reactPrefIgnoreComponent = [
    ...reactPrefForFunctionIgnoreComponent,
    ...deepMemoizedComponents,
  ]

  return [
    ...applyTo.react('react/default', pluginReact.configs.flat.recommended),
    ...(CONFIGS.NEW_JSX_TRANSFORM
      ? applyTo.react('react/jsx-runtime', pluginReact.configs.flat['jsx-runtime'])
      : []),
    ...applyTo.react('react/custom', {
      rules: {
        'react/prop-types': 'off',
        'react/no-unescaped-entities': 'warn',
        'react/boolean-prop-naming': [
          'error',
          {
            propTypeNames: ['bool', 'mutuallyExclusiveTrueProps'],
            rule: '^(is|has)[A-Z]([A-Za-z0-9]?)+',
            message:
              "Boolean prop name must start with 'is' or 'has', following with an adjective phrase, and in PascalCase",
            validateNested: true,
          },
        ],
        'react/forbid-dom-props': [
          'error',
          {
            forbid: ['style'],
          },
        ],
        // 'react/forbid-component-props': ['error', {forbid: []}],
        // 'react/forbid-elements': ['error', {forbid: []}],
        'react/jsx-handler-names': [
          'error',
          {
            eventHandlerPrefix: 'handle',
            eventHandlerPropPrefix: 'on',
            // checkLocalVariables: true,
            // checkInlineFunction: true,
            ignoreComponentNames: [],
          },
        ],
        'react/self-closing-comp': [
          'error',
          {
            component: true,
            html: true,
          },
        ],
      },
    }),
    ...(CONFIGS.EXPO
      ? []
      : applyTo.react('react/hooks', pluginReactHooks.configs.flat['recommended-latest'])),
    ...(CONFIGS.EXPO
      ? applyTo.react('react/hooks', {
          rules: {
            // Expo already define `react-hooks` plugin so we cannot redefine, so we need to only get the rules
            ...pluginReactHooks.configs.flat['recommended-latest'].rules,
          },
        })
      : []),
    ...applyTo.react('react/hooks/custom', {
      rules: {
        // 'react-hooks/preserve-manual-memoization': 0, // Why
        'react-hooks/config': 2,
        'react-hooks/set-state-in-effect': 2,
        'react-hooks/error-boundaries': 2,
        'react-hooks/gating': 2,
        'react-hooks/globals': 2,
        'react-hooks/immutability': 2,
        'react-hooks/preserve-manual-memoization': 2,
        'react-hooks/purity': 2,
        'react-hooks/refs': 2,
        'react-hooks/set-state-in-render': 2,
        'react-hooks/static-components': 2,
        'react-hooks/unsupported-syntax': 2,
        'react-hooks/use-memo': 2,
        'react-hooks/incompatible-library': 2,
        // Hidden rules that are not documented: https://github.com/react/react/blob/main/compiler/packages/babel-plugin-react-compiler/src/CompilerError.ts#L776
        'react-hooks/capitalized-calls': 2,
        'react-hooks/memoized-effect-dependencies': 2,
        'react-hooks/exhaustive-effect-dependencies': 2,
        'react-hooks/no-deriving-state-in-effects': 2,
        'react-hooks/hooks': 2,
        'react-hooks/invariant': 2,
        'react-hooks/rule-suppression': 2,
        'react-hooks/syntax': 2,
        'react-hooks/todo': 2,
        'react-hooks/void-use-memo': 2,
        'react-hooks/memo-dependencies': 2,
        // End hidden rules
        'react-hooks/exhaustive-deps': [
          'error',
          {
            staticHooks: {
              // User-defined hooks
              useStableCallback: true,
              useLazyRef: true,
              useIdleTimeScheduler: true,
              useSearch: [false, true],
              useSetSearch: true,
              useParam: [false, true],
              useSetParam: true,
              // Jotai, note that these 3s are not really stable, they can change if the store or atom changes, but for now we only use one store, and don't dynamically pass the atom, so it's still safe to say they are stable
              useAtom: [false, true], // means [unstable, stable]
              useSetAtom: true,
              useResetAtom: true,
              // use-mutative
              useMutative: [false, true],
              useMutativeReducer: [false, true],
              ...reactUseStaticHooks,
            },
            additionalHooks: `(${[...utilityHooks, ...reactUseAdditionalHooks].join('|')})`,
          },
        ],
      },
    }),
    ...applyTo.react('react/import-x', pluginImportXConfigs.react),
    ...applyTo.react('react/a11y', {
      ...pluginJsxA11y.flatConfigs.strict,
      settings: {
        'jsx-a11y': {
          polymorphicPropName: 'as',
          components: {
            VisuallyHidden: 'span',
          },
        },
      },
    }),
    ...(CONFIGS.TANSTACK.QUERY
      ? applyTo.react('react/query', pluginQuery.configs['flat/recommended'])
      : []),
    ...applyTo.javascriptReact('react/x-javascript', {...pluginReactX.configs.strict}),
    ...applyTo.react('react/x-disable-conflict', {
      ...pluginReactX.configs['disable-conflict-eslint-plugin-react'],
      ...pluginReactX.configs['disable-conflict-eslint-plugin-react-hooks'],
    }),
    ...applyTo.react('react/x-custom', {
      rules: {
        '@eslint-react/refs': 'error',
        '@eslint-react/immutability': 'error',
        '@eslint-react/no-duplicate-key': 'error',
        '@eslint-react/no-missing-component-display-name': 'error',
        '@eslint-react/no-missing-context-display-name': 'error',
        '@eslint-react/dom-no-string-style-prop': 'error',
        '@eslint-react/dom-no-unknown-property': [
          'error',
          {requireDataLowercase: true, ignore: []},
        ],
        '@eslint-react/no-implicit-children': 'warn',
        '@eslint-react/no-implicit-key': 'warn',
        '@eslint-react/no-implicit-ref': 'warn',
        '@eslint-react/globals': 'warn',
        '@eslint-react/no-unused-state': 'warn',
      },
      settings: {
        'react-x': {
          polymorphicPropName: 'as',
          additionalHooks: {
            useLayoutEffect: ['useIsomorphicLayoutEffect'],
          },
          version: 'detect',
        },
      },
    }),
    ...applyTo.react(
      'react/refresh',
      reactRefresh.configs.vite(() => ({
        rules: {
          'react-refresh/only-export-components': [
            'warn',
            {
              allowConstantExport: true,
              checkJS: true,
              allowExportNames: [],
              extraHOCs: ['deepMemo'], // currently not working because we are using currying to return the memoized component
            },
          ],
        },
      })),
    ),
    ...applyTo.react('react/compiler', pluginReactCompiler.configs.recommended),
    ...applyTo.react('react/perf', pluginReactPerf.configs.flat.all),
    ...applyTo.react('react/perf-custom', {
      rules: {
        'react-perf/jsx-no-new-object-as-prop': [
          'error',
          {
            nativeAllowList: 'all',
            allowList: [],
            ignoreSources: reactPerfIgnoreSources,
            ignoreComponents: reactPrefIgnoreComponent,
          },
        ],
        'react-perf/jsx-no-new-array-as-prop': [
          'error',
          {
            nativeAllowList: 'all',
            allowList: [],
            ignoreSources: reactPerfIgnoreSources,
            ignoreComponents: reactPrefIgnoreComponent,
          },
        ],
        'react-perf/jsx-no-new-function-as-prop': [
          'error',
          {
            nativeAllowList: 'all',
            allowList: [],
            ignoreSources: reactPerfIgnoreSources,
            ignoreComponents: reactPrefForFunctionIgnoreComponent,
          },
        ],
        'react-perf/jsx-no-jsx-as-prop': [
          'error',
          {
            nativeAllowList: 'all',
            allowList: [],
            ignoreSources: reactPerfIgnoreSources,
            ignoreComponents: reactPrefIgnoreComponent,
          },
        ],
      },
    }),
    ...applyTo.react('react', {
      languageOptions: {
        globals: {
          React: true,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      rules: {
        'jsx-a11y/label-has-associated-control': [
          'error',
          {
            controlComponents: ['button'],
          },
        ],
      },
    }),
    ...applyTo.react('react-you-might-not-need-an-effect', {
      ...pluginReactYouMightNotNeedAnEffect.configs.recommended,
      rules: Object.keys(pluginReactYouMightNotNeedAnEffect.configs.recommended.rules || {}).reduce(
        (acc, key) => {
          acc[key] = 'error'
          return acc
        },
        {},
      ),
    }),
    ...applyTo.react('react-hooks-addons', {
      plugins: {
        'react-hooks-addons': pluginReactHooksAddons,
      },
      rules: {
        'react-hooks-addons/no-unused-deps': [
          'warn',
          {
            effectComment: 'effectful',
            additionalHooks: {
              pattern: reactUseAdditionalHooks.join('|'),
              replace: false,
            },
          },
        ],
      },
    }),
  ]
}

function getReactWebConfigs() {
  if (!CONFIGS.REACT || !CONFIGS.WEB) return []

  return [
    ...(CONFIGS.TANSTACK.ROUTER
      ? applyTo.react('react-router', pluginRouter.configs['flat/recommended'])
      : []),
    ...applyTo.react('react/dom', pluginReactX.configs.dom),
  ]
}

function getReactNativeConfigs() {
  if (!CONFIGS.REACT || !CONFIGS.REACT_NATIVE) return []

  return [
    expoConfig,
    ...applyTo.react('@react-native', fixupConfigRules(flatCompat.plugins('@react-native'))),
    ...applyTo.react('@react-native/rules', {
      rules: {
        '@react-native/no-deep-imports': 'error',
        '@react-native/platform-colors': 'error',
      },
    }),
    ...applyTo.react(
      'react-native',
      fixupConfigRules(flatCompat.extends('plugin:react-native/all')),
    ),
    ...applyTo.react(
      'react-native-a11y',
      fixupConfigRules(flatCompat.extends('plugin:react-native-a11y/all')),
    ),
    ...applyTo.react('react-native/off-dom', pluginReactX.configs['off-dom']),
  ]
}

function getNextJsConfigs() {
  if (!CONFIGS.REACT || !CONFIGS.NEXT_JS) return []

  return ['plugin:@next/next/core-web-vitals']
}

function getReactTypescriptConfigs() {
  if (!CONFIGS.REACT || !CONFIGS.TYPESCRIPT) return []

  return [
    ...applyTo.typescriptReact('react/x-typescript', {
      ...pluginReactX.configs['strict-type-checked'],
    }),
    ...applyTo.typescriptReact('react/typescript', {
      rules: {
        'react/jsx-no-undef': 'off', // Already covered by typescript
        // https://github.com/orgs/react-hook-form/discussions/8020
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: {
              attributes: false,
            },
          },
        ],
      },
    }),
    ...applyTo.routes('react-router/custom', {
      rules: {
        '@typescript-eslint/only-throw-error': [
          'error',
          {
            allow: [
              {
                from: 'package',
                package: '@tanstack/router-core',
                name: 'Redirect',
              },
            ],
          },
        ],
      },
    }),
  ]
}

function getTestConfigs() {
  if (!CONFIGS.TEST) return []

  return [
    ...applyTo.test('testing/no-only-tests', {
      plugins: {
        'no-only-tests': pluginNoOnlyTests,
      },
      rules: {
        'no-only-tests/no-only-tests': 'error',
      },
    }),
  ]
}

function getVitestConfigs() {
  if (!CONFIGS.TEST || !CONFIGS.VITEST) return []

  return [
    ...applyTo.test('testing/vitest', {
      plugins: {
        vitest: pluginVitest,
      },
      rules: {
        ...pluginVitest.configs.all.rules,
        'vitest/no-hooks': 'off',
        'vitest/max-expects': 'off',
      },
      settings: {
        vitest: {
          typecheck: true,
        },
      },
      languageOptions: {
        globals: pluginVitest.environments.env.globals,
      },
    }),
    ...applyTo.testType('testing/vitest/type', {
      rules: {
        'vitest/prefer-expect-assertions': 'off',
      },
    }),
  ]
}

function getTestingLibraryDomConfigs() {
  if (!CONFIGS.TEST || !CONFIGS.WEB) return []

  return [
    ...applyTo.test('testing/vitest/jest-dom', pluginJestDom.configs['flat/recommended']),
    ...applyTo.testNotReact('testing/dom', pluginTestingLibrary.configs['flat/dom']),
  ]
}

function getTestingLibraryReactConfigs() {
  if (!CONFIGS.TEST || !CONFIGS.REACT) return []

  return [...applyTo.testReact('testing/react', pluginTestingLibrary.configs['flat/react'])]
}

function getE2ETestConfigs() {
  return []
}

function getPnpmWorkspacesCatalogsConfigs() {
  if (!CONFIGS.PNPM_WORKSPACES_CATALOGS) return []

  return [...pluginPnpmConfigs.json, ...pluginPnpmConfigs.yaml]
}

function getCommonjsConfigs() {
  return [
    ...applyTo.commonjs('commonjs', {
      languageOptions: {
        sourceType: 'commonjs',
        ecmaVersion: 'latest',
        parserOptions: {
          ecmaFeatures: {
            impliedStrict: true,
          },
        },
        globals: {
          ...globals.commonjs,
          ...globals.node,
          ...globals.worker,
        },
      },
    }),
  ]
}

//------------------------------------------------------------------------------

export default defineConfig(
  ...getIgnoreConfigs(),
  ...getCoreConfigs(),
  ...getWebConfigs(),
  ...getJsonConfigs(),
  ...getCssModuleConfigs(),
  ...getI18NConfigs(),
  ...getTailwindCssConfigs(),
  ...getTypescriptConfigs(),
  ...getReactConfigs(),
  ...getReactWebConfigs(),
  ...getReactNativeConfigs(),
  ...getNextJsConfigs(),
  ...getReactTypescriptConfigs(),
  ...getTestConfigs(),
  ...getVitestConfigs(),
  ...getTestingLibraryDomConfigs(),
  ...getTestingLibraryReactConfigs(),
  ...getE2ETestConfigs(),
  ...getPnpmWorkspacesCatalogsConfigs(),
  ...applyTo.all('settings', {
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
      globals: {
        // ...globals.node, // NOTE: this is default to SPA, all js run in browser. When SSR/RSC introduced, we must config globals.node for RSC and SSR files only
      },
    },
  }),
  ...getCommonjsConfigs(),
  ...(CONFIGS.PRETTIER ? applyTo.all('prettier', pluginPrettierRecommended) : []), // always the last
)
