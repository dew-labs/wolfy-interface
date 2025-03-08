import {type Out, type Type} from 'arktype'

export default function createCodec<Model, RawModel>(
  model: Type<(In: Model) => Out<Model>> | Type<Model>,
  rawModel: Type<(In: RawModel) => Out<RawModel>> | Type<RawModel>,
  encoder: (input: Model) => RawModel,
  decoder: (input: RawModel) => Model,
) {
  const e = model.pipe.try(encoder)
  const d = rawModel.pipe.try(decoder)

  return {
    // @ts-expect-error -- complex type
    encode: (input: Model) => e.from(input) as RawModel,
    decode: (rawInput: unknown) => d.assert(rawInput) as Model,
    validate: (input: unknown) => model.allows(input),
    validateRaw: (rawInput: unknown) => rawModel.allows(rawInput),
    model,
    rawModel,
  }
}
export type Codec<Model, RawModel> = ReturnType<typeof createCodec<Model, RawModel>>

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
//   'resident': User.get('country'), // response from APi can still contains `US` (which previously valid but now invalid)
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
//   country: 'UK',
// })
