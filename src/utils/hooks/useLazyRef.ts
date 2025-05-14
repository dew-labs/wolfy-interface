// Steal from https://github.com/Shopify/quilt/blob/main/packages/react-hooks/src/hooks/lazy-ref.ts
// https://thoughtspile.github.io/2021/11/30/lazy-useref/

export function useLazyRef<T>(getValue: () => T) {
  // eslint-disable-next-line @eslint-react/naming-convention/use-state -- not needed
  const [value] = useState<T>(getValue)
  return useRef<T>(value)
}
