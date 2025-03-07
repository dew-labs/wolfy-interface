import {configure} from 'arktype/config'
import {klona} from 'klona'

export const arkTypeConfig = configure({
  numberAllowsNaN: false,
  clone: klona,
  onUndeclaredKey: 'delete',
  onFail: errors => errors.throw(),
  dateAllowsInvalid: false,
})

declare global {
  interface ArkEnv {
    onFail: typeof arkTypeConfig.onFail
  }
}
