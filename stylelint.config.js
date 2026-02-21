import {PASCAL_CASE} from './regexes.js'

const config = {
  plugins: [
    'stylelint-use-logical-spec',
    'stylelint-plugin-defensive-css',
    'stylelint-declaration-block-no-ignored-properties',
    'stylelint-css-modules-no-global-scoped-selector',
    'stylelint-high-performance-animation',
    // "stylelint-no-px", or "stylelint-rem-over-px" // TODO: setup later, somehow they dont play well with @container
    // "stylelint-declaration-strict-value", // TODO: setup later
    // "stylelint-use-nesting", // TODO: setup later
    // "stylelint-media-use-custom-media", // TODO: setup later
    // "stylelint-scales", // TODO: setup later
    // "stylelint-gamut", // TODO: setup later
  ],
  extends: [
    'stylelint-config-standard', // stylelint-config-recommended included
    // "postcss-styled-syntax", // For css-in-js
    'stylelint-config-tailwindcss',
    'stylelint-prettier/recommended',
    'stylelint-config-clean-order', // https://npmtrends.com/stylelint-config-clean-order-vs-stylelint-config-concentric-order-vs-stylelint-config-hudochenkov/order-vs-stylelint-config-idiomatic-order-vs-stylelint-config-property-sort-order-smacss-vs-stylelint-config-rational-order-vs-stylelint-config-recess-order
  ],
  rules: {
    'declaration-empty-line-before': null,
    'no-empty-source': null,
    'unit-allowed-list': ['%', 'deg', 'rem', 'ms', 's', 'dvh', 'fr', 'ex'],
    'custom-property-pattern': '([a-z]+)(-[a-z]+)*',
    'liberty/use-logical-spec': 'always',
    'at-rule-empty-line-before': [
      'always',
      {
        except: [
          'blockless-after-same-name-blockless',
          'blockless-after-blockless',
          'first-nested',
        ],
        ignore: ['after-comment'],
        ignoreAtRules: ['else', 'if'],
      },
    ],
    'defensive-css/no-accidental-hover': [true, {severity: 'warning'}],
    'defensive-css/no-list-style-none': [true, {fix: true, severity: 'warning'}],
    'defensive-css/no-mixed-vendor-prefixes': [true, {severity: 'warning'}],
    'defensive-css/require-background-repeat': [true, {severity: 'warning'}],
    'defensive-css/require-dynamic-viewport-height': [true, {severity: 'warning'}],
    'defensive-css/require-flex-wrap': [true, {severity: 'warning'}],
    'defensive-css/require-focus-visible': [true, {severity: 'warning'}],
    'defensive-css/require-named-grid-lines': [
      true,
      {columns: [true, {severity: 'warning'}]},
      {rows: [true, {severity: 'warning'}]},
    ],
    'defensive-css/require-prefers-reduced-motion': [true, {severity: 'warning'}],
    'plugin/declaration-block-no-ignored-properties': [true, {severity: 'warning'}],
    'plugin/no-low-performance-animation-properties': [true, {severity: 'warning'}],
    'at-rule-no-deprecated': [
      true,
      {
        severity: 'warning',
        ignoreAtRules: ['apply'],
      },
    ],
  },
  overrides: [
    // For SCSS
    {
      files: ['*.scss'],
      extends: ['stylelint-config-standard-scss'], // This included: stylelint-config-standard, stylelint-config-recommended-scss (stylelint-config-recommended, stylelint-scss, postcss-scss included)
      rules: {
        'scss/dollar-variable-pattern': '([A-Z][a-z]+)(-[A-Z][a-z]+)*',
      },
    },
    // For CSS, SCSS Modules
    {
      'files': ['*.module.css', '*.module.scss'],
      'extends': ['stylelint-config-css-modules'],
      'css-modules/no-global-scoped-selector': [
        true,
        {fileExtensions: ['.module.css', '.module.scss']},
      ],
    },
    // For SCSS Modules
    {
      files: ['*.module.scss'],
      rules: {
        'selector-class-pattern': [new RegExp(PASCAL_CASE), {resolveNestedSelectors: true}],
        'selector-id-pattern': [new RegExp(PASCAL_CASE), {resolveNestedSelectors: true}],
      },
    },
  ],
}

export default config
