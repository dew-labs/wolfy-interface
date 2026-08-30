export default function markAsStable<T>(value: T) {
  return value as unknown as Stable<T>
}
