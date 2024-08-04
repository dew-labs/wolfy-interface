import {StarknetChainId} from '@/constants/chains'

export interface Price {
  min: bigint
  max: bigint
}

export default async function fetchTokenPrices(_chainId: StarknetChainId) {
  return Promise.resolve(
    new Map<string, Price>([
      [
        '0x042c1a16c9cd00af9ea4a42e70776abc43f3d9583c2f259115df6e33a5e1baab',
        {min: 3699531877496039n, max: 3701098600000000n},
      ], // zETH
      [
        '0x06f20e6aec861fbfe738dc9b639832ff449a5ce762cbcfbe84132561cab49e54',
        {min: 999900000000000000000000n, max: 1000062000000000000000000n},
      ], // USDC
      [
        '0x06c91e45243196580079bb9287555b4c3abe453fc54b98176c8cda9758b29504',
        {min: 1500062000000000000000000n, max: 1600062000000000000000000n},
      ], // GM zETH/USDC
      [
        '0x020e9f2751212c9858219250e875ce6ac02aba3d45bff8262f5f0f0a1cf1aee0',
        {min: 3699531877496039n, max: 3701098600000000n},
      ], // wETH
      [
        '0x026c9f97a5e7ae83320675f691457fbf5222366da33df5f2a0c7b77c28529ef3',
        {min: 1600062000000000000000000n, max: 1700062000000000000000000n},
      ], // GM wETH/USDc
    ]),
  )
}
