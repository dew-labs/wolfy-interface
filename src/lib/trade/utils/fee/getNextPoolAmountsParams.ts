import type {Token} from '@/constants/tokens'
import type {MarketData} from '@/lib/trade/services/fetchMarketData'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import getMidPrice from '@/lib/trade/utils/price/getMidPrice'

export default function getNextPoolAmountsParams(p: {
  marketInfo: MarketData
  longToken: Token
  shortToken: Token
  longTokenPrice: Price
  shortTokenPrice: Price
  longPoolAmount: bigint
  shortPoolAmount: bigint
  longDeltaUsd: bigint
  shortDeltaUsd: bigint
}) {
  const {
    // marketInfo,
    longToken,
    shortToken,
    longTokenPrice,
    shortTokenPrice,
    longPoolAmount,
    shortPoolAmount,
    longDeltaUsd,
    shortDeltaUsd,
  } = p

  const longPrice = getMidPrice(longTokenPrice)
  const shortPrice = getMidPrice(shortTokenPrice)

  const longPoolUsd = convertTokenAmountToUsd(longPoolAmount, longToken.decimals, longPrice)
  const shortPoolUsd = convertTokenAmountToUsd(shortPoolAmount, shortToken.decimals, shortPrice)

  // const longPoolUsdAdjustment = convertTokenAmountToUsd(
  //   marketInfo.longPoolAmountAdjustment,
  //   longToken.decimals,
  //   longPrice,
  // )
  // const shortPoolUsdAdjustment = convertTokenAmountToUsd(
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
