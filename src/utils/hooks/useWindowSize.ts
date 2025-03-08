function subscribeToResize(callback: (this: Window, ev: UIEvent) => void) {
  const abortController = new AbortController()
  globalThis.addEventListener('resize', callback, {signal: abortController.signal})

  return () => {
    abortController.abort()
  }
}

const MOBILE_BREAKPOINT = 1023
const DEFAULT_WIDTH = 0
const DEFAULT_HEIGHT = 0
const DEFAULT_IS_MOBILE = false

function getWidthSnapshot() {
  if (!globalThis.innerWidth) return DEFAULT_WIDTH

  return globalThis.innerWidth
}

function getHeightSnapshot() {
  if (!globalThis.innerHeight) return DEFAULT_HEIGHT

  return globalThis.innerHeight
}

function getIsMobileSnapshot() {
  if (!globalThis.innerWidth) return DEFAULT_IS_MOBILE

  return globalThis.innerWidth <= MOBILE_BREAKPOINT
}

export function useIsMobile() {
  return useSyncExternalStore(subscribeToResize, getIsMobileSnapshot)
}

/**
 * If you have some deterministic logic that depend solely on width and height of window, use this.
 * Be careful and remember to return cached value or referential-safe value like string, number
 *
 * @param reducer - a function that can take the width and height of window when it changed and produce a result
 * @returns result of reducer
 */
export function useWindowSizeReducer<T>(reducer: (width: number, height: number) => T) {
  return useSyncExternalStore(subscribeToResize, () =>
    reducer(getWidthSnapshot(), getHeightSnapshot()),
  )
}

export default function useWindowSize() {
  // NOTE: we prefer `useState` over `useRef` because it come with purity check in <StrictMode>
  // eslint-disable-next-line @eslint-react/naming-convention/use-state -- don't need to
  const [isSubscribedTo] = useState({
    width: false,
    height: false,
    isMobile: false,
  })

  const width = useSyncExternalStore(subscribeToResize, () => {
    if (!isSubscribedTo.width) return DEFAULT_WIDTH
    return getWidthSnapshot()
  })

  const height = useSyncExternalStore(subscribeToResize, () => {
    if (!isSubscribedTo.height) return DEFAULT_HEIGHT
    return getHeightSnapshot()
  })

  const isMobile = useSyncExternalStore(subscribeToResize, () => {
    if (!isSubscribedTo.isMobile) return DEFAULT_IS_MOBILE
    return getIsMobileSnapshot()
  })

  const target = {
    width,
    height,
    isMobile,
  } as const

  return new Proxy(target, {
    get(target, prop, receiver) {
      // eslint-disable-next-line react-compiler/react-compiler -- it's okay
      isSubscribedTo[prop as keyof typeof target] = true
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- it's safe
      return Reflect.get(target, prop, receiver)
    },
  })
}
