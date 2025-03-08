import type {Type} from 'arktype'

export default function noThrow<T extends Type>(t: T): T {
  return t.configure({
    // @ts-expect-error -- it's safe
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- it's safe
    onFail: e => e,
  })
}
