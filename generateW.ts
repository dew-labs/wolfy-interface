// Best for desktop: 5K is 5120×2880, 4K (UHD) is 3840x2160
// Best for mobile: QHD+: 3200×1800, QHD is 2560x1440

// Width and height can be either:
// - From the best quality image that you can get
// - Or from the biggest size in the design * (2 if on desktop, 3 if < tablet)
// endAtW should be the smallest breakpoint
export default function generateW(
  width: number,
  height: number,
  endAtW: number,
  ratio = 0.7,
  decrease = 0.1,
) {
  let w = width
  let h = height
  let r = ratio

  const aspectRatio = height / width

  const result = []

  while (w > endAtW) {
    result.push(w)
    w = Math.round(Math.sqrt((w * h * r) / aspectRatio))
    h = aspectRatio * w
    r -= decrease
  }

  return result.join(';')
}
