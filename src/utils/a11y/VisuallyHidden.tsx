import type {JSXElementConstructor} from 'react'

export default function VisuallyHidden<T extends ElementType = 'span'>({
  as = 'span',
  strict,
  isVisible,
  ...props
}: T extends ElementType
  ? {
      as?: T
      strict?: boolean
      isVisible?: boolean
    } & (T extends JSXElementConstructor<never> // cannot use `unknown` because it will not be able to infer the type
      ? ComponentPropsWithoutRef<T> & Pick<ComponentPropsWithRef<T>, 'ref'> // Cannot infer `ref` type when using `ComponentPropsWithRef`
      : T extends keyof JSX.IntrinsicElements
        ? ComponentPropsWithRef<T>
        : never)
  : never) {
  const Component = as

  const classNames = []
  if ('className' in props && typeof props.className === 'string') {
    classNames.push(props.className)
  }
  if (!isVisible) classNames.push(`${strict ? 'strict-' : ''}visually-hidden`)

  return <Component {...props} className={classNames.join(' ')} />
}

// -----------------------------------------------------------------------------

// /* eslint-disable @typescript-eslint/no-empty-function, react-perf/jsx-no-new-function-as-prop, @typescript-eslint/no-unused-vars, i18next/no-literal-string -- for testing*/
// function TestComponent(
//   _props: PropsWithChildren<{test: boolean; ref: RefCallback<HTMLDivElement>}>,
// ) {
//   return 'hihi'
// }

// function Test() {
//   const ref = useRef<HTMLDivElement>(null)
//   return (
//     <>
//       <TestComponent ref={ref} />
//       <VisuallyHidden as={TestComponent} test ref={node => {}}>
//         children
//       </VisuallyHidden>
//       <VisuallyHidden as={TestComponent} test={1} what=''>
//         {/* Should error because `what` is not exist */}
//         children
//       </VisuallyHidden>
//       <VisuallyHidden as='button' srcSet='hihi' type='button'>
//         children
//       </VisuallyHidden>
//       <VisuallyHidden
//         as='img'
//         srcSet='hihi'
//         alt=''
//         what=''
//         ref={node => {
//           console.log(node)
//         }}
//       >
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
// /* eslint-enable @typescript-eslint/no-empty-function, react-perf/jsx-no-new-function-as-prop, @typescript-eslint/no-unused-vars, i18next/no-literal-string */
