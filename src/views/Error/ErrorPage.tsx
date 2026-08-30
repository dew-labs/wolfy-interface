import WolfyBackground from '@/components/WolfyBackground'
import HeadTags from '@/lib/head/HeadTags'

import ErrorComponent from './ErrorComponent';

interface Props {
  errorCode?: string | undefined
  errorMessage?: string | undefined
  reset?: () => void
}

export default function ErrorPage({reset, errorCode, errorMessage}: Readonly<Props>) {

  return (
    <div className='absolute top-0 left-0 size-full bg-background' style={{zIndex: 1000}}>
      <WolfyBackground />
      <HeadTags title='Error' />
      <main className='relative flex h-dvh w-full flex-col items-center justify-center gap-2 p-4'>
        <ErrorComponent reset={reset} errorCode={errorCode} errorMessage={errorMessage} h1 />
      </main>
    </div>
  )
}
