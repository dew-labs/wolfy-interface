import {type Type} from 'arktype'

import filteredArray from './filteredArray'

export default function createCodec<Model extends Type, RawModel extends Type>(
  model: Model,
  rawModel: RawModel,
  encoder: (input: Model['inferOut']) => RawModel['inferIn'],
  decoder: (input: RawModel['inferOut']) => Model['inferOut'],
) {
  const e = model.pipe.try(encoder) // modelIn -> modelOut -> rawModelIn
  const d = rawModel.pipe.try(decoder) // rawModelIn -> rawModelOut -> modelOut

  return {
    encode: (input: Model['inferIn']) => e.assert(input),
    decode: (rawInput: unknown) => d.assert(rawInput),
    validate: (input: unknown) => model.allows(input),
    validateRaw: (rawInput: unknown) => rawModel.allows(rawInput),
    encodeList: (inputs: Model['inferIn'][], filter = true) =>
      (filter ? filteredArray(e) : e.array()).assert(inputs) as RawModel['inferIn'][],
    decodeList: (inputs: unknown[], filter = true) =>
      (filter ? filteredArray(d) : d.array()).assert(inputs) as Model['inferOut'][],
    model,
    rawModel,
  }
}
export type Codec<Model extends Type, RawModel extends Type> = ReturnType<
  typeof createCodec<Model, RawModel>
>

// import {type} from 'arktype'
// export const COUNTRIES = ['CA', 'US'] as const
// const Country = type.enumerated(...COUNTRIES)

// // This is the biggest set of values, support all values
// const User = type({
//   country: Country,
// })
// export type User = typeof User.infer

// // Use to validate form, support only latest valid values
// export const SUPPORTED_COUNTRIES = ['CA'] as const // `US` is not valid any more
// export const FormUser = type({
//   '...': User,
//   'country': type.enumerated(...SUPPORTED_COUNTRIES),
// })

// const RawUser = type({
//   '...': User.omit('country'),
//   'resident': User.get('country'), // response from API can still contains `US` (which previously valid but now invalid)
// })
// export type RawUser = typeof RawUser.infer

// const UserCodec = createCodec(
//   User,
//   RawUser,
//   v => ({
//     resident: v.country,
//   }),
//   v => ({
//     country: v.resident,
//   }),
// )

// // decode: transform from RawUser to User
// const user = UserCodec.decode('anything')
// // encode: transform from User to RawUser
// const rawUser = UserCodec.encode({
//   country: 'UK', // should error
// })
