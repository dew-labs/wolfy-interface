import {
  cairoIntToBigInt,
  createWolfyMulticallRequest,
  DataStoreABI,
  getWolfyContractAddress,
  ReaderABI,
  type StarknetChainId,
  WolfyContract,
  wolfyMulticall,
} from 'wolfy-sdk'
import {
  borrowingExponentFactorKey,
  borrowingFactorKey,
  fundingExponentFactorKey,
  fundingFactorKey,
  isMarketDisabledKey,
  MAX_PNL_FACTOR_FOR_TRADERS,
  maxOpenInterestKey,
  maxPnlFactorKey,
  maxPoolAmountKey,
  maxPositionImpactFactorForLiquidationsKey,
  maxPositionImpactFactorKey,
  minCollateralFactorForOpenInterestMultiplierKey,
  minCollateralFactorKey,
  openInterestInTokensKey,
  openInterestKey,
  openInterestReserveFactorKey,
  poolAmountKey,
  positionFeeFactorKey,
  positionImpactExponentFactorKey,
  positionImpactFactorKey,
  positionImpactPoolAmountKey,
  reserveFactorKey,
  swapFeeFactorKey,
  swapImpactExponentFactorKey,
  swapImpactFactorKey,
  swapImpactPoolAmountKey,
  virtualMarketIdKey,
  virtualTokenIdKey,
} from 'wolfy-sdk/dataStore'

import type {Token} from '@/constants/tokens'
import {getTokenMetadata} from '@/constants/tokens'
import {type Market} from '@/lib/trade/services/fetchMarkets'
import expandDecimals from '@/utils/numbers/expandDecimals'

import type {TokenPricesData} from './fetchTokenPrices'

export interface MarketData extends Market {
  isDisabled: boolean

  longToken: Token
  shortToken: Token
  indexToken: Token

  longPoolAmount: bigint
  shortPoolAmount: bigint

  maxLongPoolAmount: bigint
  maxShortPoolAmount: bigint
  // TODO: what are they?

  // https://github.com/gmx-io/gmx-interface/commit/17b79ca75ca94971c1e3b0a7f2187a59a4bb9ea6
  // https://github.com/gmx-io/gmx-synthetics/commit/0b57ad4c318080342b056da27a4a31c7ca9a5643
  // maxLongPoolUsdForDeposit: bigint
  // maxShortPoolUsdForDeposit: bigint

  // https://github.com/gmx-io/gmx-interface/commit/17b9d7b78f0dafded476f9e7a18e73fc3e6020cf
  // longPoolAmountAdjustment: bigint
  // shortPoolAmountAdjustment: bigint

  poolValueMax: bigint
  poolValueMin: bigint

  reserveFactorLong: bigint
  reserveFactorShort: bigint

  openInterestReserveFactorLong: bigint
  openInterestReserveFactorShort: bigint

  maxOpenInterestLong: bigint
  maxOpenInterestShort: bigint

  borrowingFactorLong: bigint
  borrowingFactorShort: bigint
  borrowingExponentFactorLong: bigint
  borrowingExponentFactorShort: bigint

  fundingFactor: bigint
  fundingExponentFactor: bigint

  totalBorrowingFees: bigint

  positionImpactPoolAmount: bigint

  minCollateralFactor: bigint
  minCollateralFactorForOpenInterestLong: bigint
  minCollateralFactorForOpenInterestShort: bigint

  swapImpactPoolAmountLong: bigint
  swapImpactPoolAmountShort: bigint

  maxPnlFactorForTradersLong: bigint
  maxPnlFactorForTradersShort: bigint

  pnlLongMin: bigint
  pnlLongMax: bigint
  pnlShortMin: bigint
  pnlShortMax: bigint

  netPnlMin: bigint
  netPnlMax: bigint

  priceMin: bigint
  priceMax: bigint

  longInterestUsd: bigint
  shortInterestUsd: bigint
  longInterestInTokens: bigint
  shortInterestInTokens: bigint

  positionFeeFactorForPositiveImpact: bigint
  positionFeeFactorForNegativeImpact: bigint
  positionImpactFactorPositive: bigint
  positionImpactFactorNegative: bigint
  maxPositionImpactFactorPositive: bigint
  maxPositionImpactFactorNegative: bigint
  maxPositionImpactFactorForLiquidations: bigint
  positionImpactExponentFactor: bigint

  swapFeeFactorForPositiveImpact: bigint
  swapFeeFactorForNegativeImpact: bigint
  swapImpactFactorPositive: bigint
  swapImpactFactorNegative: bigint
  swapImpactExponentFactor: bigint

  borrowingFactorPerSecondForLongs: bigint
  borrowingFactorPerSecondForShorts: bigint

  fundingFactorPerSecond: bigint
  longsPayShorts: boolean

  virtualPoolAmountForLongToken: bigint
  virtualPoolAmountForShortToken: bigint
  virtualInventoryForPositions: bigint

  virtualMarketId?: string
  virtualLongTokenId?: string
  virtualShortTokenId?: string
}

export async function fetchMarketData(
  chainId: StarknetChainId,
  market: Market,
  tokenPriceData: TokenPricesData,
) {
  const indexToken = getTokenMetadata(chainId, market.indexTokenAddress)
  const longToken = getTokenMetadata(chainId, market.longTokenAddress)
  const shortToken = getTokenMetadata(chainId, market.shortTokenAddress)

  const indexTokenPrice = tokenPriceData.get(market.indexTokenAddress)
  const longTokenPrice = tokenPriceData.get(market.longTokenAddress)
  const shortTokenPrice = tokenPriceData.get(market.shortTokenAddress)

  if (!indexTokenPrice || !shortTokenPrice || !longTokenPrice) {
    throw new Error('Token price not found')
  }

  /* eslint-disable camelcase -- this is the contract's naming */
  const tokenPricesInMarket = {
    index_token_price: {
      min: indexTokenPrice.min / expandDecimals(1, indexToken.decimals),
      max: indexTokenPrice.max / expandDecimals(1, indexToken.decimals),
    },
    long_token_price: {
      min: longTokenPrice.min / expandDecimals(1, longToken.decimals),
      max: longTokenPrice.max / expandDecimals(1, longToken.decimals),
    },
    short_token_price: {
      min: shortTokenPrice.min / expandDecimals(1, shortToken.decimals),
      max: shortTokenPrice.max / expandDecimals(1, shortToken.decimals),
    },
  }

  const marketProps = {
    market_token: market.marketTokenAddress,
    index_token: market.indexTokenAddress,
    long_token: market.longTokenAddress,
    short_token: market.shortTokenAddress,
  }
  /* eslint-enable camelcase */

  const dataStoreAddress = getWolfyContractAddress(chainId, WolfyContract.DataStore)
  const [
    marketInfo,
    marketTokenPriceMax,
    marketTokenPriceMin,
    isMarketDisabled,
    virtualMarketId,
    virtualLongTokenId,
    virtualShortTokenId,
    longPoolAmount,
    shortPoolAmount,
    maxLongPoolAmount,
    maxShortPoolAmount,
    reserveFactorLong,
    reserveFactorShort,
    openInterestReserveFactorLong,
    openInterestReserveFactorShort,
    maxOpenInterestLong,
    maxOpenInterestShort,
    positionImpactPoolAmount,
    swapImpactPoolAmountLong,
    swapImpactPoolAmountShort,
    borrowingFactorLong,
    borrowingFactorShort,
    borrowingExponentFactorLong,
    borrowingExponentFactorShort,
    fundingFactor,
    fundingExponentFactor,
    maxPnlFactorForTradersLong,
    maxPnlFactorForTradersShort,
    positionFeeFactorForPositiveImpact,
    positionFeeFactorForNegativeImpact,
    positionImpactFactorPositive,
    positionImpactFactorNegative,
    maxPositionImpactFactorPositive,
    maxPositionImpactFactorNegative,
    maxPositionImpactFactorForLiquidations,
    minCollateralFactor,
    minCollateralFactorForOpenInterestLong,
    minCollateralFactorForOpenInterestShort,
    positionImpactExponentFactor,
    swapFeeFactorForPositiveImpact,
    swapFeeFactorForNegativeImpact,
    swapImpactFactorPositive,
    swapImpactFactorNegative,
    swapImpactExponentFactor,
    longInterestUsingLongToken,
    longInterestUsingShortToken,
    shortInterestUsingLongToken,
    shortInterestUsingShortToken,
    longInterestInTokensUsingLongToken,
    longInterestInTokensUsingShortToken,
    shortInterestInTokensUsingLongToken,
    shortInterestInTokensUsingShortToken,
    // Fail if any of the call fail
  ] = await wolfyMulticall(chainId, [
    // marketInfo
    createWolfyMulticallRequest(chainId, WolfyContract.Reader, ReaderABI, 'get_market_info', [
      {
        contract_address: dataStoreAddress,
      },
      tokenPricesInMarket,
      market.marketTokenAddress,
    ]),
    // marketTokenPriceMax
    createWolfyMulticallRequest(
      chainId,
      WolfyContract.Reader,
      ReaderABI,
      'get_market_token_price',
      [
        {
          contract_address: dataStoreAddress,
        },
        marketProps,
        tokenPricesInMarket.index_token_price,
        tokenPricesInMarket.long_token_price,
        tokenPricesInMarket.short_token_price,
        MAX_PNL_FACTOR_FOR_TRADERS,
        true,
      ],
    ),
    // marketTokenPriceMin
    createWolfyMulticallRequest(
      chainId,
      WolfyContract.Reader,
      ReaderABI,
      'get_market_token_price',
      [
        {
          contract_address: dataStoreAddress,
        },
        marketProps,
        tokenPricesInMarket.index_token_price,
        tokenPricesInMarket.long_token_price,
        tokenPricesInMarket.short_token_price,
        MAX_PNL_FACTOR_FOR_TRADERS,
        false,
      ],
    ),
    // isMarketDisabled
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_bool', [
      isMarketDisabledKey(market.marketTokenAddress),
    ]),
    // virtualMarketId
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_felt252', [
      virtualMarketIdKey(market.marketTokenAddress),
    ]),
    // virtualLongTokenId
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_felt252', [
      virtualTokenIdKey(market.longTokenAddress),
    ]),
    // virtualShortTokenId
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_felt252', [
      virtualTokenIdKey(market.shortTokenAddress),
    ]),
    // longPoolAmount
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      poolAmountKey(market.marketTokenAddress, market.longTokenAddress),
    ]),
    // shortPoolAmount
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      poolAmountKey(market.marketTokenAddress, market.shortTokenAddress),
    ]),
    // maxLongPoolAmount
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxPoolAmountKey(market.marketTokenAddress, market.longTokenAddress),
    ]),
    // maxShortPoolAmount
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxPoolAmountKey(market.marketTokenAddress, market.shortTokenAddress),
    ]),
    // reserveFactorLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      reserveFactorKey(market.marketTokenAddress, true),
    ]),
    // reserveFactorShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      reserveFactorKey(market.marketTokenAddress, false),
    ]),
    // openInterestReserveFactorLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestReserveFactorKey(market.marketTokenAddress, true),
    ]),
    // openInterestReserveFactorShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestReserveFactorKey(market.marketTokenAddress, false),
    ]),
    // maxOpenInterestLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxOpenInterestKey(market.marketTokenAddress, true),
    ]),
    // maxOpenInterestShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxOpenInterestKey(market.marketTokenAddress, false),
    ]),
    // positionImpactPoolAmount
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      positionImpactPoolAmountKey(market.marketTokenAddress),
    ]),
    // swapImpactPoolAmountLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      swapImpactPoolAmountKey(market.marketTokenAddress, market.longTokenAddress),
    ]),
    // swapImpactPoolAmountShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      swapImpactPoolAmountKey(market.marketTokenAddress, market.shortTokenAddress),
    ]),
    // borrowingFactorLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      borrowingFactorKey(market.marketTokenAddress, true),
    ]),
    // borrowingFactorShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      borrowingFactorKey(market.marketTokenAddress, false),
    ]),
    // borrowingExponentFactorLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      borrowingExponentFactorKey(market.marketTokenAddress, true),
    ]),
    // borrowingExponentFactorShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      borrowingExponentFactorKey(market.marketTokenAddress, false),
    ]),
    // fundingFactor
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      fundingFactorKey(market.marketTokenAddress),
    ]),
    // fundingExponentFactor
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      fundingExponentFactorKey(market.marketTokenAddress),
    ]),
    // maxPnlFactorForTradersLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxPnlFactorKey(MAX_PNL_FACTOR_FOR_TRADERS, market.marketTokenAddress, true),
    ]),
    // maxPnlFactorForTradersShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxPnlFactorKey(MAX_PNL_FACTOR_FOR_TRADERS, market.marketTokenAddress, false),
    ]),
    // positionFeeFactorForPositiveImpact
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      positionFeeFactorKey(market.marketTokenAddress, true),
    ]),
    // positionFeeFactorForNegativeImpact
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      positionFeeFactorKey(market.marketTokenAddress, false),
    ]),
    // positionImpactFactorPositive
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      positionImpactFactorKey(market.marketTokenAddress, true),
    ]),
    // positionImpactFactorNegative
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      positionImpactFactorKey(market.marketTokenAddress, false),
    ]),
    // maxPositionImpactFactorPositive
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxPositionImpactFactorKey(market.marketTokenAddress, true),
    ]),
    // maxPositionImpactFactorNegative
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxPositionImpactFactorKey(market.marketTokenAddress, false),
    ]),
    // maxPositionImpactFactorForLiquidations
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      maxPositionImpactFactorForLiquidationsKey(market.marketTokenAddress),
    ]),
    // minCollateralFactor
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      minCollateralFactorKey(market.marketTokenAddress),
    ]),
    // minCollateralFactorForOpenInterestLong
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      minCollateralFactorForOpenInterestMultiplierKey(market.marketTokenAddress, true),
    ]),
    // minCollateralFactorForOpenInterestShort
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      minCollateralFactorForOpenInterestMultiplierKey(market.marketTokenAddress, false),
    ]),
    // positionImpactExponentFactor
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      positionImpactExponentFactorKey(market.marketTokenAddress),
    ]),
    // swapFeeFactorForPositiveImpact
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      swapFeeFactorKey(market.marketTokenAddress, true),
    ]),
    // swapFeeFactorForNegativeImpact
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      swapFeeFactorKey(market.marketTokenAddress, false),
    ]),
    // swapImpactFactorPositive
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      swapImpactFactorKey(market.marketTokenAddress, true),
    ]),
    // swapImpactFactorNegative
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      swapImpactFactorKey(market.marketTokenAddress, false),
    ]),
    // swapImpactExponentFactor
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      swapImpactExponentFactorKey(market.marketTokenAddress),
    ]),
    // longInterestUsingLongToken
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestKey(market.marketTokenAddress, market.longTokenAddress, true),
    ]),
    // longInterestUsingShortToken
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestKey(market.marketTokenAddress, market.shortTokenAddress, true),
    ]),
    // shortInterestUsingLongToken
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestKey(market.marketTokenAddress, market.longTokenAddress, false),
    ]),
    // shortInterestUsingShortToken
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestKey(market.marketTokenAddress, market.shortTokenAddress, false),
    ]),
    // longInterestInTokensUsingLongToken
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestInTokensKey(market.marketTokenAddress, market.longTokenAddress, true),
    ]),
    // longInterestInTokensUsingShortToken
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestInTokensKey(market.marketTokenAddress, market.shortTokenAddress, true),
    ]),
    // shortInterestInTokensUsingLongToken
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestInTokensKey(market.marketTokenAddress, market.longTokenAddress, false),
    ]),
    // shortInterestInTokensUsingShortToken
    createWolfyMulticallRequest(chainId, WolfyContract.DataStore, DataStoreABI, 'get_u256', [
      openInterestInTokensKey(market.marketTokenAddress, market.shortTokenAddress, false),
    ]),
  ] as const)

  const marketDivisor = market.isSameCollaterals ? 2n : 1n

  const longInterestUsd =
    cairoIntToBigInt(longInterestUsingLongToken) / marketDivisor +
    cairoIntToBigInt(longInterestUsingShortToken) / marketDivisor
  const shortInterestUsd =
    cairoIntToBigInt(shortInterestUsingLongToken) / marketDivisor +
    cairoIntToBigInt(shortInterestUsingShortToken) / marketDivisor

  const longInterestInTokens =
    cairoIntToBigInt(longInterestInTokensUsingLongToken) / marketDivisor +
    cairoIntToBigInt(longInterestInTokensUsingShortToken) / marketDivisor
  const shortInterestInTokens =
    cairoIntToBigInt(shortInterestInTokensUsingLongToken) / marketDivisor +
    cairoIntToBigInt(shortInterestInTokensUsingShortToken) / marketDivisor

  const {next_funding: nextFunding, virtual_inventory: virtualInventory} = marketInfo

  const {0: priceMin, 1: poolValueInfoMin} = marketTokenPriceMin
  const {0: priceMax, 1: poolValueInfoMax} = marketTokenPriceMax

  return {
    ...market,
    isDisabled: isMarketDisabled,
    longToken,
    shortToken,
    indexToken,
    longInterestUsd,
    shortInterestUsd,
    longInterestInTokens,
    shortInterestInTokens,
    longPoolAmount: cairoIntToBigInt(longPoolAmount) / marketDivisor,
    shortPoolAmount: cairoIntToBigInt(shortPoolAmount) / marketDivisor,
    maxLongPoolAmount: cairoIntToBigInt(maxLongPoolAmount),
    maxShortPoolAmount: cairoIntToBigInt(maxShortPoolAmount),
    poolValueMin: cairoIntToBigInt(poolValueInfoMin.pool_value),
    poolValueMax: cairoIntToBigInt(poolValueInfoMax.pool_value),
    reserveFactorLong: cairoIntToBigInt(reserveFactorLong),
    reserveFactorShort: cairoIntToBigInt(reserveFactorShort),
    openInterestReserveFactorLong: cairoIntToBigInt(openInterestReserveFactorLong),
    openInterestReserveFactorShort: cairoIntToBigInt(openInterestReserveFactorShort),
    maxOpenInterestLong: cairoIntToBigInt(maxOpenInterestLong),
    maxOpenInterestShort: cairoIntToBigInt(maxOpenInterestShort),
    totalBorrowingFees: cairoIntToBigInt(poolValueInfoMax.total_borrowing_fees),
    positionImpactPoolAmount: cairoIntToBigInt(positionImpactPoolAmount),
    swapImpactPoolAmountLong: cairoIntToBigInt(swapImpactPoolAmountLong),
    swapImpactPoolAmountShort: cairoIntToBigInt(swapImpactPoolAmountShort),
    borrowingFactorLong: cairoIntToBigInt(borrowingFactorLong),
    borrowingFactorShort: cairoIntToBigInt(borrowingFactorShort),
    borrowingExponentFactorLong: cairoIntToBigInt(borrowingExponentFactorLong),
    borrowingExponentFactorShort: cairoIntToBigInt(borrowingExponentFactorShort),
    fundingFactor: cairoIntToBigInt(fundingFactor),
    fundingExponentFactor: cairoIntToBigInt(fundingExponentFactor),
    priceMin: cairoIntToBigInt(priceMin),
    priceMax: cairoIntToBigInt(priceMax),
    pnlLongMax: cairoIntToBigInt(poolValueInfoMax.long_pnl),
    pnlLongMin: cairoIntToBigInt(poolValueInfoMin.long_pnl),
    pnlShortMax: cairoIntToBigInt(poolValueInfoMax.short_pnl),
    pnlShortMin: cairoIntToBigInt(poolValueInfoMin.short_pnl),
    netPnlMax: cairoIntToBigInt(poolValueInfoMax.net_pnl),
    netPnlMin: cairoIntToBigInt(poolValueInfoMin.net_pnl),

    maxPnlFactorForTradersLong: cairoIntToBigInt(maxPnlFactorForTradersLong),
    maxPnlFactorForTradersShort: cairoIntToBigInt(maxPnlFactorForTradersShort),

    minCollateralFactor: cairoIntToBigInt(minCollateralFactor),
    minCollateralFactorForOpenInterestLong: cairoIntToBigInt(
      minCollateralFactorForOpenInterestLong,
    ),

    minCollateralFactorForOpenInterestShort: cairoIntToBigInt(
      minCollateralFactorForOpenInterestShort,
    ),

    positionFeeFactorForPositiveImpact: cairoIntToBigInt(positionFeeFactorForPositiveImpact),
    positionFeeFactorForNegativeImpact: cairoIntToBigInt(positionFeeFactorForNegativeImpact),
    positionImpactFactorPositive: cairoIntToBigInt(positionImpactFactorPositive),
    positionImpactFactorNegative: cairoIntToBigInt(positionImpactFactorNegative),
    maxPositionImpactFactorPositive: cairoIntToBigInt(maxPositionImpactFactorPositive),
    maxPositionImpactFactorNegative: cairoIntToBigInt(maxPositionImpactFactorNegative),
    maxPositionImpactFactorForLiquidations: cairoIntToBigInt(
      maxPositionImpactFactorForLiquidations,
    ),
    positionImpactExponentFactor: cairoIntToBigInt(positionImpactExponentFactor),
    swapFeeFactorForPositiveImpact: cairoIntToBigInt(swapFeeFactorForPositiveImpact),
    swapFeeFactorForNegativeImpact: cairoIntToBigInt(swapFeeFactorForNegativeImpact),
    swapImpactFactorPositive: cairoIntToBigInt(swapImpactFactorPositive),
    swapImpactFactorNegative: cairoIntToBigInt(swapImpactFactorNegative),
    swapImpactExponentFactor: cairoIntToBigInt(swapImpactExponentFactor),

    borrowingFactorPerSecondForLongs: cairoIntToBigInt(
      marketInfo.borrowing_factor_per_second_for_longs,
    ),

    borrowingFactorPerSecondForShorts: cairoIntToBigInt(
      marketInfo.borrowing_factor_per_second_for_shorts,
    ),

    fundingFactorPerSecond: cairoIntToBigInt(nextFunding.funding_factor_per_second),
    longsPayShorts: nextFunding.longs_pay_shorts,

    virtualPoolAmountForLongToken: cairoIntToBigInt(
      virtualInventory.virtual_pool_amount_for_long_token,
    ),
    virtualPoolAmountForShortToken: cairoIntToBigInt(
      virtualInventory.virtual_pool_amount_for_short_token,
    ),
    virtualInventoryForPositions: cairoIntToBigInt(
      virtualInventory.virtual_inventory_for_positions,
    ),

    virtualMarketId: String(virtualMarketId),
    virtualLongTokenId: String(virtualLongTokenId),
    virtualShortTokenId: String(virtualShortTokenId),
  }
}
