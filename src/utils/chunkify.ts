const chunkify = function* <T>(itr: T[], size: number) {
  let chunk: T[] = []
  for (const v of itr) {
    chunk.push(v)
    if (chunk.length === size) {
      yield chunk
      chunk = []
    }
  }
  if (chunk.length) yield chunk
}

export default chunkify
