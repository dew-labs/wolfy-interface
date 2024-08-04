import {type BigNumberish, num} from 'starknet'

export default function toStarknetAddress(address: BigNumberish) {
  return '0x' + num.toHex(address).slice(2).padStart(64, '0')
}
