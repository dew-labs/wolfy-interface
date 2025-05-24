// import {createLink, type LinkComponent} from '@tanstack/react-router'
// import type {AriaLinkOptions} from 'react-aria'
// import {mergeProps, useFocusRing, useHover, useLink, useObjectRef} from 'react-aria'

// interface RACLinkProps
//   extends Omit<AriaLinkOptions, 'href'>,
//     Omit<
//       ComponentProps<'a'>,
//       'href' | 'download' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'onKeyUp' | 'onClick'
//     > {
//   ref: Ref<HTMLAnchorElement>
// }

// /*
//  * RACLink is a combination of the @tanstack/react-router's Link and react-aria's Link component.
//  */
// const RACLinkComponent = ({ref: forwardedRef, ...props}: RACLinkProps) => {
//   const ref = useObjectRef(forwardedRef)
//   const {isPressed, linkProps} = useLink(props, ref)
//   const {isHovered, hoverProps} = useHover(props)
//   const {isFocusVisible, isFocused, focusProps} = useFocusRing(props)
//   const mergedProps = mergeProps(linkProps, hoverProps, focusProps, props)

//   return (
//     // eslint-disable-next-line jsx-a11y/anchor-has-content -- content will be injected
//     <a
//       {...mergedProps}
//       ref={ref}
//       data-hovered={isHovered || undefined}
//       data-pressed={isPressed || undefined}
//       data-focus-visible={isFocusVisible || undefined}
//       data-focused={isFocused || undefined}
//       data-current={
//         (!!mergedProps['aria-current'] && mergedProps['aria-current'] !== 'false') || undefined
//       }
//     />
//   )
// }

// RACLinkComponent.displayName = 'RACLinkComponent'

// const CreatedLinkComponent = createLink(RACLinkComponent)

// const RACLink: LinkComponent<typeof RACLinkComponent> = props => {
//   return <CreatedLinkComponent preload={'intent'} {...props} />
// }

// export default RACLink
