import type {Hashable, StarknetChainId} from 'satoru-sdk'
import {
  cairoIntToBigInt,
  createSatoruContract,
  DataStoreABI,
  getSatoruContractAddress,
  poseidonHash,
  ReaderABI,
  SatoruContract,
  toStarknetHexString,
} from 'satoru-sdk'
import invariant from 'tiny-invariant'

import {UI_FEE_RECEIVER_ADDRESS} from '@/constants/config'
import {getTokenMetadata} from '@/constants/tokens'
import {logError} from '@/utils/logger'
import expandDecimals from '@/utils/numbers/expandDecimals'

import type {Market} from './fetchMarkets'
import type {MarketsData} from './fetchMarketsData'
import type {Price, TokenPricesData} from './fetchTokenPrices'

// export function getStringReprenetationOfPosition(
//   account: string,
//   marketAddress: string,
//   collateralAddress: string,
//   isLong: boolean,
// ) {
//   return `${account}:${marketAddress}:${collateralAddress}:${isLong}`
// }

export function hashedPositionKey(
  account: Hashable,
  market: Hashable,
  collateralToken: Hashable,
  isLong: boolean,
) {
  return poseidonHash([account, market, collateralToken, isLong])
}

export function convertToContractPrice(price: bigint, tokenDecimals: number) {
  return price / expandDecimals(1, tokenDecimals)
}

export function convertToContractTokenPrices(prices: Price, tokenDecimals: number) {
  return {
    min: convertToContractPrice(prices.min, tokenDecimals),
    max: convertToContractPrice(prices.max, tokenDecimals),
  }
}

export interface MarketPrice {
  index_token_price: {
    min: bigint
    max: bigint
  }
  long_token_price: {
    min: bigint
    max: bigint
  }
  short_token_price: {
    min: bigint
    max: bigint
  }
}

export function getMarketPrice(
  chainId: StarknetChainId,
  tokenPricesData: TokenPricesData,
  market: Market,
): MarketPrice | undefined {
  try {
    const indexTokenPrice = tokenPricesData.get(market.indexTokenAddress)
    const longTokenPrice = tokenPricesData.get(market.longTokenAddress)
    const shortTokenPrice = tokenPricesData.get(market.shortTokenAddress)

    const indexToken = getTokenMetadata(chainId, market.indexTokenAddress)
    const longToken = getTokenMetadata(chainId, market.longTokenAddress)
    const shortToken = getTokenMetadata(chainId, market.shortTokenAddress)

    invariant(indexTokenPrice && longTokenPrice && shortTokenPrice, 'Invalid prices')

    return {
      index_token_price: convertToContractTokenPrices(indexTokenPrice, indexToken.decimals),
      long_token_price: convertToContractTokenPrices(longTokenPrice, longToken.decimals),
      short_token_price: convertToContractTokenPrices(shortTokenPrice, shortToken.decimals),
    }
  } catch (error) {
    logError(error)
    return undefined
  }
}

export interface PendingPositionUpdate {
  isIncrease: boolean
  positionKey: string
  sizeDeltaUsd: bigint
  sizeDeltaInTokens: bigint
  collateralDeltaAmount: bigint
  updatedAt: number
  updatedAtBlock: bigint
}

export interface Position {
  key: bigint
  account: string
  marketAddress: string
  collateralTokenAddress: string
  sizeInUsd: bigint
  sizeInTokens: bigint
  collateralAmount: bigint
  pendingBorrowingFeesUsd: bigint
  increasedAtBlock: bigint
  decreasedAtBlock: bigint
  isLong: boolean
  fundingFeeAmount: bigint
  claimableLongTokenAmount: bigint
  claimableShortTokenAmount: bigint
  isOpening?: boolean
  pendingUpdate?: PendingPositionUpdate
}

export type PositionsData = Map<bigint, Position>

export default async function fetchPositions(
  chainId: StarknetChainId,
  marketsData: MarketsData,
  tokenPricesData: TokenPricesData,
  account: string | undefined,
): Promise<PositionsData> {
  if (!account) return new Map()

  const dataStoreAddress = getSatoruContractAddress(chainId, SatoruContract.DataStore)
  const dataStoreContract = createSatoruContract(chainId, SatoruContract.DataStore, DataStoreABI)

  const readerContract = createSatoruContract(chainId, SatoruContract.Reader, ReaderABI)

  const referralStorageAddress = getSatoruContractAddress(chainId, SatoruContract.ReferralStorage)

  const numberOfPositions = await dataStoreContract.get_account_position_count(account)

  const positionKeys = await dataStoreContract.get_account_position_keys(
    account,
    0,
    numberOfPositions,
  )

  const marketPrices: MarketPrice[] = []
  const positionHashes: bigint[] = [] // contractPositionsKeys
  // const stringPositions: string[] = [] // allPositionsKeys

  Array.from(marketsData.values()).forEach(market => {
    const marketPrice = getMarketPrice(chainId, tokenPricesData, market)
    if (!marketPrice) return

    const collaterals = market.isSameCollaterals
      ? [market.longTokenAddress]
      : [market.longTokenAddress, market.shortTokenAddress]

    for (const collateralAddress of collaterals) {
      for (const isLong of [true, false]) {
        // const stringPosition = getStringReprenetationOfPosition(
        //   account,
        //   market.marketTokenAddress,
        //   collateralAddress,
        //   isLong,
        // )
        // stringPositions.push(stringPosition)

        const positionHash = hashedPositionKey(
          account,
          market.marketTokenAddress,
          collateralAddress,
          isLong,
        )

        if (positionKeys.includes(positionHash)) {
          positionHashes.push(positionHash)
          marketPrices.push(marketPrice)
        }
      }
    }
  })

  const positionsInfo = await readerContract
    .get_account_position_info_list(
      {
        contract_address: dataStoreAddress,
      },
      {
        contract_address: referralStorageAddress,
      },
      positionHashes,
      marketPrices,
      UI_FEE_RECEIVER_ADDRESS,
    )
    .catch(error => {
      logError(error, {positionHashes: positionHashes.map(toStarknetHexString), marketPrices})
      return []
    })

  const positionsData = new Map<bigint, Position>()

  positionsInfo.forEach((positionInfo, index) => {
    const key = positionHashes[index]
    if (!key) return

    const {position, fees} = positionInfo
    const {
      account,
      market,
      collateral_token,
      increased_at_block,
      is_long,
      size_in_usd,
      size_in_tokens,
      collateral_amount,
      decreased_at_block,
    } = position

    if (BigInt(increased_at_block) == 0n) return

    const accountAddress = toStarknetHexString(account)
    const marketAddress = toStarknetHexString(market)
    const collateralTokenAddress = toStarknetHexString(collateral_token)

    // const stringPosition = getStringReprenetationOfPosition(
    //   accountAddress,
    //   marketAddress,
    //   collateralTokenAddress,
    //   is_long,
    // )

    // console.log('stringPosition', stringPosition)

    positionsData.set(key, {
      key: key,
      account: accountAddress,
      marketAddress: marketAddress,
      collateralTokenAddress: collateralTokenAddress,
      sizeInUsd: cairoIntToBigInt(size_in_usd),
      sizeInTokens: cairoIntToBigInt(size_in_tokens),
      collateralAmount: cairoIntToBigInt(collateral_amount),
      increasedAtBlock: cairoIntToBigInt(increased_at_block),
      decreasedAtBlock: cairoIntToBigInt(decreased_at_block),
      isLong: is_long,
      pendingBorrowingFeesUsd: cairoIntToBigInt(fees.borrowing.borrowing_fee_usd),
      fundingFeeAmount: cairoIntToBigInt(fees.funding.funding_fee_amount),
      claimableLongTokenAmount: cairoIntToBigInt(fees.funding.claimable_long_token_amount),
      claimableShortTokenAmount: cairoIntToBigInt(fees.funding.claimable_short_token_amount),
    })
  })

  return positionsData
}
