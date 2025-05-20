/* eslint-disable @eslint-react/naming-convention/filename -- don't need to follow this convention for this file */
import {Window} from 'happy-dom'
import {act} from 'react'
import {hydrateRoot} from 'react-dom/client'
import {renderToString} from 'react-dom/server'
import {vi} from 'vitest'

export const renderHookServer = <Hook extends () => unknown>(
  useHook: Hook,
  {wrapper: Wrapper}: {wrapper?: ({children}: {children: ReactNode}) => ReactElement} = {},
): {result: {current: ReturnType<Hook> | undefined}; hydrate: () => void} => {
  // Store hook return values
  const results: ReturnType<Hook>[] = []

  const result = {
    get current() {
      return results.slice(-1)[0]
    },
  }

  const setValue = (value: ReturnType<Hook>) => {
    results.push(value)
  }

  const Component = ({useHook}: Readonly<{useHook: Hook}>) => {
    // eslint-disable-next-line react-compiler/react-compiler -- its intentional
    setValue(useHook() as ReturnType<Hook>)
    return null
  }

  const component = Wrapper ? (
    <Wrapper>
      <Component useHook={useHook} />
    </Wrapper>
  ) : (
    <Component useHook={useHook} />
  )

  // Render hook on server
  const serverOutput = renderToString(component)

  // Render hook on client
  const hydrate = () => {
    // Mock DOM API
    const window = new Window()
    vi.stubGlobal('window', window)

    const root = window.document.createElement('div') as unknown as Element
    root.innerHTML = serverOutput

    act(() => {
      hydrateRoot(root, component)
    })
  }

  return {result, hydrate}
}

export type RenderHookServer = typeof renderHookServer
/* eslint-enable @eslint-react/naming-convention/filename */
