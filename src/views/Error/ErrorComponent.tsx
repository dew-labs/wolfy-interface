import {useCallback} from 'react'
import {FocusScope} from 'react-aria'

import WolfyBackground from '@/components/WolfyBackground'
import HeadTags from '@/lib/head/HeadTags'

interface Props {
  errorCode?: string | undefined
  errorMessage?: string | undefined
  reset?: () => void
}

export default function ErrorComponent({reset, errorCode, errorMessage}: Readonly<Props>) {
  const onTryAgain = useCallback(() => {
    if (reset) {
      reset()
    } else {
      location.reload()
    }
  }, [reset])

  return (
    <div className='absolute left-0 top-0 size-full bg-background' style={{zIndex: 1000}}>
      <WolfyBackground />
      <HeadTags title='Error' />
      <main className='relative flex h-dvh w-full flex-col items-center justify-center gap-2 p-4'>
        <FocusScope contain restoreFocus>
          <h1 className='text-center text-4xl font-bold' tabIndex={-1}>
            We’re not perfect, error happens{errorCode ? `: ${errorCode}` : '!'}
          </h1>
          <span>{errorMessage}</span>
          <div>
            <button className='border-spacing-2 border p-2' onClick={onTryAgain}>
              Try again
            </button>
          </div>
        </FocusScope>
      </main>
    </div>
  )
}
