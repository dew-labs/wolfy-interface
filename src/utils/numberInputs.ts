export function cleanNumberString(str: string) {
  return str.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '')
}
