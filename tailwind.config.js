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
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            primary: {
              // DEFAULT: 'linear-gradient(233deg, #DB1935 21.41%, #7D000D 72.86%)',
              DEFAULT: '#9b1629',
              foreground: '#FFF',
            },
            // focus: 'linear-gradient(233deg, #DB1935 21.41%, #7D000D 72.86%)',
            focus: '#9b1629',
          },
        },
        light: {
          colors: {
            primary: {
              // DEFAULT: 'linear-gradient(233deg, #DB1935 21.41%, #7D000D 72.86%)',
              DEFAULT: '#9b1629',
              foreground: '#FFF',
            },
            // focus: 'linear-gradient(233deg, #DB1935 21.41%, #7D000D 72.86%)',
            focus: '#9b1629',
          },
        },
      },
    }),
  ],
}
