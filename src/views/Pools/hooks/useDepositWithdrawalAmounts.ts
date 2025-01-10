import {useCallback, useMemo} from 'react'

import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {MarketTokenData} from '@/lib/trade/services/fetchMarketTokensData'
import getDepositAmounts from '@/lib/trade/utils/deposit/getDepositAmounts'
import calculateMarketPrice from '@/lib/trade/utils/market/calculateMarketPrice'
import getWithdrawalAmounts from '@/lib/trade/utils/withdrawal/getWithdrawalAmounts'

export interface TokenInputState {
  address?: string | undefined
  amount?: bigint | undefined
}

export interface WithdrawalAmounts {
  marketTokenAmount: bigint
  marketTokenUsd: bigint
  longTokenAmount: bigint
  shortTokenAmount: bigint
  longTokenUsd: bigint
  shortTokenUsd: bigint
  swapFeeUsd: bigint
  uiFeeUsd: bigint
  swapPriceImpactDeltaUsd: bigint
}

export interface DepositAmounts {
  marketTokenAmount: bigint
  marketTokenUsd: bigint
  longTokenAmount: bigint
  longTokenUsd: bigint
  shortTokenAmount: bigint
  shortTokenUsd: bigint
  swapFeeUsd: bigint
  uiFeeUsd: bigint
  swapPriceImpactDeltaUsd: bigint
}

export type DepositWithdrawalAmounts = DepositAmounts | WithdrawalAmounts

export function useDepositWithdrawalAmounts({
  isDeposit,
  marketInfo,
  marketToken,
  longTokenInputState,
  shortTokenInputState,
  marketTokenAmount,
  uiFeeFactor,
  focusedInput,
}: {
  isDeposit: boolean
  marketInfo?: MarketData | undefined
  marketToken?: MarketTokenData | undefined
  longTokenInputState: TokenInputState
  shortTokenInputState: TokenInputState
  marketTokenAmount: bigint
  uiFeeFactor: bigint
  focusedInput: 'market' | 'longCollateral' | 'shortCollateral'
}): DepositWithdrawalAmounts | undefined {
  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: {longTokenPrice, marketTokenPrice, shortTokenPrice} = {}} = useTokenPrices(
    useCallback(
      prices => {
        const longTokenPrice = prices.get(marketInfo?.longTokenAddress ?? '')
        const shortTokenPrice = prices.get(marketInfo?.shortTokenAddress ?? '')
        const marketTokenPrice = calculateMarketPrice(
          marketInfo,
          marketToken,
          longTokenPrice,
          shortTokenPrice,
        )
        return {
          longTokenPrice,
          marketTokenPrice,
          shortTokenPrice,
        }
      },
      [marketInfo, marketToken],
    ),
  )
  const halfOfLong = longTokenInputState.amount ? longTokenInputState.amount / 2n : undefined

  const amounts = useMemo(() => {
    if (!longTokenPrice || !shortTokenPrice || !marketTokenPrice) {
      return undefined
    }

    if (isDeposit) {
      if (!marketInfo || !marketToken) {
        return undefined
      }

      const longTokenAmount =
        (marketInfo.isSameCollaterals ? halfOfLong : longTokenInputState.amount) ?? 0n
      const shortTokenAmount = (() => {
        if (marketInfo.isSameCollaterals) {
          return longTokenInputState.amount ? longTokenInputState.amount - longTokenAmount : 0n
        }
        return shortTokenInputState.amount ?? 0n
      })()

      return getDepositAmounts({
        marketInfo,
        marketToken,
        longToken: marketInfo.longToken,
        shortToken: marketInfo.shortToken,
        longTokenPrice,
        shortTokenPrice,
        marketTokenPrice,
        longTokenAmount,
        shortTokenAmount,
        marketTokenAmount,
        includeLongToken: !!longTokenInputState.address,
        includeShortToken: !!shortTokenInputState.address,
        uiFeeFactor,
        strategy: focusedInput === 'market' ? 'byMarketToken' : 'byCollaterals',
      })
    }

    if (!marketInfo || !marketToken) {
      return undefined
    }

    let strategy: 'byMarketToken' | 'byLongCollateral' | 'byShortCollateral' | 'byCollaterals'
    if (focusedInput === 'market') {
      strategy = 'byMarketToken'
    } else if (focusedInput === 'longCollateral') {
      strategy = 'byLongCollateral'
    } else {
      strategy = 'byShortCollateral'
    }

    const longTokenAmount = marketInfo.isSameCollaterals
      ? (halfOfLong ?? 0n)
      : (longTokenInputState.amount ?? 0n)
    const shortTokenAmount = (() => {
      if (marketInfo.isSameCollaterals) {
        if (longTokenInputState.amount) {
          return longTokenInputState.amount - longTokenAmount
        }
        return 0n
      }
      return shortTokenInputState.amount ?? 0n
    })()

    return getWithdrawalAmounts({
      marketInfo,
      marketToken,
      marketTokenAmount,
      longTokenAmount,
      longTokenPrice,
      shortTokenAmount,
      shortTokenPrice,
      strategy,
      uiFeeFactor,
    })
  }, [
    focusedInput,
    halfOfLong,
    isDeposit,
    longTokenInputState.address,
    longTokenInputState.amount,
    longTokenPrice,
    marketInfo,
    marketToken,
    marketTokenAmount,
    marketTokenPrice,
    shortTokenInputState.address,
    shortTokenInputState.amount,
    shortTokenPrice,
    uiFeeFactor,
  ])

  return amounts
}
