// Please make sure this config will not override .editorconfig
export default {
  semi: false,
  singleQuote: true,
  quoteProps: 'consistent',
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  bracketSameLine: false,
  objectWrap: 'preserve',
  arrowParens: 'avoid',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'strict',
  plugins: [
    // 'some-other-plugin',
    'prettier-plugin-classnames',
    '@svgr/plugin-prettier',
    'prettier-plugin-merge',
  ],
  customFunctions: ['cn', 'tw', 'classNames', 'clsx', 'twMerge'],
  endingPosition: 'absolute-with-indent',
  experimentalOptimization: true,
  syntaxTransformation: false,
}
