import {type Out, type Type, type} from 'arktype'

export default function defaulted<T extends Type, AcceptNull extends boolean = false>(
  forType: T,
  defaultValue: T['infer'],
  acceptNull = false as AcceptNull,
) {
  const typeToTry = acceptNull ? type('undefined | null') : type.undefined

  type TypeIn = AcceptNull extends true ? T['inferIn'] | undefined | null : T['inferIn'] | undefined
  type TypeOut = AcceptNull extends true
    ? Exclude<T['infer'], undefined | null>
    : Exclude<T['infer'], undefined>

  return forType
    .or(typeToTry)
    .pipe(data =>
      data === undefined || (acceptNull && data === null) ? defaultValue : data,
    ) as Type<(In: TypeIn) => Out<TypeOut>>
}
