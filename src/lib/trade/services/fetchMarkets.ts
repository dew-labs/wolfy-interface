import {
  createWolfyContract,
  DataStoreABI,
  getWolfyContractAddress,
  isRepresentZero,
  ReaderABI,
  type StarknetChainId,
  toStarknetHexString,
  WolfyContract,
} from 'wolfy-sdk'

import {getTokenMetadata} from '@/constants/tokens'
import getMarketFullName from '@/lib/trade/utils/market/getMarketFullName'

export interface Market {
  marketTokenAddress: string
  indexTokenAddress: string
  longTokenAddress: string
  shortTokenAddress: string
  isSameCollaterals: boolean
  isSpotOnly: boolean
  name: string
}

export default async function fetchMarkets(chainId: StarknetChainId) {
  const dataStoreAddress = getWolfyContractAddress(chainId, WolfyContract.DataStore)
  const dataStoreContract = createWolfyContract(chainId, WolfyContract.DataStore, DataStoreABI)
  const readerContract = createWolfyContract(chainId, WolfyContract.Reader, ReaderABI)

  const marketNum = await dataStoreContract.get_market_count()

  const markets = await readerContract.get_markets(
    {contract_address: dataStoreAddress},
    0,
    marketNum,
  )

  return markets
    .map(market => {
      try {
        const indexTokenHex = toStarknetHexString(market.index_token)
        const longTokenHex = toStarknetHexString(market.long_token)
        const shortTokenHex = toStarknetHexString(market.short_token)
        const marketTokenHex = toStarknetHexString(market.market_token)

        const indexToken = getTokenMetadata(chainId, indexTokenHex)
        const longToken = getTokenMetadata(chainId, longTokenHex)
        const shortToken = getTokenMetadata(chainId, shortTokenHex)

        const isSameCollaterals = market.long_token === market.short_token
        const isSpotOnly = isRepresentZero(indexTokenHex)

        const name = getMarketFullName({indexToken, longToken, shortToken, isSpotOnly})

        const mk: Market = {
          marketTokenAddress: marketTokenHex,
          indexTokenAddress: indexTokenHex,
          longTokenAddress: longTokenHex,
          shortTokenAddress: shortTokenHex,
          isSameCollaterals,
          isSpotOnly,
          name,
        }
        return mk
      } catch (e) {
        console.warn('unsupported market', e)
        return false
      }
    })
    .filter(Boolean)
}
