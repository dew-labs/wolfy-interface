import {ArkErrors} from 'arktype'

export default function isTypeError(e: unknown) {
  return e instanceof ArkErrors
}
