export default function Presentational({children}: PropsWithChildren) {
  return (
    <span style={{display: 'contents'}} aria-hidden inert>
      {children}
    </span>
  )
}
