import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {MarketTokenData} from '@/lib/trade/services/fetchMarketTokensData'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import {marketTokenAmountToUsd} from '@/lib/trade/utils/market/marketTokenAmountToUsd'
import usdToMarketTokenAmount from '@/lib/trade/utils/market/usdToMarketTokenAmount'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import type {WithdrawalAmounts} from '@/views/Pools/hooks/useDepositWithdrawalAmounts'

export default function getWithdrawalAmounts(p: {
  marketInfo: MarketData
  marketToken: MarketTokenData
  marketTokenAmount: bigint
  longTokenAmount: bigint
  longTokenPrice: Price
  shortTokenAmount: bigint
  shortTokenPrice: Price
  uiFeeFactor: bigint
  strategy: 'byMarketToken' | 'byLongCollateral' | 'byShortCollateral' | 'byCollaterals'
  forShift?: boolean
}) {
  const {
    marketInfo,
    marketToken,
    marketTokenAmount,
    longTokenAmount,
    longTokenPrice,
    shortTokenAmount,
    shortTokenPrice,
    uiFeeFactor,
    strategy,
  } = p

  const {longToken, shortToken} = marketInfo

  const longPoolAmount = marketInfo.longPoolAmount
  const shortPoolAmount = marketInfo.shortPoolAmount

  const longPoolUsd = convertTokenAmountToUsd(
    longPoolAmount,
    longToken.decimals,
    longTokenPrice.max,
  )
  const shortPoolUsd = convertTokenAmountToUsd(
    shortPoolAmount,
    shortToken.decimals,
    shortTokenPrice.max,
  )

  const totalPoolUsd = longPoolUsd + shortPoolUsd

  const values: WithdrawalAmounts = {
    marketTokenAmount: 0n,
    marketTokenUsd: 0n,
    longTokenAmount: 0n,
    longTokenUsd: 0n,
    shortTokenAmount: 0n,
    shortTokenUsd: 0n,
    swapFeeUsd: 0n,
    uiFeeUsd: 0n,
    swapPriceImpactDeltaUsd: 0n,
  }

  if (totalPoolUsd === 0n) {
    return values
  }

  if (strategy === 'byMarketToken') {
    values.marketTokenAmount = marketTokenAmount
    values.marketTokenUsd = marketTokenAmountToUsd(marketInfo, marketToken, marketTokenAmount)

    values.longTokenUsd = (values.marketTokenUsd * longPoolUsd) / totalPoolUsd
    values.shortTokenUsd = (values.marketTokenUsd * shortPoolUsd) / totalPoolUsd

    const longSwapFeeUsd = p.forShift
      ? 0n
      : applyFactor(values.longTokenUsd, p.marketInfo.swapFeeFactorForNegativeImpact)
    const shortSwapFeeUsd = p.forShift
      ? 0n
      : applyFactor(values.shortTokenUsd, p.marketInfo.swapFeeFactorForNegativeImpact)

    const longUiFeeUsd = applyFactor(values.marketTokenUsd, uiFeeFactor)
    const shortUiFeeUsd = applyFactor(values.shortTokenUsd, uiFeeFactor)

    values.uiFeeUsd = applyFactor(values.marketTokenUsd, uiFeeFactor)
    values.swapFeeUsd = longSwapFeeUsd + shortSwapFeeUsd

    values.longTokenUsd = values.longTokenUsd - longSwapFeeUsd - longUiFeeUsd
    values.shortTokenUsd = values.shortTokenUsd - shortSwapFeeUsd - shortUiFeeUsd

    values.longTokenAmount = convertUsdToTokenAmount(
      values.longTokenUsd,
      longToken.decimals,
      longTokenPrice.max,
    )
    values.shortTokenAmount = convertUsdToTokenAmount(
      values.shortTokenUsd,
      shortToken.decimals,
      shortTokenPrice.max,
    )
  } else {
    if (strategy === 'byLongCollateral' && longPoolUsd > 0) {
      values.longTokenAmount = longTokenAmount
      values.longTokenUsd = convertTokenAmountToUsd(
        longTokenAmount,
        longToken.decimals,
        longTokenPrice.max,
      )
      values.shortTokenUsd = (values.longTokenUsd * shortPoolUsd) / longPoolUsd
      values.shortTokenAmount = convertUsdToTokenAmount(
        values.shortTokenUsd,
        shortToken.decimals,
        shortTokenPrice.max,
      )
    } else if (strategy === 'byShortCollateral' && shortPoolUsd > 0) {
      values.shortTokenAmount = shortTokenAmount
      values.shortTokenUsd = convertTokenAmountToUsd(
        shortTokenAmount,
        shortToken.decimals,
        shortTokenPrice.max,
      )
      values.longTokenUsd = (values.shortTokenUsd * longPoolUsd) / shortPoolUsd
      values.longTokenAmount = convertUsdToTokenAmount(
        values.longTokenUsd,
        longToken.decimals,
        longTokenPrice.max,
      )
    } else if (strategy === 'byCollaterals') {
      values.longTokenAmount = longTokenAmount
      values.longTokenUsd = convertTokenAmountToUsd(
        longTokenAmount,
        longToken.decimals,
        longTokenPrice.max,
      )
      values.shortTokenAmount = shortTokenAmount
      values.shortTokenUsd = convertTokenAmountToUsd(
        shortTokenAmount,
        shortToken.decimals,
        shortTokenPrice.max,
      )

      values.uiFeeUsd = applyFactor(values.longTokenUsd + values.shortTokenUsd, uiFeeFactor)
      values.marketTokenUsd += values.uiFeeUsd
    }

    values.marketTokenUsd = values.marketTokenUsd + values.longTokenUsd + values.shortTokenUsd
    if (!p.forShift) {
      values.swapFeeUsd = applyFactor(
        values.longTokenUsd + values.shortTokenUsd,
        p.marketInfo.swapFeeFactorForNegativeImpact,
      )
    }

    values.marketTokenUsd = values.marketTokenUsd + values.swapFeeUsd
    values.marketTokenAmount = usdToMarketTokenAmount(
      marketInfo,
      marketToken,
      values.marketTokenUsd,
    )
  }

  return values
}
