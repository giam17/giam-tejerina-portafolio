import { imageCatalog } from './catalog.generated'

/** Widths reflect the current 1440 px composition. Mobile reflow can supply its own sizes. */
export function responsiveImage(src: string, options: { eager?: boolean; sizes?: string; mobileSizes?: string } = {}) {
  const asset = imageCatalog.get(src)
  const mobileSizes = options.mobileSizes ?? (asset && asset.designWidth >= 780 ? 'calc(100vw - 40px)' : asset && asset.designWidth <= 85 ? '72px' : asset && asset.designWidth <= 182 ? '108px' : 'calc(50vw - 28px)')
  return {
    decoding: 'async' as const,
    ...(asset ? {
      srcSet: asset.candidates.map(candidate => `${candidate.src} ${candidate.width}w`).join(', '),
      sizes: options.sizes ?? `(max-width: 900px) ${mobileSizes}, ${(asset.designWidth / 1440 * 100).toFixed(4)}vw`,
      loading: options.eager ? 'eager' as const : 'lazy' as const,
    } : {}),
  }
}

/** Preload animation expressions using the same responsive selection as their DOM images. */
export function loadImage(src: string, options: { sizes?: string; mobileSizes?: string } = {}) {
  return new Promise<void>(resolve => {
    const image = new Image()
    const props = responsiveImage(src, { ...options, eager: true })
    image.onload = image.onerror = () => resolve()
    if (props.sizes) image.sizes = props.sizes
    if (props.srcSet) image.srcset = props.srcSet
    image.src = src
    if (image.complete) resolve()
  })
}

/** Reveal animations may hide their images; explicitly start loading when the reveal enters view. */
export function decodeImages(images: HTMLImageElement[]) {
  return Promise.all(images.map(image => {
    image.loading = 'eager'
    return image.decode().catch(() => undefined)
  }))
}
