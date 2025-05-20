export default function VisuallyHidden<
  T extends keyof JSX.IntrinsicElements | ((...args: never[]) => ReactNode),
>({
  as,
  strict,
  isVisible,
  ...props
}: T extends keyof JSX.IntrinsicElements
  ? {
      as?: T
      strict?: boolean
      isVisible?: boolean
    } & JSX.IntrinsicElements[T]
  : {
      as?: T
      strict?: boolean
      isVisible?: boolean
      // @ts-expect-error complex type
    } & ComponentPropsWithRef<T>): ReactElement {
  const Tag = (as ?? 'span') as ElementType

  const classNames = []
  if ('className' in props && typeof props.className === 'string') {
    classNames.push(props.className)
  }
  if (!isVisible) classNames.push(`${strict ? 'strict-' : ''}visually-hidden`)

  return <Tag {...props} className={classNames.join(' ')} />
}

// -----------------------------------------------------------------------------

// function TestComponent(props: PropsWithChildren<{test: boolean}>) {
//   return 'hihi'
// }

// function Test() {
//   return (
//     <>
//       <VisuallyHidden as={TestComponent} test>
//         children
//       </VisuallyHidden>
//       <VisuallyHidden as={TestComponent} test={1} what=''> {/* Should error because `what` is not exist */}
//         children
//       </VisuallyHidden>
//       <VisuallyHidden as='button' srcSet='hihi' type='button'>
//         children
//       </VisuallyHidden>
//       <VisuallyHidden as='img' srcSet='hihi' alt='' what=''>
//         children
//       </VisuallyHidden>
//       <VisuallyHidden
//         as='form'
//         onSubmit={e => {
//           e.preventDefault()
//         }}
//       />
//     </>
//   )
// }
