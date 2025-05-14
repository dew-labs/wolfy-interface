import type {ReadonlyDeep} from 'type-fest'

interface SkipLinkProps {
  title: string
  to: `#${string}`
}

export default memo(function SkipLink({title, to: href}: ReadonlyDeep<SkipLinkProps>) {
  return (
    <a href={href} className='skip-link visually-hidden'>
      {title}
    </a>
  )
})
