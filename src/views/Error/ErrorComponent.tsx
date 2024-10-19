import {useEffect} from 'react'

import HeadTags from '@/lib/head/HeadTags'

interface Props {
  errorCode?: string
  errorMessage?: string
  reset?: () => void
}

export default function ErrorComponent({reset, errorCode, errorMessage}: Readonly<Props>) {
  useEffect(() => {
    localStorage.clear()
  }, [])

  return (
    <div>
      <HeadTags title='Error' />
      <main className='relative flex h-[100dvh] w-full flex-col items-center justify-center gap-2 p-4'>
        <h1 className='text-center text-4xl font-bold'>
          We’re not perfect, error happens{errorCode ? ': ' + errorCode : '!'}
        </h1>
        <span>{errorMessage}</span>
        <div>
          <button
            className='border-spacing-2 border p-2'
            onClick={() => {
              if (reset) {
                reset()
              } else {
                location.reload()
              }
            }}
          >
            Try again
          </button>
        </div>
      </main>
    </div>
  )
}
