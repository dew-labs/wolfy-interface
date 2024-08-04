import DataStoreABI from '@/abis/DataStoreABI'
import ReaderABI from '@/abis/ReaderABI'
import {StarknetChainId} from '@/constants/chains'
import {ADDRESS_ZERO, getContractAddress, newContract} from '@/constants/contracts'
import {getHttpProvider} from '@/constants/rpcProviders'
import {getTokenMetadata, type Token} from '@/constants/tokens'
import toStarknetAddress from '@/lib/starknet/utils/toStarknetAddress'

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
  const provider = getHttpProvider(chainId)

  const dataStoreAddress = getContractAddress(chainId, 'DataStore')
  const dataStoreContract = newContract(DataStoreABI, dataStoreAddress, provider)

  const readerContract = newContract(ReaderABI, getContractAddress(chainId, 'Reader'), provider)

  const marketNum = await dataStoreContract.get_market_count()

  const markets = await readerContract.get_markets(
    {contract_address: dataStoreAddress},
    0,
    marketNum,
  )

  return markets
    .map(market => {
      try {
        const indexTokenHex = toStarknetAddress(market.index_token)
        const longTokenHex = toStarknetAddress(market.long_token)
        const shortTokenHex = toStarknetAddress(market.short_token)
        const marketTokenHex = toStarknetAddress(market.market_token)

        const indexToken = getTokenMetadata(chainId, indexTokenHex)
        const longToken = getTokenMetadata(chainId, longTokenHex)
        const shortToken = getTokenMetadata(chainId, shortTokenHex)

        const isSameCollaterals = market.long_token === market.short_token
        const isSpotOnly = indexTokenHex === ADDRESS_ZERO

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

function getMarketFullName(p: {
  longToken: Token
  shortToken: Token
  indexToken: Token
  isSpotOnly: boolean
}) {
  const {indexToken, longToken, shortToken, isSpotOnly} = p

  return `${getMarketIndexName({indexToken, isSpotOnly})} [${getMarketPoolName({longToken, shortToken})}]`
}

function getMarketIndexName(p: {indexToken: Token; isSpotOnly: boolean}) {
  const {indexToken, isSpotOnly} = p

  if (isSpotOnly) {
    return `SWAP-ONLY`
  }

  return `${indexToken.baseSymbol ?? indexToken.symbol}/USD`
}

function getMarketPoolName(p: {longToken: Token; shortToken: Token}) {
  const {longToken, shortToken} = p

  if (longToken.address === shortToken.address) {
    return longToken.symbol
  }

  return `${longToken.symbol}-${shortToken.symbol}`
}
