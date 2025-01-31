/* eslint-disable @typescript-eslint/no-explicit-any -- its intentional */
export default function markAsMemoized<T extends (...args: any[]) => any>(callback: T) {
  return callback as unknown as MemoizedCallback<T>
}
/* eslint-enable @typescript-eslint/no-explicit-any -- its intentional */
