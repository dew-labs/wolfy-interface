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
    '@svgr/plugin-prettier',
    // NOTE: consider using `prettier-plugin-merge` if there are multiple plugins that use the Prettier API (which can only use by one plugin at a time)
  ],
}
