/* eslint-disable @typescript-eslint/no-explicit-any -- its intentional */
export default function markAsStable<T>(value: T) {
  return value as unknown as Stable<T>
}
/* eslint-enable @typescript-eslint/no-explicit-any -- its intentional */
