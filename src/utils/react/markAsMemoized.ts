export default function markAsMemoized<T>(value: T) {
  return value as unknown as Memoized<T>
}
