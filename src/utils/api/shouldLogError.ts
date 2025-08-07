export default function shouldLogError(e: unknown) {
  return !(
    e &&
    typeof e === 'object' &&
    'name' in e &&
    typeof e.name === 'string' &&
    ['CanceledError', 'AbortError'].includes(e.name)
  )
}
