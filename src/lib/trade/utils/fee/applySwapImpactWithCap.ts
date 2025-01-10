import type {Token} from '@/constants/tokens'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import {getTokenPoolType} from '@/lib/trade/utils/market/getTokenPoolType'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import roundUpMagnitudeDivision from '@/utils/numbers/bigint/roundUpMagnitudeDivision'
import expandDecimals from '@/utils/numbers/expandDecimals'

export function applySwapImpactWithCap(
  marketInfo: MarketData,
  token: Token,
  tokenPrice: Price,
  priceImpactDeltaUsd: bigint,
) {
  const tokenPoolType = getTokenPoolType(marketInfo, token.address)

  if (!tokenPoolType) {
    throw new Error(
      `Token ${token.address} is not a collateral of the market ${marketInfo.marketTokenAddress}`,
    )
  }

  const isLongCollateral = tokenPoolType === 'long'
  const price = priceImpactDeltaUsd > 0 ? tokenPrice.max : tokenPrice.min

  let impactDeltaAmount: bigint
  let cappedDiffUsd = 0n

  if (priceImpactDeltaUsd > 0) {
    // round positive impactAmount down, this will be deducted from the swap impact pool for the user
    impactDeltaAmount = convertUsdToTokenAmount(priceImpactDeltaUsd, token.decimals, price)

    const maxImpactAmount = isLongCollateral
      ? marketInfo.swapImpactPoolAmountLong
      : marketInfo.swapImpactPoolAmountShort

    if (impactDeltaAmount > maxImpactAmount) {
      cappedDiffUsd =
        ((impactDeltaAmount - maxImpactAmount) * price) / expandDecimals(1, token.decimals)

      impactDeltaAmount = maxImpactAmount
    }
  } else {
    // round negative impactAmount up, this will be deducted from the user
    impactDeltaAmount = roundUpMagnitudeDivision(
      priceImpactDeltaUsd * expandDecimals(1, token.decimals),
      price,
    )
  }

  return {impactDeltaAmount, cappedDiffUsd}
}
