import {StarknetChainId, toStarknetHexString} from 'satoru-sdk'

export interface Price {
  min: bigint
  max: bigint
}

const market = toStarknetHexString(
  '0x06d2a1092ecd486b30b41d44f0304d1557d416709c4804d6384046a900496049',
)
const eth = toStarknetHexString(
  '0x0161304979f98530f4c3d6659e0a43cad96ceb71531482c7aaba90e07f150315',
)
const usd = toStarknetHexString(
  '0x0585593986c67a9802555dab7c7728270b603da6721ed6f754063eb8fd51f0aa',
)

export default async function fetchTokenPrices(_chainId: StarknetChainId) {
  return Promise.resolve(
    new Map<string, Price>([
      [eth, {min: 3699531877496039000000n, max: 3701098600000000000000n}],
      [usd, {min: 1000000000000000000n, max: 1000000000000000000n}],
      [market, {min: 1500062000000000000n, max: 1600062000000000000n}],
    ]),
  )
}
