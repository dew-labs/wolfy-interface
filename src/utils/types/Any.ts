export type Any =
  | string
  | boolean
  | bigint
  | null
  | undefined
  | symbol
  | object
  | number
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- it's fine
  | {}
  | Any[]
