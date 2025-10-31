/* eslint-disable @typescript-eslint/no-explicit-any -- its intentional */
export default function markAsMemoized<T>(value: T) {
  return value as unknown as Memoized<T>
}
/* eslint-enable @typescript-eslint/no-explicit-any -- its intentional */
