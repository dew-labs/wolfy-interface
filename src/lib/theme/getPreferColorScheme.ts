import {Theme} from './theme'

export default function getPreferColorScheme() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- can run in environments without window.matchMedia
  if (window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.Dark : Theme.Light
  }
  return Theme.Dark
}
