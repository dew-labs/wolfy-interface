/** @type {import('tailwindcss').Config} */

import {nextui} from '@nextui-org/react'

export default {
  content: [
    './index.{htm,html}',
    './src/**/*.{?(c|m)[jt]s?(x),vue,svelte}',
    './node_modules/@nextui-org/theme/dist/**/*.?(c|m)[jt]s?(x)',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [nextui()],
}
