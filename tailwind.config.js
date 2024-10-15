/** @type {import('tailwindcss').Config} */

import {nextui} from '@nextui-org/react'

export default {
  content: [
    './index.{htm,html}',
    './src/**/*.{?(c|m)[jt]s?(x),vue,svelte}',
    './node_modules/@nextui-org/theme/dist/**/*.?(c|m)[jt]s?(x)',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Mono'],
        mono: ['Geist Mono'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        dark: {
          layout: {
            radius: {
              small: '0',
              medium: '0',
              large: '0',
            },
            borderWidth: {
              small: '2px',
              medium: '3px',
              large: '4px',
            },
          },
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
          layout: {
            radius: {
              small: '0',
              medium: '0',
              large: '0',
            },
            borderWidth: {
              small: '2px',
              medium: '3px',
              large: '4px',
            },
          },
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
