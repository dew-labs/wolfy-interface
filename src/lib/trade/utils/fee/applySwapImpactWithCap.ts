import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenData} from '@/lib/trade/services/fetchTokensData'
import {getTokenPoolType} from '@/lib/trade/utils/market/getTokenPoolType'
import convertPriceToTokenAmount from '@/lib/trade/utils/price/convertPriceToTokenAmount'
import roundUpMagnitudeDivision from '@/utils/numbers/bigint/roundUpMagnitudeDivision'
import expandDecimals from '@/utils/numbers/expandDecimals'

export function applySwapImpactWithCap(
  marketInfo: MarketData,
  token: TokenData,
  priceImpactDeltaUsd: bigint,
) {
  const tokenPoolType = getTokenPoolType(marketInfo, token.address)

  if (!tokenPoolType) {
    throw new Error(
      `Token ${token.address} is not a collateral of the market ${marketInfo.marketTokenAddress}`,
    )
  }

  const isLongCollateral = tokenPoolType === 'long'
  const price = priceImpactDeltaUsd > 0 ? token.price.max : token.price.min

  let impactDeltaAmount: bigint
  let cappedDiffUsd = 0n

  if (priceImpactDeltaUsd > 0) {
    // round positive impactAmount down, this will be deducted from the swap impact pool for the user
    impactDeltaAmount = convertPriceToTokenAmount(priceImpactDeltaUsd, token.decimals, price)

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
