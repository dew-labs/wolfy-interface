import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenData} from '@/lib/trade/services/fetchTokensData'
import convertPriceToUsd from '@/lib/trade/utils/price/convertPriceToUsd'
import getMidPrice from '@/lib/trade/utils/price/getMidPrice'

export default function getNextPoolAmountsParams(p: {
  marketInfo: MarketData
  longToken: TokenData
  shortToken: TokenData
  longPoolAmount: bigint
  shortPoolAmount: bigint
  longDeltaUsd: bigint
  shortDeltaUsd: bigint
}) {
  const {
    // marketInfo,
    longToken,
    shortToken,
    longPoolAmount,
    shortPoolAmount,
    longDeltaUsd,
    shortDeltaUsd,
  } = p

  const longPrice = getMidPrice(longToken.price)
  const shortPrice = getMidPrice(shortToken.price)

  const longPoolUsd = convertPriceToUsd(longPoolAmount, longToken.decimals, longPrice)
  const shortPoolUsd = convertPriceToUsd(shortPoolAmount, shortToken.decimals, shortPrice)

  // const longPoolUsdAdjustment = convertPriceToUsd(
  //   marketInfo.longPoolAmountAdjustment,
  //   longToken.decimals,
  //   longPrice,
  // )
  // const shortPoolUsdAdjustment = convertPriceToUsd(
  //   marketInfo.shortPoolAmountAdjustment,
  //   shortToken.decimals,
  //   shortPrice,
  // )
  const longPoolUsdAdjustment = 0n
  const shortPoolUsdAdjustment = 0n

  const nextLongPoolUsd = longPoolUsd + longDeltaUsd + longPoolUsdAdjustment
  const nextShortPoolUsd = shortPoolUsd + shortDeltaUsd + shortPoolUsdAdjustment

  return {
    longPoolUsd,
    shortPoolUsd,
    nextLongPoolUsd,
    nextShortPoolUsd,
  }
}
