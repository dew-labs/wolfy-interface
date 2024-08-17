import {StarknetChainId} from 'satoru-sdk'

import {getTokensMetadata, type Token} from '@/constants/tokens'
import fetchTokenBalances from '@/lib/trade/services/fetchTokenBalances'

import fetchTokenPrices, {type Price} from './fetchTokenPrices'

export interface TokenData extends Token {
  price: Price
  balance: bigint
}

export type TokensData = Map<string, TokenData>

export default async function fetchTokensData(
  chainId: StarknetChainId,
  accountAddress: string | undefined,
): Promise<TokensData> {
  const [tokenPrices, tokenBalances] = await Promise.all([
    fetchTokenPrices(chainId),
    fetchTokenBalances(chainId, accountAddress),
  ])

  const tokensMetadata = getTokensMetadata(chainId)
  const tokens = new Map<string, TokenData>()

  tokensMetadata.forEach(tokenMetadata => {
    const price = tokenPrices.get(tokenMetadata.address)
    if (!price) {
      console.warn(`Missing price for token ${tokenMetadata.address}`)
      return false
    }
    tokens.set(tokenMetadata.address, {
      ...tokenMetadata,
      price: price,
      balance: tokenBalances.get(tokenMetadata.address) ?? 0n,
    })
  })

  return tokens
}
