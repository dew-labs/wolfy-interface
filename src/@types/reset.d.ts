// Do not add any other lines of code to this file!
import '@total-typescript/ts-reset'

declare global {
  // NOTE: waiting for https://github.com/total-typescript/ts-reset/pull/151
  interface ArrayConstructor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- its intentional
    isArray(arg: any): arg is unknown[] | readonly unknown[]
  }

  interface String {
    startsWith<T extends string>(searchString: T & {}, position?: 0): this is `${T}${string}`

    endsWith<T extends string>(searchString: T & {}, position?: 0): this is `${string}${T}`
  }
}
