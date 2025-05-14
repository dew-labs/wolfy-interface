export default function randomlyThrowError(message: string) {
  // eslint-disable-next-line sonarjs/pseudo-random -- its safe
  const result = Math.random() < 0.5
  if (result) throw new Error(message)
}
