export default function NotFoundComponent({h1 = false}: {h1?: boolean} = {}) {

  const Heading = h1 ? 'h1' : 'div'

  return (
    <Heading className='text-center text-4xl font-bold'>404 Not Found</Heading>
  )
}
