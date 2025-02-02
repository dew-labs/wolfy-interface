// TODO: using .ts config file https://eslint.org/docs/head/use/configure/configuration-files#typescript-configuration-files
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {fixupConfigRules} from '@eslint/compat'
import {FlatCompat} from '@eslint/eslintrc'
import eslint from '@eslint/js'
import pluginEslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import pluginReact from '@eslint-react/eslint-plugin'
import pluginQuery from '@tanstack/eslint-plugin-query'
// import pluginUnicorn from 'eslint-plugin-unicorn'
import pluginVitest from '@vitest/eslint-plugin'
import pluginGitignore from 'eslint-config-flat-gitignore'
import pluginCssModules from 'eslint-plugin-css-modules'
import pluginDepend from 'eslint-plugin-depend'
// import {plugin as pluginExceptionHandling} from 'eslint-plugin-exception-handling'
import pluginI18next from 'eslint-plugin-i18next'
import pluginImportX from 'eslint-plugin-import-x'
import pluginJestDom from 'eslint-plugin-jest-dom'
// import pluginJsdoc from 'eslint-plugin-jsdoc'
import pluginJsonc from 'eslint-plugin-jsonc'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginNoBarrelFiles from 'eslint-plugin-no-barrel-files'
import pluginNoOnlyTests from 'eslint-plugin-no-only-tests'
import pluginNoRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'
import pluginNoSecrets from 'eslint-plugin-no-secrets' // TODO: Leave this functionality for another step
import pluginNoUseExtendNative from 'eslint-plugin-no-use-extend-native'
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import pluginPromise from 'eslint-plugin-promise'
import pluginReactCompiler from 'eslint-plugin-react-compiler'
import pluginReactPerf from 'eslint-plugin-react-perf'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import * as pluginRegexp from 'eslint-plugin-regexp'
import pluginSecurity from 'eslint-plugin-security'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginTailwindCss from 'eslint-plugin-tailwindcss'
// import pluginSonarjs from 'eslint-plugin-sonarjs' // TODO: investigate why this cause errors
import pluginTestingLibrary from 'eslint-plugin-testing-library'
import globals from 'globals'
// eslint-disable-next-line import-x/no-unresolved -- import-x error
import tsEslint from 'typescript-eslint'

import globs from './globs.js'
import {CAMEL_CASE} from './regexes.js'

const flatCompat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
})

//------------------------------------------------------------------------------

function createApplyTo(include, exclude = []) {
  return (name, configs, enabled = true) => {
    if (!enabled) {
      return []
    }

    let config = configs

    if (Array.isArray(configs)) {
      if (configs.length > 1) {
        return configs.map((cfg, index) => ({
          ...cfg,
          name: `${name}-${index}`,
          files: include,
          ignores: exclude,
        }))
      }

      config = configs.at(0)
    }

    return [
      {
        ...config,
        name,
        files: include,
        ignores: exclude,
      },
    ]
  }
}

const applyTo = {
  all: createApplyTo(globs.SCRIPT_AND_JSONS),
  script: createApplyTo(globs.SCRIPT),
  scriptNotTest: createApplyTo(globs.SCRIPT, globs.TEST),
  json: createApplyTo(globs.JSON, globs.NOT_JSON),
  jsonc: createApplyTo(globs.JSONC, globs.NOT_JSONC),
  json5: createApplyTo(globs.JSON5, globs.NOT_JSON5),
  jsonC5: createApplyTo(globs.JSONC5),
  typescript: createApplyTo(globs.TYPESCRIPT),
  react: createApplyTo(globs.REACT),
  reactHooks: createApplyTo(globs.REACT_HOOKS, globs.ROUTES),
  reactComponents: createApplyTo(globs.REACT_COMPONENTS, globs.ROUTES),
  routes: createApplyTo(globs.ROUTES),
  javascriptReact: createApplyTo(globs.REACT_JAVASCRIPT),
  typescriptReact: createApplyTo(globs.REACT_TYPESCRIPT),
  test: createApplyTo(globs.TEST, globs.TEST_2E2),
  testNotReact: createApplyTo(globs.TEST_NOT_REACT, globs.TEST_2E2),
  testReact: createApplyTo(globs.TEST_REACT, globs.TEST_2E2),
  testE2E: createApplyTo(globs.TEST_2E2),
}

//------------------------------------------------------------------------------

function getIgnoreConfigs() {
  return [
    pluginGitignore({
      root: true,
      files: ['.gitignore'],
      strict: false,
    }),
    {
      ignores: ['public/*', '**/*.gen.ts', 'vitest.config.ts.timestamp*'],
    },
  ]
}

function getCoreConfigs() {
  return [
    ...applyTo.all('core/recommended', eslint.configs.recommended),
    ...applyTo.all('core/custom', {
      rules: {
        'camelcase': ['error', {allow: ['contract_address']}],
        'grouped-accessor-pairs': 'error',
        'accessor-pairs': 'error',
        // 'default-case': ['error', {commentPattern: '^skip\\sdefault'}],
        'default-case-last': 'error',
        // 'default-param-last': 'error',
        'no-promise-executor-return': 'error',
        'no-self-compare': 'error',
        'no-template-curly-in-string': 'error',
        'no-unmodified-loop-condition': 'error',
        'no-useless-assignment': 'error',
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
        'no-undef-init': 'error',
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
    ...applyTo.all('core/import-x', pluginImportX.flatConfigs.recommended),
    ...applyTo.all('core/import-x/custom', {
      rules: {
        'import-x/no-unresolved': 'error',
        'import-x/order': 'off',
        'import-x/namespace': 'off',
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
    ...applyTo.all('core/regexp', pluginRegexp.configs['flat/recommended']),
    ...applyTo.all(
      'core/ssr-friendly',
      fixupConfigRules(flatCompat.extends('plugin:ssr-friendly/recommended')),
    ),
    ...applyTo.all('core/depend', pluginDepend.configs['flat/recommended']),
    // ...applyTo.all('core/sonarjs', pluginSonarjs.configs.recommended), // drop this if using SonarQube or SonarCloud in favor of the IDE extension
    // ...applyTo.all('core/sonarjs/custom', {
    //   rules: {
    //     'sonarjs/no-duplicate-string': 'warn',
    //   },
    // }),
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
    // TODO: enable later
    // ...applyTo.all('core/jsdoc', pluginJsdoc.configs['flat/recommended-typescript-error']),
    // ...applyTo.all('core/unicorn', pluginUnicorn.configs['flat/recommended']),
    // ...applyTo.all('core/unicorn/custom', {
    //   rules: {
    //     // 'unicorn/better-regex': 'warn',
    //     // 'unicorn/filename-case': [
    //     //   'error',
    //     //   {
    //     //     cases: {
    //     //       kebabCase: true,
    //     //       pascalCase: true,
    //     //     }
    //     //   }
    //     // ],
    //   },
    // }),
  ]
}

function getJsonConfigs() {
  return [
    ...applyTo.json('json/json', pluginJsonc.configs['flat/recommended-with-json']),
    ...applyTo.jsonc('json/jsonc', pluginJsonc.configs['flat/recommended-with-jsonc']),
    ...applyTo.json5('json/json5', pluginJsonc.configs['flat/recommended-with-json5']),
    ...applyTo.jsonC5('json', pluginJsonc.configs['flat/prettier']),
  ]
}

function getCssModuleConfigs() {
  return [
    ...applyTo.all('core/css-modules', {
      plugins: {
        'css-modules': pluginCssModules,
      },
      rules: pluginCssModules.configs.recommended.rules,
    }),
  ]
}

function getI18nextConfigs() {
  return [
    ...applyTo.script('i18next', {
      plugins: {
        i18next: pluginI18next,
      },
      rules: {
        'i18next/no-literal-string': 1,
      },
    }),
  ]
}

function getTailwindCssConfigs() {
  return [
    ...applyTo.scriptNotTest('tailwindcss', pluginTailwindCss.configs['flat/recommended']),
    ...applyTo.scriptNotTest('tailwindcss/custom', {
      settings: {
        tailwindcss: {
          // These are the default values but feel free to customize
          callees: ['classnames', 'clsx', 'ctl', 'cva', 'tw', 'cn'],
          config: 'tailwind.config.js', // returned from `loadConfig()` utility if not provided
          cssFiles: ['**/*.css', '!**/node_modules', '!**/.*', '!**/dist', '!**/build'],
          cssFilesRefreshRate: 5_000,
          removeDuplicates: true,
          skipClassAttribute: false,
          whitelist: [],
          tags: [], // can be set to e.g. ['tw'] for use in tw`bg-blue`
          classRegex: '^class(Name)?$', // can be modified to support custom attributes. E.g. "^tw$" for `twin.macro`
        },
      },
    }),
  ]
}

function getTypescriptConfigs() {
  return [
    ...applyTo.typescript('typescript/import-x', {
      ...pluginImportX.flatConfigs.typescript,
      settings: {
        'import-x/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts', '.mtsx', '.ctsx'],
        },
        'import-x/resolver': {
          typescript: {
            alwaysTryTypes: true,
          },
          node: true,
        },
      },
    }),
    // Turn off rules that typescript already provides https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
    ...applyTo.typescript('typescript/import-x/custom', {
      rules: {
        'import-x/named': 'off',
        'import-x/namespace': 'off',
        'import-x/default': 'off',
        'import-x/no-named-as-default-member': 'off',
        'import-x/no-unresolved': 'off',
      },
    }),
    ...applyTo.typescript('typescript/strict', tsEslint.configs.strictTypeChecked),
    ...applyTo.typescript('typescript/stylistic', tsEslint.configs.stylisticTypeChecked),
    ...applyTo.typescript('typescript', {
      languageOptions: {
        parserOptions: {
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
        '@typescript-eslint/promise-function-async': ['error'],
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
        '@typescript-eslint/use-unknown-in-catch-callback-variable': 'warn', // TODO: enable
        '@typescript-eslint/restrict-template-expressions': 'warn', // TODO: enable
        '@typescript-eslint/restrict-plus-operands': 'warn', // TODO: enable
      },
    }),
  ]
}

function getReactConfigs() {
  // TODO: add all react-use and other hooks libraries to staticHooks
  const reactUseStaticHooks = {
    useUpdate: true,
  }

  // TODO: add all react-use and other hooks libraries to additionalHooks
  const reactUseAdditionalHooks = ['useIsomorphicLayoutEffect']

  return [
    ...applyTo.react(
      'react/hooks',
      fixupConfigRules(flatCompat.extends('plugin:react-hooks/recommended')),
    ),
    ...applyTo.react('react/hooks/custom', {
      rules: {
        'react-hooks/exhaustive-deps': [
          'error',
          {
            staticHooks: {
              useAtom: [false, true], // means [unstable, stable]
              useSetAtom: true,
              useMutative: [false, true],
              useMutativeReducer: [false, true],
              useLatest: true,
              useLazyRef: true,
              useIdleTimeScheduler: true,
              ...reactUseStaticHooks,
            },
            additionalHooks: `(${['useMemoClientValue', ...reactUseAdditionalHooks].join('|')})`,
          },
        ],
      },
    }),
    ...applyTo.react('react/import-x', pluginImportX.flatConfigs.react),
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
    ...applyTo.react('react/query', pluginQuery.configs['flat/recommended']),
    ...applyTo.react('react/dom', pluginReact.configs.dom), // TODO: Exclude react in SSR, RSC??
    ...applyTo.javascriptReact('react/x-javascript', {
      ...pluginReact.configs['recommended'],
    }),
    ...applyTo.react('react/x-custom', {
      rules: {
        '@eslint-react/prefer-shorthand-boolean': 'warn',
        '@eslint-react/prefer-shorthand-fragment': 'warn',
        '@eslint-react/no-class-component': 'error',
        '@eslint-react/no-missing-component-display-name': 'error',
        '@eslint-react/no-useless-fragment': 'error',
        '@eslint-react/prefer-react-namespace-import': 'error',
        '@eslint-react/no-complex-conditional-rendering': 'error',
        '@eslint-react/prefer-destructuring-assignment': 'error',
        '@eslint-react/dom/no-unknown-property': [
          'error',
          {requireDataLowercase: true, ignore: []},
        ],
      },
    }),
    ...applyTo.react('react/naming-convention', {
      rules: {
        '@eslint-react/naming-convention/component-name': ['error', 'PascalCase'],
        '@eslint-react/naming-convention/use-state': 'error',
      },
    }),
    ...applyTo.reactComponents('react/naming-convention/components', {
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'PascalCase'],
      },
    }),
    ...applyTo.reactHooks('react/naming-convention/hooks', {
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'camelCase'],
      },
    }),
    ...applyTo.routes('react/naming-convention/routes', {
      rules: {
        '@eslint-react/naming-convention/filename': ['error', 'kebab-case'],
      },
    }),
    ...applyTo.react('react/x/hooks', {
      // TODO: enable this when available in v2.0.0 instead of manually set rules
      // ...pluginReact.configs['hooks-extra'],
      rules: {
        '@eslint-react/hooks-extra/prefer-use-state-lazy-initialization': 'error',
        '@eslint-react/hooks-extra/no-direct-set-state-in-use-layout-effect': 'error',
        '@eslint-react/hooks-extra/no-unnecessary-use-callback': 'error',
        '@eslint-react/hooks-extra/no-unnecessary-use-memo': 'error',
        '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'error',
        '@eslint-react/hooks-extra/no-useless-custom-hooks': 'error',
      },
    }),
    ...applyTo.react('react/x-settings', {
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
    ...applyTo.react('react/refresh', {
      plugins: {
        'react-refresh': pluginReactRefresh,
      },
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          {
            allowConstantExport: true,
            checkJS: true,
          },
        ],
      },
    }),
    ...applyTo.react('react/compiler', {
      plugins: {
        'react-compiler': pluginReactCompiler,
      },
      rules: {
        'react-compiler/react-compiler': 'error',
      },
    }),
    ...applyTo.react('react/perf', pluginReactPerf.configs.flat.all),
    ...applyTo.react('react/perf-custom', {
      rules: {
        'react-perf/jsx-no-new-object-as-prop': [
          'error',
          {
            nativeAllowList: 'all',
            ignoreSources: ['@heroui/react'],
          },
        ],
        'react-perf/jsx-no-new-array-as-prop': [
          'error',
          {
            nativeAllowList: 'all',
            ignoreSources: ['@heroui/react'],
          },
        ],
        'react-perf/jsx-no-new-function-as-prop': [
          'error',
          {
            nativeAllowList: 'all',
            ignoreSources: ['@heroui/react'],
          },
        ],
        'react-perf/jsx-no-jsx-as-prop': [
          'error',
          {
            nativeAllowList: 'all',
            ignoreSources: ['@heroui/react'],
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
  ]
}

function getReactNativeConfigs() {
  return [
    // ...applyTo.reactNative('react-native/dom', pluginReactNative.configs.all),
    // ...applyTo.reactNative('react-native/off-dom', pluginReact.configs['off-dom']),
  ]
}

function getNextJsConfigs() {
  // If files is in a nextJs project or not
  // const isNextJsProject = fs.existsSync('next.config.js');
  // const nextJsOrEmptyExtends = isNextJsProject ? ['plugin:@next/next/core-web-vitals'] : [];

  return []
}

function getReactTypescriptConfigs() {
  return [
    ...applyTo.typescriptReact('react/x-typescript', {
      ...pluginReact.configs['recommended-type-checked'],
    }),
    ...applyTo.typescriptReact('react/x-typescript-custom', {
      rules: {
        '@eslint-react/prefer-read-only-props': 'warn',
      },
    }),
    ...applyTo.typescriptReact('react/typescript', {
      rules: {
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
  ]
}

function getTestConfigs() {
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
  return [
    ...applyTo.test('testing/vitest', {
      plugins: {
        vitest: pluginVitest,
      },
      rules: pluginVitest.configs.all.rules,
      settings: {
        vitest: {
          typecheck: true,
        },
      },
      languageOptions: {
        globals: {
          ...pluginVitest.environments.env.globals,
          // pluginVitest.environments.env.globals lack some of the globals, see https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/constants.ts
          chai: true,
          expectTypeOf: true,
          assertType: true,
          onTestFinished: true,
          onTestFailed: true,
        },
      },
    }),
    ...applyTo.test(
      'testing/vitest/formatting',
      flatCompat.extends('plugin:jest-formatting/strict'),
    ),
  ]
}

function getTestingLibraryDomConfigs() {
  return [
    ...applyTo.test('testing/vitest/jest-dom', pluginJestDom.configs['flat/recommended']),
    ...applyTo.testNotReact('testing/dom', pluginTestingLibrary.configs['flat/dom']),
  ]
}

function getTestingLibraryReactConfigs() {
  return [...applyTo.testReact('testing/react', pluginTestingLibrary.configs['flat/react'])]
}

function getCypressConfigs() {
  return []
}

//------------------------------------------------------------------------------

export default tsEslint.config(
  ...getIgnoreConfigs(),
  ...getCoreConfigs(),
  ...getJsonConfigs(),
  ...getCssModuleConfigs(),
  ...getI18nextConfigs(),
  ...getTailwindCssConfigs(),
  ...getTypescriptConfigs(),
  ...getReactConfigs(),
  ...getReactNativeConfigs(),
  ...getNextJsConfigs(),
  ...getReactTypescriptConfigs(),
  ...getTestConfigs(),
  ...getVitestConfigs(),
  ...getTestingLibraryDomConfigs(),
  ...getTestingLibraryReactConfigs(),
  ...getCypressConfigs(),
  ...applyTo.all('settings', {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node,
        ...globals.worker,
        ...globals.serviceworker,
        ...globals.webextensions,
      },
    },
  }),
  ...applyTo.all('prettier', pluginPrettierRecommended), // always the last
)
