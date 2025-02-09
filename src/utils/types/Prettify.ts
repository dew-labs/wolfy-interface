export type Prettify<T> = {[K in keyof T]: T[K]} & {}

// Examples
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- example
type Intersected = {a: string} & {b: number} & {c: boolean}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- example
type IntersectedPrettified = Prettify<{a: string} & {b: number} & {c: boolean}>
