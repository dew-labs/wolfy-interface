declare module '*.lottie' {
  const src: string
  export default src
}

declare module '*?lqip' {
  const lqip: {lqip: string; width: number; height: number; src: string}
  export default lqip
}

declare module '*picture-image-tools' {
  const imageToolsPicture: {
    img: {
      h: number
      w: number
      src: string
    }
    sources: Record<string, string>
  }
  export default imageToolsPicture
}

declare module '*srcset-image-tools' {
  const imageToolsSrcSet: string
  export default imageToolsSrcSet
}

declare module '*metadata-image-tools' {
  const imageToolsMetadata: {
    src: string // URL of the generated image
    width: number // Width of the image
    height: number // Height of the image
    format: string // Format of the generated image

    // The following options are the same as sharps input options
    space: string // Name of colour space interpretation
    channels: number // Number of bands e.g. 3 for sRGB, 4 for CMYK
    density: number //  Number of pixels per inch
    depth: string // Name of pixel depth format
    hasAlpha: boolean // presence of an alpha transparency channel
    hasProfile: boolean // presence of an embedded ICC profile
    isProgressive: boolean // indicating whether the image is interlaced using a progressive scan
  }[]
  export default imageToolsMetadata
}

declare module '*`url-image-tools`' {
  const imageToolsUrl: string[]
  export default imageToolsUrl
}
