/** @type {import('tailwindcss').Config} */

import {heroui} from '@heroui/react'

import globs from './globs.js'

export default {
  content: globs.TAILWIND_CONTENT,
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist Mono'],
        serif: ['Pixelify Sans'], // Use for highlight
        mono: ['Geist Mono'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        dark: {
          layout: {
            radius: {small: '0', medium: '0', large: '0'},
            borderWidth: {small: '2px', medium: '3px', large: '4px'},
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
            radius: {small: '0', medium: '0', large: '0'},
            borderWidth: {small: '2px', medium: '3px', large: '4px'},
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
