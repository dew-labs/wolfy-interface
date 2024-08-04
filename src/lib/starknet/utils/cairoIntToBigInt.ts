import {CairoUint256, CairoUint512} from 'starknet'

interface U256 {
  low: bigint
  high: bigint
}

interface U512 {
  limb0: bigint
  limb1: bigint
  limb2: bigint
  limb3: bigint
}

interface SignedInteger {
  mag: number | bigint | U256 | U512
  sign: boolean
}

function isU256(num: unknown): num is U256 {
  return (
    num !== null &&
    typeof num === 'object' &&
    'low' in num &&
    'high' in num &&
    typeof num.low === 'bigint' &&
    typeof num.high === 'bigint'
  )
}

function isU512(num: unknown): num is U512 {
  return (
    num !== null &&
    typeof num === 'object' &&
    'limb0' in num &&
    'limb1' in num &&
    'limb2' in num &&
    'limb3' in num &&
    typeof num.limb0 === 'bigint' &&
    typeof num.limb1 === 'bigint' &&
    typeof num.limb2 === 'bigint' &&
    typeof num.limb3 === 'bigint'
  )
}

function isSignedInteger(num: unknown): num is SignedInteger {
  return (
    num !== null &&
    typeof num === 'object' &&
    'sign' in num &&
    typeof num.sign === 'boolean' &&
    'mag' in num &&
    (typeof num.mag === 'number' ||
      typeof num.mag === 'bigint' ||
      isU256(num.mag) ||
      isU512(num.mag))
  )
}

export default function cairoIntToBigInt(
  num: string | number | bigint | U256 | U512 | SignedInteger,
): bigint {
  if (typeof num === 'object') {
    if (isSignedInteger(num)) return cairoIntToBigInt(num.mag) * (num.sign ? -1n : 1n)
    if (isU256(num)) return new CairoUint256(num).toBigInt()
    return new CairoUint512(num).toBigInt()
  }
  return BigInt(num)
}
