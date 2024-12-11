export default {
  // Add vue, svelte,... if using them
  SCRIPT_AND_JSONS: ['**/*.{?(c|m)[jt]s?(x),json?(c|5)}'],
  // Add vue, svelte,... if using them
  SCRIPT: ['**/*.?(c|m)[jt]s?(x)'],
  JSON: ['**/*.json'],
  NOT_JSON: ['**/tsconfig.json', '.vscode/*.json', '.zed/*.json'],
  JSONC: ['**/*.jsonc'],
  NOT_JSONC: ['.vscode/*.json', '.zed/*.json'],
  JSON5: ['**/*.json5'],
  NOT_JSON5: ['**/tsconfig.json'],
  JSONC5: ['**/*.json?(c|5)'],
  // Add vue, svelte,... if using them
  TYPESCRIPT: ['**/*.?(c|m)ts?(x)'],
  REACT: ['**/*.?(c|m)[jt]sx', '**/use*.?(c|m)[jt]s?(x)'],
  REACT_JAVASCRIPT: ['**/*.?(c|m)tsx', '**/use*.?(c|m)js?(x)'],
  REACT_TYPESCRIPT: ['**/*.?(c|m)tsx', '**/use*.?(c|m)ts?(x)'],
  TEST: ['**/__tests__/**/*.?(c|m)[jt]s?(x)', '**/*.{test,spec}?(-d).?(c|m)[jt]s?(x)'],
  TEST_SSR: ['**/*.ssr.{test,spec}?(-d).?(c|m)[jt]s?(x)', '**/__tests__/**/*.ssr.?(c|m)[jt]s?(x)'],
  TEST_TYPE: ['**/*.test-d.?(c|m)ts?(x)'],
  TEST_NOT_REACT: [
    '**/__tests__/**/!(use)*.?(c|m)[jt]s!(x)',
    '**/!(use)*.{test,spec}?(-d).?(c|m)[jt]s!(x)',
  ],
  TEST_BROWSER: undefined,
  TEST_REACT: [
    '**/__tests__/**/*.?(c|m)[jt]sx',
    '**/__tests__/**/use*.?(c|m)[jt]s?(x)',
    '**/*.{test,spec}?(-d).?(c|m)[jt]sx',
    '**/use*.{test,spec}?(-d).?(c|m)[jt]s?(x)',
  ],
  TEST_2E2: ['**/cypress/**/*'],
  // Add less, stylus,... if using them
  STYLE: ['*.{s[ca]ss,?(p)css}'],
  TAILWIND_CONTENT: [
    './index.{htm,html}',
    './src/**/*.{?(c|m)[jt]s?(x),vue,svelte}',
    './node_modules/@nextui-org/theme/dist/**/*.?(c|m)[jt]s?(x)',
  ],
}
