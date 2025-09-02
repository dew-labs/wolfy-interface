import type {SuspenseProps} from 'react'

interface Props {
  onLoad?: (() => void) | undefined
  onReady?: (() => void) | undefined
  onUnload?: (() => void) | undefined
}

const Loader = function Loader({onLoad, onReady, onUnload, children}: PropsWithChildren<Props>) {
  if (onLoad) {
    onLoad()
  }

  useEffect(() => {
    if (onReady) {
      onReady()
    }

    return () => {
      if (onUnload) {
        onUnload()
      }
    }
  }, [onReady, onUnload])

  return <>{children}</>
}

/**
 * A suspense component that allows you to run callbacks when the it is loaded, ready, and unloaded.
 * This is useful when the suspenseful component don't have or we not sure it have a root DOM node so we couldn't use ref callbacks. https://react.dev/blog/2024/12/05/react-19#cleanup-functions-for-refs
 *
 * @param props - The props of the BetterSuspense component.
 * @param props.name - The name of the suspenseful component.
 * @param props.fallback - The fallback component to show while the suspenseful component is loading.
 * @param props.onLoad - The callback to call when the suspenseful component is loaded.
 * @param props.onReady - The callback to call when the suspenseful component is ready.
 * @param props.onUnload - The callback to call when the suspenseful component is unloaded.
 * @param props.children - The component that need to be suspenseful
 * @returns The suspenseful component.
 */
export default function BetterSuspense({
  name,
  fallback,
  children,
  onLoad,
  onReady,
  onUnload,
}: PropsWithChildren<Props & SuspenseProps>) {
  return (
    <Suspense name={name} fallback={fallback}>
      <Loader onLoad={onLoad} onReady={onReady} onUnload={onUnload}>
        {children}
      </Loader>
    </Suspense>
  )
}
