export default function middleEllipsis(str: string, maxLength = 20) {
  if (str.length <= 30) return str
  const half = Math.floor(maxLength / 2)
  return `${str.slice(0, half)}…${str.slice(-half)}`
}
