import {
  cairoIntToBigInt,
  createSatoruMulticallRequest,
  DataStoreABI,
  getSatoruContractAddress,
  ReaderABI,
  SatoruContract,
  satoruMulticall,
  type StarknetChainId,
} from 'satoru-sdk'

import {
  borrowingExponentFactorKey,
  borrowingFactorKey,
  claimableFundingAmountKey,
  fundingExponentFactorKey,
  fundingFactorKey,
  isMarketDisabledKey,
  MAX_PNL_FACTOR_FOR_TRADERS_KEY,
  maxOpenInterestKey,
  maxPnlFactorKey,
  maxPoolAmountKey,
  maxPositionImpactFactorForLiquidationsKey,
  maxPositionImpactFactorKey,
  minCollateralFactorForOpenInterest,
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
} from '@/constants/dataStore'
import {type Market} from '@/lib/trade/services/fetchMarkets'
import {logError} from '@/utils/logger'

import type {TokenData} from './fetchTokensData'

export interface MarketData extends Market {
  isDisabled: boolean

  longToken: TokenData
  shortToken: TokenData
  indexToken: TokenData

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

  claimableFundingAmountLong?: bigint
  claimableFundingAmountShort?: bigint

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

export type MarketsData = Map<string, MarketData>

export default async function fetchMarketsData(
  chainId: StarknetChainId,
  markets: Market[],
  tokensData: Map<string, TokenData>,
  accountAddress: string | undefined,
): Promise<MarketsData> {
  const results = await Promise.allSettled(
    markets
      .map(async market => {
        const longToken = tokensData.get(market.longTokenAddress)
        const shortToken = tokensData.get(market.shortTokenAddress)
        const indexToken = tokensData.get(market.indexTokenAddress)

        if (!longToken || !shortToken || !indexToken) return false

        const tokenPricesInMarket = {
          index_token_price: indexToken.price,
          long_token_price: longToken.price,
          short_token_price: shortToken.price,
        }

        const marketProps = {
          market_token: market.indexTokenAddress,
          index_token: market.indexTokenAddress,
          long_token: market.longTokenAddress,
          short_token: market.shortTokenAddress,
        }

        const dataStoreAddress = getSatoruContractAddress(chainId, SatoruContract.DataStore)

        try {
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
          ] = await satoruMulticall(chainId, [
            // marketInfo
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.Reader,
              ReaderABI,
              'get_market_info',
              [
                {
                  contract_address: dataStoreAddress,
                },
                tokenPricesInMarket,
                market.marketTokenAddress,
              ],
            ),
            // marketTokenPriceMax
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.Reader,
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
                MAX_PNL_FACTOR_FOR_TRADERS_KEY,
                true,
              ],
            ),
            // marketTokenPriceMin
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.Reader,
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
                MAX_PNL_FACTOR_FOR_TRADERS_KEY,
                false,
              ],
            ),
            // isMarketDisabled
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_bool',
              [isMarketDisabledKey(market.marketTokenAddress)],
            ),
            // virtualMarketId
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_felt252',
              [virtualMarketIdKey(market.marketTokenAddress)],
            ),
            // virtualLongTokenId
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_felt252',
              [virtualTokenIdKey(market.longTokenAddress)],
            ),
            // virtualShortTokenId
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_felt252',
              [virtualTokenIdKey(market.shortTokenAddress)],
            ),
            // longPoolAmount
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [poolAmountKey(market.marketTokenAddress, market.longTokenAddress)],
            ),
            // shortPoolAmount
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [poolAmountKey(market.marketTokenAddress, market.shortTokenAddress)],
            ),
            // maxLongPoolAmount
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxPoolAmountKey(market.marketTokenAddress, market.longTokenAddress)],
            ),
            // maxShortPoolAmount
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxPoolAmountKey(market.marketTokenAddress, market.shortTokenAddress)],
            ),
            // reserveFactorLong
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [reserveFactorKey(market.marketTokenAddress, true)],
            ),
            // reserveFactorShort
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [reserveFactorKey(market.marketTokenAddress, false)],
            ),
            // openInterestReserveFactorLong
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestReserveFactorKey(market.marketTokenAddress, true)],
            ),
            // openInterestReserveFactorShort
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestReserveFactorKey(market.marketTokenAddress, false)],
            ),
            // maxOpenInterestLong
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxOpenInterestKey(market.marketTokenAddress, true)],
            ),
            // maxOpenInterestShort
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxOpenInterestKey(market.marketTokenAddress, false)],
            ),
            // positionImpactPoolAmount
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [positionImpactPoolAmountKey(market.marketTokenAddress)],
            ),
            // swapImpactPoolAmountLong
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [swapImpactPoolAmountKey(market.marketTokenAddress, market.longTokenAddress)],
            ),
            // swapImpactPoolAmountShort
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [swapImpactPoolAmountKey(market.marketTokenAddress, market.shortTokenAddress)],
            ),
            // borrowingFactorLong
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [borrowingFactorKey(market.marketTokenAddress, true)],
            ),
            // borrowingFactorShort
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [borrowingFactorKey(market.marketTokenAddress, false)],
            ),
            // borrowingExponentFactorLong
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [borrowingExponentFactorKey(market.marketTokenAddress, true)],
            ),
            // borrowingExponentFactorShort
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [borrowingExponentFactorKey(market.marketTokenAddress, false)],
            ),
            // fundingFactor
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [fundingFactorKey(market.marketTokenAddress)],
            ),
            // fundingExponentFactor
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [fundingExponentFactorKey(market.marketTokenAddress)],
            ),
            // maxPnlFactorForTradersLong
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxPnlFactorKey(MAX_PNL_FACTOR_FOR_TRADERS_KEY, market.marketTokenAddress, true)],
            ),
            // maxPnlFactorForTradersShort
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxPnlFactorKey(MAX_PNL_FACTOR_FOR_TRADERS_KEY, market.marketTokenAddress, false)],
            ),
            // positionFeeFactorForPositiveImpact
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [positionFeeFactorKey(market.marketTokenAddress, true)],
            ),
            // positionFeeFactorForNegativeImpact
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [positionFeeFactorKey(market.marketTokenAddress, false)],
            ),
            // positionImpactFactorPositive
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [positionImpactFactorKey(market.marketTokenAddress, true)],
            ),
            // positionImpactFactorNegative
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [positionImpactFactorKey(market.marketTokenAddress, false)],
            ),
            // maxPositionImpactFactorPositive
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxPositionImpactFactorKey(market.marketTokenAddress, true)],
            ),
            // maxPositionImpactFactorNegative
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxPositionImpactFactorKey(market.marketTokenAddress, false)],
            ),
            // maxPositionImpactFactorForLiquidations
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [maxPositionImpactFactorForLiquidationsKey(market.marketTokenAddress)],
            ),
            // minCollateralFactor
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [minCollateralFactorKey(market.marketTokenAddress)],
            ),
            // minCollateralFactorForOpenInterestLong
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [minCollateralFactorForOpenInterest(market.marketTokenAddress, true)],
            ),
            // minCollateralFactorForOpenInterestShort
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [minCollateralFactorForOpenInterest(market.marketTokenAddress, false)],
            ),
            // positionImpactExponentFactor
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [positionImpactExponentFactorKey(market.marketTokenAddress)],
            ),
            // swapFeeFactorForPositiveImpact
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [swapFeeFactorKey(market.marketTokenAddress, true)],
            ),
            // swapFeeFactorForNegativeImpact
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [swapFeeFactorKey(market.marketTokenAddress, false)],
            ),
            // swapImpactFactorPositive
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [swapImpactFactorKey(market.marketTokenAddress, true)],
            ),
            // swapImpactFactorNegative
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [swapImpactFactorKey(market.marketTokenAddress, false)],
            ),
            // swapImpactExponentFactor
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [swapImpactExponentFactorKey(market.marketTokenAddress)],
            ),
            // longInterestUsingLongToken
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestKey(market.marketTokenAddress, market.longTokenAddress, true)],
            ),
            // longInterestUsingShortToken
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestKey(market.marketTokenAddress, market.shortTokenAddress, true)],
            ),
            // shortInterestUsingLongToken
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestKey(market.marketTokenAddress, market.longTokenAddress, false)],
            ),
            // shortInterestUsingShortToken
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestKey(market.marketTokenAddress, market.shortTokenAddress, false)],
            ),
            // longInterestInTokensUsingLongToken
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestInTokensKey(market.marketTokenAddress, market.longTokenAddress, true)],
            ),
            // longInterestInTokensUsingShortToken
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestInTokensKey(market.marketTokenAddress, market.shortTokenAddress, true)],
            ),
            // shortInterestInTokensUsingLongToken
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestInTokensKey(market.marketTokenAddress, market.longTokenAddress, false)],
            ),
            // shortInterestInTokensUsingShortToken
            createSatoruMulticallRequest(
              chainId,
              SatoruContract.DataStore,
              DataStoreABI,
              'get_u256',
              [openInterestInTokensKey(market.marketTokenAddress, market.shortTokenAddress, false)],
            ),
          ] as const)

          let claimableFundingAmountLong, claimableFundingAmountShort

          if (accountAddress) {
            ;[claimableFundingAmountLong, claimableFundingAmountShort] = await satoruMulticall(
              chainId,
              [
                // claimableFundingAmountLong
                createSatoruMulticallRequest(
                  chainId,
                  SatoruContract.DataStore,
                  DataStoreABI,
                  'get_u256',
                  [
                    claimableFundingAmountKey(
                      market.marketTokenAddress,
                      market.longTokenAddress,
                      accountAddress,
                    ),
                  ],
                ),
                // claimableFundingAmountShort
                createSatoruMulticallRequest(
                  chainId,
                  SatoruContract.DataStore,
                  DataStoreABI,
                  'get_u256',
                  [
                    claimableFundingAmountKey(
                      market.marketTokenAddress,
                      market.shortTokenAddress,
                      accountAddress,
                    ),
                  ],
                ),
              ] as const,
            )
          }

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

          const {0: _priceMin, 1: poolValueInfoMin} = marketTokenPriceMin
          const {0: _priceMax, 1: poolValueInfoMax} = marketTokenPriceMax

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

            claimableFundingAmountLong: claimableFundingAmountLong
              ? cairoIntToBigInt(claimableFundingAmountLong) / marketDivisor
              : 0n,

            claimableFundingAmountShort: claimableFundingAmountShort
              ? cairoIntToBigInt(claimableFundingAmountShort) / marketDivisor
              : 0n,

            positionFeeFactorForPositiveImpact: cairoIntToBigInt(
              positionFeeFactorForPositiveImpact,
            ),
            positionFeeFactorForNegativeImpact: cairoIntToBigInt(
              positionFeeFactorForNegativeImpact,
            ),
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
        } catch (e: unknown) {
          logError(e)
          return false
        }
      })
      .filter(Boolean),
  )

  const marketMap = new Map<string, MarketData>()

  results.forEach(result => {
    if (result.status !== 'fulfilled') return
    if (result.value === false) return
    marketMap.set(result.value.marketTokenAddress, result.value)
  })

  return marketMap
}
