import {PriceServiceConnection} from '@pythnetwork/price-service-client'
import {useQueryClient} from '@tanstack/react-query'
import {klona} from 'klona'
import {memo, useEffect} from 'react'

import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import {getTokenPricesQueryKey} from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import {type TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import expandDecimals from '@/utils/numbers/expandDecimals'

export default memo(function TokenPricesUpdater() {
  const [chainId] = useChainId()
  const queryClient = useQueryClient()

  useEffect(() => {
    const tokensMetadata = getTokensMetadata(chainId)
    const queryKey = getTokenPricesQueryKey(chainId)
    const connection = new PriceServiceConnection('https://hermes.pyth.network')

    Array.from(tokensMetadata.values()).forEach(token => {
      if (token.pythFeedId) {
        void connection.subscribePriceFeedUpdates([token.pythFeedId], priceFeed => {
          const priceData = priceFeed.getPriceNoOlderThan(60)
          const priceStr = priceData?.price

          if (!priceStr) return

          const decimals = Math.abs(priceData.expo)
          const price = expandDecimals(priceStr, USD_DECIMALS - decimals)

          if (price) {
            queryClient.setQueryData<TokenPricesData>(queryKey, prevData => {
              if (!prevData) return new Map() as TokenPricesData

              const existingPrice = prevData.get(token.address)
              if (existingPrice && existingPrice.min === price) return prevData

              const newData = klona(prevData)

              newData.set(token.address, {
                min: price,
                max: price,
              })

              return newData
            })
          }
        })
      }
    })

    return () => {
      connection.closeWebSocket()
    }
  }, [queryClient, chainId])
  return null
})
