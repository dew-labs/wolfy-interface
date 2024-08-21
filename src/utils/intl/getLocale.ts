export default function getLocale() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- old browser support
  return navigator.languages?.length ? navigator.languages[0] : navigator.language
}
