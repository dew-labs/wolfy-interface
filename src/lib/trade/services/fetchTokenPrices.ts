import {StarknetChainId, toStarknetHexString} from 'satoru-sdk'

import expandDecimals from '@/utils/numbers/expandDecimals'

export interface Price {
  min: bigint
  max: bigint
}

const usds = [
  '0x0585593986c67a9802555dab7c7728270b603da6721ed6f754063eb8fd51f0aa',
  '0x048083d5ab62164271184b3333e3acf9ef88b99e6d1f6a27e7a1e8b7e75d2127',
].map(toStarknetHexString)

const eth = toStarknetHexString(
  '0x0161304979f98530f4c3d6659e0a43cad96ceb71531482c7aaba90e07f150315',
)
const strk = toStarknetHexString(
  '0x0257f31f11fa095874ded95a8ad6c8dca9fb851557df83e7cd384bde65c4d1c4',
)
const btc = toStarknetHexString(
  '0x07e3b6dce9c3b052e96a63d63f26aa129a1c5342343a7bb9a20754812bf4e614',
)

function randomPrice(value: bigint, decimals = 18) {
  const rand = BigInt(Math.round(Math.random() * Number(expandDecimals(1, decimals + 1))))
  const rand2 = BigInt(Math.round(Math.random() * Number(expandDecimals(1, decimals + 1))))
  return {
    min: value + rand,
    max: value + rand + rand2,
  }
}

export default async function fetchTokenPrices(_chainId: StarknetChainId) {
  return Promise.resolve(
    new Map<string, Price>([
      ...usds.map(usd => [usd, {min: 1_000000000000000000n, max: 1_000000000000000000n}] as const),
      [eth, randomPrice(3699_531877496039000000n)],
      [strk, randomPrice(35_3170000000000000n)],
      [btc, randomPrice(63867_756237461927468276n, 8)],
    ]),
  )
}
