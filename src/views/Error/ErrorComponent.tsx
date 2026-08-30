import {FocusScope} from '@react-aria/focus'

interface Props {
  errorCode?: string | undefined
  errorMessage?: string | undefined
  reset?: (() => void) | undefined
  h1?: boolean
}

export default function ErrorComponent({reset, errorCode, errorMessage, h1 = false}: Readonly<Props>) {
  const onTryAgain = useCallback(() => {
    if (reset) {
      reset()
    } else {
      globalThis.location.reload()
    }
  }, [reset])

  const Heading = h1 ? 'h1' : 'div'

  return (
    <FocusScope contain restoreFocus>
      <Heading className='text-center text-4xl font-bold' tabIndex={-1}>
        We’re not perfect, error happens{errorCode ? `: ${errorCode}` : '!'}
      </Heading>
      <span>{errorMessage}</span>
      <div>
        <button className='border-spacing-2 border p-2' onClick={onTryAgain}>
          Try again
        </button>
      </div>
    </FocusScope>
  )
}
