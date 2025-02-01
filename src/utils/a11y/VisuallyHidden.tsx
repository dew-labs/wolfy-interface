function VisuallyHidden<
  T extends keyof React.JSX.IntrinsicElements | ((...args: never[]) => React.ReactNode),
>({
  as,
  strict,
  isNotHiddenAnymore,
  ...props
}: Readonly<
  T extends keyof React.JSX.IntrinsicElements
    ? {
        as?: T
        strict?: boolean
        isNotHiddenAnymore?: boolean
      } & React.JSX.IntrinsicElements[T]
    : {
        as?: T
        strict?: boolean
        isNotHiddenAnymore?: boolean
        // @ts-expect-error -- in order to have typecheck, do not change the type of T in generic
      } & React.ComponentProps<T>
>): React.JSX.Element {
  const Tag = (as ?? 'span') as React.JSX.ElementType

  const classNames = []
  if ('className' in props && typeof props.className === 'string') {
    classNames.push(props.className)
  }
  if (!isNotHiddenAnymore) classNames.push(`${strict ? 'strict-' : ''}visually-hidden`)

  return <Tag {...props} className={classNames.join(' ')} />
}

export default memo(VisuallyHidden) as unknown as typeof VisuallyHidden // Somehow wrap in memo changes the type of the component

// -----------------------------------------------------------------------------

// function TestComponent(props: PropsWithChildren<{test: boolean}>) {
//   return 'hihi'
// }

// function Test() {
//   return (
//     <>
//       <VisuallyHidden as={TestComponent} test={true}>
//         children
//       </VisuallyHidden>
//       <VisuallyHidden as={TestComponent} test={1}>
//         children
//       </VisuallyHidden>
//       <VisuallyHidden as='button' srcSet='hihi'>
//         children
//       </VisuallyHidden>
//       <VisuallyHidden as='img' srcSet='hihi'>
//         children
//       </VisuallyHidden>
//     </>
//   )
// }
