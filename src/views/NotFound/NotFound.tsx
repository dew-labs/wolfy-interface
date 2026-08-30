import HeadTags from '@/lib/head/HeadTags'

import NotFoundComponent from './NotFoundComponent';

export default function NotFound() {
  return (
    <div>
      <HeadTags title='Not found' />
      <main className='relative flex h-dvh w-full flex-col items-center justify-center gap-2 p-4'>
        <NotFoundComponent h1/>
      </main>
    </div>
  )
}
