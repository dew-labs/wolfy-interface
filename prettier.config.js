// Please make sure this config will not override .editorconfig
export default {
  semi: false,
  singleQuote: true,
  quoteProps: 'consistent',
  jsxSingleQuote: true,
  trailingComma: 'all',
  bracketSpacing: false,
  bracketSameLine: false,
  arrowParens: 'avoid',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'strict',
  plugins: [
    // 'some-other-plugin',
    'prettier-plugin-tailwindcss', // tailwindcss plugin must be loaded last
  ],
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cva', 'tw'],
}
