import type {StarknetChainId} from '@/constants/chains'
import {createCalldata, getContractAddress, multicall, SatoruContract} from '@/constants/contracts'
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
import cairoIntToBigInt from '@/lib/starknet/utils/cairoIntToBigInt'
import {type Market} from '@/lib/trade/services/fetchMarkets'
import {logError} from '@/utils/logger'

import type {TokenData} from './fetchTokensData'

export interface MarketData extends Market {
  isDisabled: boolean
  longToken: TokenData
  shortToken: TokenData
  indexToken: TokenData
  longInterestUsd: bigint
  shortInterestUsd: bigint
  longInterestInTokens: bigint
  shortInterestInTokens: bigint
  longPoolAmount: bigint
  shortPoolAmount: bigint
  maxLongPoolAmount: bigint
  maxShortPoolAmount: bigint
  poolValueMin: bigint
  poolValueMax: bigint
  reserveFactorLong: bigint
  reserveFactorShort: bigint
  openInterestReserveFactorLong: bigint
  openInterestReserveFactorShort: bigint
  maxOpenInterestLong: bigint
  maxOpenInterestShort: bigint
  totalBorrowingFees: bigint
  positionImpactPoolAmount: bigint
  swapImpactPoolAmountLong: bigint
  swapImpactPoolAmountShort: bigint
  borrowingFactorLong: bigint
  borrowingFactorShort: bigint
  borrowingExponentFactorLong: bigint
  borrowingExponentFactorShort: bigint
  fundingFactor: bigint
  fundingExponentFactor: bigint
  pnlLongMax: bigint
  pnlLongMin: bigint
  pnlShortMax: bigint
  pnlShortMin: bigint
  netPnlMax: bigint
  netPnlMin: bigint

  maxPnlFactorForTradersLong: bigint
  maxPnlFactorForTradersShort: bigint

  minCollateralFactor: bigint
  minCollateralFactorForOpenInterestLong: bigint

  minCollateralFactorForOpenInterestShort: bigint

  claimableFundingAmountLong: bigint

  claimableFundingAmountShort: bigint

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
  virtualMarketId: string | number | bigint
  virtualLongTokenId: string | number | bigint
  virtualShortTokenId: string | number | bigint
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

        const dataStoreAddress = getContractAddress(chainId, SatoruContract.DataStore)

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
          ] = await multicall(chainId, [
            // marketInfo
            createCalldata(chainId, SatoruContract.Reader, 'get_market_info', [
              {
                contract_address: dataStoreAddress,
              },
              tokenPricesInMarket,
              market.marketTokenAddress,
            ]),
            // marketTokenPriceMax
            createCalldata(chainId, SatoruContract.Reader, 'get_market_token_price', [
              {
                contract_address: dataStoreAddress,
              },
              marketProps,
              tokenPricesInMarket.index_token_price,
              tokenPricesInMarket.long_token_price,
              tokenPricesInMarket.short_token_price,
              MAX_PNL_FACTOR_FOR_TRADERS_KEY,
              true,
            ]),
            // marketTokenPriceMin
            createCalldata(chainId, SatoruContract.Reader, 'get_market_token_price', [
              {
                contract_address: dataStoreAddress,
              },
              marketProps,
              tokenPricesInMarket.index_token_price,
              tokenPricesInMarket.long_token_price,
              tokenPricesInMarket.short_token_price,
              MAX_PNL_FACTOR_FOR_TRADERS_KEY,
              false,
            ]),
            // isMarketDisabled
            createCalldata(chainId, SatoruContract.DataStore, 'get_bool', [
              isMarketDisabledKey(market.marketTokenAddress),
            ]),
            // virtualMarketId
            createCalldata(chainId, SatoruContract.DataStore, 'get_felt252', [
              virtualMarketIdKey(market.marketTokenAddress),
            ]),
            // virtualLongTokenId
            createCalldata(chainId, SatoruContract.DataStore, 'get_felt252', [
              virtualTokenIdKey(market.longTokenAddress),
            ]),
            // virtualShortTokenId
            createCalldata(chainId, SatoruContract.DataStore, 'get_felt252', [
              virtualTokenIdKey(market.shortTokenAddress),
            ]),
            // longPoolAmount
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              poolAmountKey(market.marketTokenAddress, market.longTokenAddress),
            ]),
            // shortPoolAmount
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              poolAmountKey(market.marketTokenAddress, market.shortTokenAddress),
            ]),
            // maxLongPoolAmount
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxPoolAmountKey(market.marketTokenAddress, market.longTokenAddress),
            ]),
            // maxShortPoolAmount
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxPoolAmountKey(market.marketTokenAddress, market.shortTokenAddress),
            ]),
            // reserveFactorLong
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              reserveFactorKey(market.marketTokenAddress, true),
            ]),
            // reserveFactorShort
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              reserveFactorKey(market.marketTokenAddress, false),
            ]),
            // openInterestReserveFactorLong
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestReserveFactorKey(market.marketTokenAddress, true),
            ]),
            // openInterestReserveFactorShort
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestReserveFactorKey(market.marketTokenAddress, false),
            ]),
            // maxOpenInterestLong
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxOpenInterestKey(market.marketTokenAddress, true),
            ]),
            // maxOpenInterestShort
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxOpenInterestKey(market.marketTokenAddress, false),
            ]),
            // positionImpactPoolAmount
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              positionImpactPoolAmountKey(market.marketTokenAddress),
            ]),
            // swapImpactPoolAmountLong
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              swapImpactPoolAmountKey(market.marketTokenAddress, market.longTokenAddress),
            ]),
            // swapImpactPoolAmountShort
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              swapImpactPoolAmountKey(market.marketTokenAddress, market.shortTokenAddress),
            ]),
            // borrowingFactorLong
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              borrowingFactorKey(market.marketTokenAddress, true),
            ]),
            // borrowingFactorShort
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              borrowingFactorKey(market.marketTokenAddress, false),
            ]),
            // borrowingExponentFactorLong
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              borrowingExponentFactorKey(market.marketTokenAddress, true),
            ]),
            // borrowingExponentFactorShort
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              borrowingExponentFactorKey(market.marketTokenAddress, false),
            ]),
            // fundingFactor
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              fundingFactorKey(market.marketTokenAddress),
            ]),
            // fundingExponentFactor
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              fundingExponentFactorKey(market.marketTokenAddress),
            ]),
            // maxPnlFactorForTradersLong
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxPnlFactorKey(MAX_PNL_FACTOR_FOR_TRADERS_KEY, market.marketTokenAddress, true),
            ]),
            // maxPnlFactorForTradersShort
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxPnlFactorKey(MAX_PNL_FACTOR_FOR_TRADERS_KEY, market.marketTokenAddress, false),
            ]),
            // positionFeeFactorForPositiveImpact
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              positionFeeFactorKey(market.marketTokenAddress, true),
            ]),
            // positionFeeFactorForNegativeImpact
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              positionFeeFactorKey(market.marketTokenAddress, false),
            ]),
            // positionImpactFactorPositive
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              positionImpactFactorKey(market.marketTokenAddress, true),
            ]),
            // positionImpactFactorNegative
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              positionImpactFactorKey(market.marketTokenAddress, false),
            ]),
            // maxPositionImpactFactorPositive
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxPositionImpactFactorKey(market.marketTokenAddress, true),
            ]),
            // maxPositionImpactFactorNegative
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxPositionImpactFactorKey(market.marketTokenAddress, false),
            ]),
            // maxPositionImpactFactorForLiquidations
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              maxPositionImpactFactorForLiquidationsKey(market.marketTokenAddress),
            ]),
            // minCollateralFactor
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              minCollateralFactorKey(market.marketTokenAddress),
            ]),
            // minCollateralFactorForOpenInterestLong
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              minCollateralFactorForOpenInterest(market.marketTokenAddress, true),
            ]),
            // minCollateralFactorForOpenInterestShort
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              minCollateralFactorForOpenInterest(market.marketTokenAddress, false),
            ]),
            // positionImpactExponentFactor
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              positionImpactExponentFactorKey(market.marketTokenAddress),
            ]),
            // swapFeeFactorForPositiveImpact
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              swapFeeFactorKey(market.marketTokenAddress, true),
            ]),
            // swapFeeFactorForNegativeImpact
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              swapFeeFactorKey(market.marketTokenAddress, false),
            ]),
            // swapImpactFactorPositive
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              swapImpactFactorKey(market.marketTokenAddress, true),
            ]),
            // swapImpactFactorNegative
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              swapImpactFactorKey(market.marketTokenAddress, false),
            ]),
            // swapImpactExponentFactor
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              swapImpactExponentFactorKey(market.marketTokenAddress),
            ]),
            // longInterestUsingLongToken
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestKey(market.marketTokenAddress, market.longTokenAddress, true),
            ]),
            // longInterestUsingShortToken
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestKey(market.marketTokenAddress, market.shortTokenAddress, true),
            ]),
            // shortInterestUsingLongToken
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestKey(market.marketTokenAddress, market.longTokenAddress, false),
            ]),
            // shortInterestUsingShortToken
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestKey(market.marketTokenAddress, market.shortTokenAddress, false),
            ]),
            // longInterestInTokensUsingLongToken
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestInTokensKey(market.marketTokenAddress, market.longTokenAddress, true),
            ]),
            // longInterestInTokensUsingShortToken
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestInTokensKey(market.marketTokenAddress, market.shortTokenAddress, true),
            ]),
            // shortInterestInTokensUsingLongToken
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestInTokensKey(market.marketTokenAddress, market.longTokenAddress, false),
            ]),
            // shortInterestInTokensUsingShortToken
            createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
              openInterestInTokensKey(market.marketTokenAddress, market.shortTokenAddress, false),
            ]),
          ] as const)

          let claimableFundingAmountLong, claimableFundingAmountShort

          if (accountAddress) {
            ;[claimableFundingAmountLong, claimableFundingAmountShort] = await multicall(chainId, [
              // claimableFundingAmountLong
              createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
                claimableFundingAmountKey(
                  market.marketTokenAddress,
                  market.longTokenAddress,
                  accountAddress,
                ),
              ]),
              // claimableFundingAmountShort
              createCalldata(chainId, SatoruContract.DataStore, 'get_u256', [
                claimableFundingAmountKey(
                  market.marketTokenAddress,
                  market.shortTokenAddress,
                  accountAddress,
                ),
              ]),
            ] as const)
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

            virtualMarketId: virtualMarketId,
            virtualLongTokenId: virtualLongTokenId,
            virtualShortTokenId: virtualShortTokenId,
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
