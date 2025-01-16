import HeadTags from '@/lib/head/HeadTags'

export default function NotFound() {
  return (
    <div>
      <HeadTags title='Not found' />
      <main className='relative flex h-dvh w-full flex-col items-center justify-center gap-2 p-4'>
        <h1 className='text-center text-4xl font-bold'>404 Not Found</h1>
      </main>
    </div>
  )
}
