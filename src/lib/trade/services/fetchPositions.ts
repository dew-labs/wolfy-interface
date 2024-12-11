import invariant from 'tiny-invariant'
import type {Hashable, StarknetChainId} from 'wolfy-sdk'
import {
  cairoIntToBigInt,
  createWolfyContract,
  DataStoreABI,
  getWolfyContractAddress,
  poseidonHash,
  ReaderABI,
  toStarknetHexString,
  WolfyContract,
} from 'wolfy-sdk'

import {UI_FEE_RECEIVER_ADDRESS} from '@/constants/config'
import {getTokenMetadata} from '@/constants/tokens'
import {logError} from '@/utils/logger'
import expandDecimals from '@/utils/numbers/expandDecimals'

import type {Market} from './fetchMarkets'
import type {MarketsData} from './fetchMarketsData'
import type {Price, TokenPricesData} from './fetchTokenPrices'

export function getStringReprenetationOfPosition(
  account: string,
  marketAddress: string,
  collateralAddress: string,
  isLong: boolean,
) {
  return `${account}:${marketAddress}:${collateralAddress}:${isLong}`
}

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
      /* eslint-disable camelcase -- snake_case is used in the contract */
      index_token_price: convertToContractTokenPrices(indexTokenPrice, indexToken.decimals),
      long_token_price: convertToContractTokenPrices(longTokenPrice, longToken.decimals),
      short_token_price: convertToContractTokenPrices(shortTokenPrice, shortToken.decimals),
      /* eslint-enable camelcase */
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
  stringRepresentation: string
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

export interface PositionsData {
  positionsData: Map<bigint, Position>
  positionsDataViaStringRepresentation: Map<string, Position>
}

export const DEFAULT_POSITIONS_DATA: PositionsData = {
  positionsData: new Map(),
  positionsDataViaStringRepresentation: new Map(),
}

export default async function fetchPositions(
  chainId: StarknetChainId,
  marketsData: MarketsData,
  tokenPricesData: TokenPricesData,
  account: string | undefined,
): Promise<PositionsData> {
  if (!account) return DEFAULT_POSITIONS_DATA

  const dataStoreContract = createWolfyContract(chainId, WolfyContract.DataStore, DataStoreABI)

  const readerContract = createWolfyContract(chainId, WolfyContract.Reader, ReaderABI)

  const referralStorageAddress = getWolfyContractAddress(chainId, WolfyContract.ReferralStorage)

  const numberOfPositions = await dataStoreContract.get_account_position_count(account)

  const positionKeys = await dataStoreContract.get_account_position_keys(
    account,
    0,
    numberOfPositions,
  )

  const marketPrices: MarketPrice[] = []
  const positionHashes: bigint[] = []

  Array.from(marketsData.values()).forEach(market => {
    const marketPrice = getMarketPrice(chainId, tokenPricesData, market)
    if (!marketPrice) return

    const collaterals = market.isSameCollaterals
      ? [market.longTokenAddress]
      : [market.longTokenAddress, market.shortTokenAddress]

    for (const collateralAddress of collaterals) {
      for (const isLong of [true, false]) {
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
        contract_address: dataStoreContract.address,
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
  const positionsDataViaStringRepresentation = new Map<string, Position>()

  positionsInfo.forEach((positionInfo, index) => {
    const key = positionHashes[index]
    if (!key) return

    const {position, fees} = positionInfo

    const {
      account,
      market,
      collateral_token: collateralToken,
      increased_at_block: increasedAtBlock,
      is_long: isLong,
      size_in_usd: sizeInUsd,
      size_in_tokens: sizeInTokens,
      collateral_amount: collateralAmount,
      decreased_at_block: decreasedAtBlock,
    } = position

    if (BigInt(increasedAtBlock) === 0n) return

    const accountAddress = toStarknetHexString(account)
    const marketAddress = toStarknetHexString(market)
    const collateralTokenAddress = toStarknetHexString(collateralToken)

    const stringPosition = getStringReprenetationOfPosition(
      accountAddress,
      marketAddress,
      collateralTokenAddress,
      isLong,
    )

    const pos = {
      key,
      account: accountAddress,
      marketAddress,
      collateralTokenAddress,
      sizeInUsd: cairoIntToBigInt(sizeInUsd),
      sizeInTokens: cairoIntToBigInt(sizeInTokens),
      collateralAmount: cairoIntToBigInt(collateralAmount),
      increasedAtBlock: cairoIntToBigInt(increasedAtBlock),
      decreasedAtBlock: cairoIntToBigInt(decreasedAtBlock),
      isLong,
      pendingBorrowingFeesUsd: cairoIntToBigInt(fees.borrowing.borrowing_fee_usd),
      fundingFeeAmount: cairoIntToBigInt(fees.funding.funding_fee_amount),
      claimableLongTokenAmount: cairoIntToBigInt(fees.funding.claimable_long_token_amount),
      claimableShortTokenAmount: cairoIntToBigInt(fees.funding.claimable_short_token_amount),
      stringRepresentation: stringPosition,
    }

    positionsDataViaStringRepresentation.set(stringPosition, pos)

    positionsData.set(key, pos)
  })

  return {
    positionsData,
    positionsDataViaStringRepresentation,
  }
}
