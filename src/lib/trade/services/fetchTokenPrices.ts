import {PriceServiceConnection} from '@pythnetwork/price-service-client'
import {StarknetChainId} from 'satoru-sdk'

import {getTokensMetadata} from '@/constants/tokens'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import expandDecimals from '@/utils/numbers/expandDecimals'

export interface Price {
  min: bigint
  max: bigint
}

export type TokenPricesData = Map<string, Price>

export default async function fetchTokenPrices(chainId: StarknetChainId) {
  const tokensMetadata = getTokensMetadata(chainId)

  const connection = new PriceServiceConnection('https://hermes-beta.pyth.network')
  const data: TokenPricesData = new Map()

  const tokens = Array.from(tokensMetadata.values())
    .map(token => {
      if (token.pythFeedId) return token
    })
    .filter(Boolean)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- guranteed
  const feedIds = tokens.map(token => token.pythFeedId!)

  const priceFeeds = await connection.getLatestPriceFeeds(feedIds)

  if (!priceFeeds) return data

  priceFeeds.forEach((priceFeed, index) => {
    const token = tokens.at(index)
    if (!token) return

    const priceData = priceFeed.getPriceNoOlderThan(60)
    const decimals = priceData ? Math.abs(priceData.expo) : 0
    const price = !!priceData?.price && expandDecimals(priceData.price, USD_DECIMALS - decimals)

    if (!price) return

    data.set(token.address, {
      min: price,
      max: price + 1n,
    })
  })

  return data
}
