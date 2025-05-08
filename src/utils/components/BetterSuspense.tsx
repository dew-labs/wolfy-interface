import type {SuspenseProps} from 'react'

interface Props {
  onLoad?: (() => void) | undefined
  onReady?: (() => void) | undefined
  onUnload?: (() => void) | undefined
}

const Loader = ({onLoad, onReady, onUnload, children}: PropsWithChildren<Props>) => {
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
