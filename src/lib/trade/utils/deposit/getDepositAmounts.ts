import type {Token} from '@/constants/tokens'
import {applyFactor} from '@/lib/trade/numbers/applyFactor'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {MarketTokenData} from '@/lib/trade/services/fetchMarketTokensData'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import getPriceImpactForSwap from '@/lib/trade/utils/fee/getPriceImpactForSwap'
import getSwapFee from '@/lib/trade/utils/fee/getSwapFee'
import {marketTokenAmountToUsd} from '@/lib/trade/utils/market/marketTokenAmountToUsd'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import getMidPrice from '@/lib/trade/utils/price/getMidPrice'
import type {DepositAmounts} from '@/views/Pools/hooks/useDepositWithdrawalAmounts'

import getMarketTokenAmountByCollateral from './getMarketTokenAmountByCollateral'

export default function getDepositAmounts(p: {
  marketInfo: MarketData
  marketToken: MarketTokenData
  marketTokenPrice: Price
  longToken: Token
  shortToken: Token
  longTokenPrice: Price
  shortTokenPrice: Price
  longTokenAmount: bigint
  shortTokenAmount: bigint
  marketTokenAmount: bigint
  strategy: 'byCollaterals' | 'byMarketToken'
  includeLongToken: boolean
  includeShortToken: boolean
  uiFeeFactor: bigint
  forShift?: boolean
}): DepositAmounts {
  const {
    marketInfo,
    marketToken,
    marketTokenPrice,
    longToken,
    shortToken,
    longTokenPrice,
    shortTokenPrice,
    longTokenAmount,
    shortTokenAmount,
    marketTokenAmount,
    strategy,
    includeLongToken,
    includeShortToken,
    uiFeeFactor,
  } = p

  const values: DepositAmounts = {
    longTokenAmount: 0n,
    longTokenUsd: 0n,
    shortTokenAmount: 0n,
    shortTokenUsd: 0n,
    marketTokenAmount: 0n,
    marketTokenUsd: 0n,
    swapFeeUsd: 0n,
    uiFeeUsd: 0n,
    swapPriceImpactDeltaUsd: 0n,
  }

  const longTokenMidPrice = getMidPrice(longTokenPrice)
  const shortTokenMidPrice = getMidPrice(shortTokenPrice)

  if (strategy === 'byCollaterals') {
    if (longTokenAmount === 0n && shortTokenAmount === 0n) {
      return values
    }

    values.longTokenAmount = longTokenAmount
    values.longTokenUsd = convertTokenAmountToUsd(
      longTokenAmount,
      longToken.decimals,
      longTokenMidPrice,
    )
    values.shortTokenAmount = shortTokenAmount
    values.shortTokenUsd = convertTokenAmountToUsd(
      shortTokenAmount,
      shortToken.decimals,
      shortTokenMidPrice,
    )

    values.swapPriceImpactDeltaUsd = getPriceImpactForSwap(
      marketInfo,
      longToken,
      shortToken,
      longTokenPrice,
      shortTokenPrice,
      values.longTokenUsd,
      values.shortTokenUsd,
    )

    const totalDepositUsd = values.longTokenUsd + values.shortTokenUsd

    if (values.longTokenUsd > 0) {
      const swapFeeUsd = p.forShift
        ? 0n
        : getSwapFee(marketInfo, values.longTokenUsd, values.swapPriceImpactDeltaUsd > 0)
      values.swapFeeUsd = values.swapFeeUsd + swapFeeUsd

      const uiFeeUsd = applyFactor(values.longTokenUsd, uiFeeFactor)
      values.uiFeeUsd = values.uiFeeUsd + uiFeeUsd

      values.marketTokenAmount =
        values.marketTokenAmount +
        getMarketTokenAmountByCollateral({
          marketInfo,
          marketToken,
          tokenIn: longToken,
          tokenInPrice: longTokenPrice,
          tokenOut: shortToken,
          tokenOutPrice: shortTokenPrice,
          amount: values.longTokenAmount,
          priceImpactDeltaUsd:
            (values.swapPriceImpactDeltaUsd * values.longTokenUsd) / totalDepositUsd,
          swapFeeUsd,
          uiFeeUsd,
        })
    }

    if (values.shortTokenUsd > 0) {
      const swapFeeUsd = p.forShift
        ? 0n
        : getSwapFee(marketInfo, values.shortTokenUsd, values.swapPriceImpactDeltaUsd > 0)
      values.swapFeeUsd = values.swapFeeUsd + swapFeeUsd

      const uiFeeUsd = applyFactor(values.shortTokenUsd, uiFeeFactor)
      values.uiFeeUsd = values.uiFeeUsd + uiFeeUsd

      values.marketTokenAmount =
        values.marketTokenAmount +
        getMarketTokenAmountByCollateral({
          marketInfo,
          marketToken,
          tokenIn: shortToken,
          tokenInPrice: shortTokenPrice,
          tokenOut: longToken,
          tokenOutPrice: longTokenPrice,
          amount: values.shortTokenAmount,
          priceImpactDeltaUsd:
            (values.swapPriceImpactDeltaUsd * values.shortTokenUsd) / totalDepositUsd,
          swapFeeUsd,
          uiFeeUsd,
        })
    }

    values.marketTokenUsd = convertTokenAmountToUsd(
      values.marketTokenAmount,
      marketToken.decimals,
      marketTokenPrice.min,
    )
  } else {
    if (marketTokenAmount === 0n) {
      return values
    }

    values.marketTokenAmount = marketTokenAmount
    values.marketTokenUsd = marketTokenAmountToUsd(marketInfo, marketToken, marketTokenAmount)

    const prevLongTokenUsd = convertTokenAmountToUsd(
      longTokenAmount,
      longToken.decimals,
      longTokenMidPrice,
    )
    const prevShortTokenUsd = convertTokenAmountToUsd(
      shortTokenAmount,
      shortToken.decimals,
      shortTokenMidPrice,
    )
    const prevSumUsd = prevLongTokenUsd + prevShortTokenUsd

    if (p.forShift) {
      // Reverse the withdrawal amounts
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

      values.longTokenUsd = (values.marketTokenUsd * longPoolUsd) / totalPoolUsd
      values.shortTokenUsd = (values.marketTokenUsd * shortPoolUsd) / totalPoolUsd
    } else if (includeLongToken && includeShortToken && prevSumUsd > 0) {
      values.longTokenUsd = (values.marketTokenUsd * prevLongTokenUsd) / prevSumUsd
      values.shortTokenUsd = values.marketTokenUsd - values.longTokenUsd
    } else if (includeLongToken) {
      values.longTokenUsd = values.marketTokenUsd
    } else if (includeShortToken) {
      values.shortTokenUsd = values.marketTokenUsd
    }

    values.swapPriceImpactDeltaUsd = getPriceImpactForSwap(
      marketInfo,
      longToken,
      shortToken,
      longTokenPrice,
      shortTokenPrice,
      values.longTokenUsd,
      values.shortTokenUsd,
    )

    if (!p.forShift) {
      const swapFeeUsd = getSwapFee(
        marketInfo,
        values.marketTokenUsd,
        values.swapPriceImpactDeltaUsd > 0,
      )
      values.swapFeeUsd = values.swapFeeUsd + swapFeeUsd
    }

    const uiFeeUsd = applyFactor(values.marketTokenUsd, uiFeeFactor)
    values.uiFeeUsd = values.uiFeeUsd + uiFeeUsd

    const totalFee = values.swapFeeUsd + values.uiFeeUsd
    let totalDepositUsd = values.longTokenUsd + values.shortTokenUsd

    // Adjust long and short token amounts to account for swap fee, ui fee and price impact
    if (totalDepositUsd > 0) {
      values.longTokenUsd = values.longTokenUsd + (totalFee * values.longTokenUsd) / totalDepositUsd
      values.shortTokenUsd =
        values.shortTokenUsd + (totalFee * values.shortTokenUsd) / totalDepositUsd

      totalDepositUsd = values.longTokenUsd + values.shortTokenUsd

      // Ignore positive price impact
      if (values.swapPriceImpactDeltaUsd < 0 && totalDepositUsd > 0) {
        values.longTokenUsd =
          values.longTokenUsd +
          (values.swapPriceImpactDeltaUsd * values.longTokenUsd) / totalDepositUsd
        values.shortTokenUsd =
          values.shortTokenUsd +
          (values.swapPriceImpactDeltaUsd * values.shortTokenUsd) / totalDepositUsd
      }
    }

    values.longTokenAmount = convertUsdToTokenAmount(
      values.longTokenUsd,
      longToken.decimals,
      longTokenMidPrice,
    )
    values.shortTokenAmount = convertUsdToTokenAmount(
      values.shortTokenUsd,
      shortToken.decimals,
      shortTokenMidPrice,
    )
  }

  return values
}
