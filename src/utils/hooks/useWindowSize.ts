// // TODO: Investigate why we cannot test useSyncExternalStore
// import {useMemo, useSyncExternalStore} from 'react'

// const MOBILE_BREAKPOINT = 1023

// function subscribe(callback: (this: Window, ev: UIEvent) => void) {
//   window.addEventListener('resize', callback)

//   return () => {
//     window.removeEventListener('resize', callback)
//   }
// }

// export default function useWindowSize() {
//   return useSyncExternalStore(subscribe, () => {
//     const windowSize = [window.innerWidth, window.innerHeight]
//     return useMemo(
//       () => ({
//         windowSize,
//         isMobile: windowSize[0] <= MOBILE_BREAKPOINT,
//       }),
//       windowSize,
//     )
//   })
// }

import {useLayoutEffect, useState} from 'react'

import useClientValue from './useClientValue'

const MOBILE_BREAKPOINT = 1023

export default function useWindowSize() {
  const sizes = useClientValue<[number, number], [number, number]>(
    () => [window.innerWidth, window.innerHeight],
    [0, 0], // This is depending on want server side rendering out put is for mobile or desktop
  )
  const [windowSize, setWindowSize] = useState(sizes)

  useLayoutEffect(() => {
    const abortController = new AbortController()

    window.addEventListener(
      'resize',
      () => {
        setWindowSize([window.innerWidth, window.innerHeight])
      },
      {signal: abortController.signal},
    )

    return () => {
      abortController.abort()
    }
  }, [])

  return {
    windowSize,
    isMobile: windowSize[0] <= MOBILE_BREAKPOINT,
  }
}
