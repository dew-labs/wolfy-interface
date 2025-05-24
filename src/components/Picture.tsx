import cssEscape from 'css.escape'
import {preload as reactDomPreload} from 'react-dom'
import type {SetRequired} from 'type-fest'

interface PictureImageTools {
  img: {
    h: number
    w: number
    src: string
  }
  sources: Record<string, string>
}

interface Lqip {
  lqip: string
  width?: number
  height?: number
  src?: string
}

interface Src {
  /**
   * Media query of the source
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source#media
   */
  media?: string
  /**
   * Picture source, imported from `?&picture-image-tools`
   */
  pic: PictureImageTools
  /**
   * LQIP (Low quality image placeholder) source, imported from '?lqip'
   */
  lqip?: Lqip
}

export interface PictureProps extends Omit<ComponentProps<'img'>, 'id' | 'src'> {
  /**
   * Can be a single or an list of {@link Src}, if was an array, all item in the list should also have `media`
   */
  src: Src | SetRequired<Src, 'media'>[]
  /**
   * List of source sizes that describe the final rendered width of the image.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source#sizes
   */
  sizes?: string
  /**
   * Preload this picture
   */
  preload?: boolean
  ref?: Ref<HTMLImageElement>
}

const PRELOAD_PRIORITY = ['avif', 'webp', 'png', 'jpeg', 'gif'] as const // mime format

/**
 * This is a `next/image` replacement. Auto `srcSet`, `width`, `height`, integrated with LQIP (Low quality image placeholder)
 *
 * @example
 * ```tsx
 * import heroBackgroundLqip from '@/assets/hero-background.jpeg?lqip'
 * import heroBackgroundImg from '@/assets/hero-background.jpeg?minW=1024&picture-image-tools'
 * import heroBackgroundMobileLqip from '@/assets/hero-background-mobile.jpg?lqip'
 * import heroBackgroundMobileImg from '@/assets/hero-background-mobile.jpg?minW=420&picture-image-tools'
 *
 * <Picture
 *   src={[
 *     {
 *       pic: heroBackgroundImg,
 *       lqip: heroBackgroundLqip,
 *       media: 'min-width: 64rem',
 *     },
 *     {
 *       pic: heroBackgroundMobileImg,
 *       lqip: heroBackgroundMobileLqip,
 *       media: 'max-width: 63.9375rem',
 *     },
 *   ]}
 *   fetchPriority='high'
 *   className={clsx(style.Hero)}
 *   preload
 * />
 * ```
 * @param props - Component's properties {@link PictureProps}
 * @returns Picture component
 */
export default memo(function Picture({src, sizes, preload = false, ...rest}: PictureProps) {
  const id = useId()

  const srcs = Array.isArray(src) ? src : [src]

  if (preload) {
    srcs.forEach(src => {
      // Find the best format and preload only that format, specifying preloading for multiple types of the same resource is discouraged. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload#including_a_mime_type
      for (const format of PRELOAD_PRIORITY) {
        const srcSet = src.pic.sources[format]
        if (srcSet) {
          reactDomPreload(src.pic.img.src, {
            // https://react.dev/blog/2024/12/05/react-19#support-for-preloading-resources
            as: 'image',
            type: `image/${format}`,
            fetchPriority: rest.fetchPriority ?? 'auto',
            imageSrcSet: srcSet,
            imageSizes: sizes,
            media: src.media,
          })
          break
        }
      }
    })
  }

  const sources = srcs.flatMap(s => {
    return Object.entries(s.pic.sources).map(([format, srcSet]) => ({
      format,
      srcSet,
      media: s.media,
      img: s.pic.img,
    }))
  })

  const lqips = (
    Array.isArray(src)
      ? src.map(s => ({
          media: s.media,
          lqip: s.lqip?.lqip,
          img: s.pic.img,
        }))
      : [
          {
            media: src.media,
            lqip: src.lqip?.lqip,
            img: src.pic.img,
          },
        ]
  ).filter(({lqip}) => !!lqip)

  return (
    <picture style={{display: 'contents'}}>
      {sources.map(({format, srcSet, media}) => (
        <source
          key={`${format}-${media}`}
          type={`image/${format}`}
          srcSet={srcSet}
          sizes={sizes}
          media={media && `(${media})`}
        />
      ))}
      {lqips.map(({lqip, media}) => (
        <style key={media}>
          {media && `@media (${media}){`}
          {`#${cssEscape(id)}{`}
          {`background-image:url(${lqip});`}
          {`background-size:cover;`}
          {/* // Content can act as src, but it don't work with `source`, even if `source` picked up, it still load */}
          {/* {`content:url(${img.src})`} */}
          {`}`}
          {media && `}`}
        </style>
      ))}
      <img
        // There's no way to dynamically load src, width, height based on media query. So img without src is considered okay since most browser support <picture>
        src={srcs[0]?.pic.img.src}
        width={srcs[0]?.pic.img.w}
        height={srcs[0]?.pic.img.h}
        alt=''
        {...rest}
        id={id}
      />
    </picture>
  )
})
