import type {MarketData} from '@/lib/trade/services/fetchMarketsData'
import type {TokenData} from '@/lib/trade/services/fetchTokensData'
import {getTokenPoolType} from '@/lib/trade/utils/market/getTokenPoolType'

import getNextPoolAmountsParams from './getNextPoolAmountsParams'
import getPriceImpactUsd from './getPriceImpactUsd'

export default function getPriceImpactForSwap(
  marketInfo: MarketData,
  tokenA: TokenData,
  tokenB: TokenData,
  usdDeltaTokenA: bigint,
  usdDeltaTokenB: bigint,
  opts: {fallbackToZero?: boolean} = {},
) {
  const tokenAPoolType = getTokenPoolType(marketInfo, tokenA.address)
  const tokenBPoolType = getTokenPoolType(marketInfo, tokenB.address)

  if (
    tokenAPoolType === undefined ||
    tokenBPoolType === undefined ||
    (tokenAPoolType === tokenBPoolType && !marketInfo.isSameCollaterals)
  ) {
    throw new Error(
      `Invalid tokens to swap ${marketInfo.marketTokenAddress} ${tokenA.address} ${tokenB.address}`,
    )
  }

  const [longToken, shortToken] = tokenAPoolType === 'long' ? [tokenA, tokenB] : [tokenB, tokenA]
  const [longDeltaUsd, shortDeltaUsd] =
    tokenAPoolType === 'long' ? [usdDeltaTokenA, usdDeltaTokenB] : [usdDeltaTokenB, usdDeltaTokenA]

  const {longPoolUsd, shortPoolUsd, nextLongPoolUsd, nextShortPoolUsd} = getNextPoolAmountsParams({
    marketInfo,
    longToken,
    shortToken,
    longPoolAmount: marketInfo.longPoolAmount,
    shortPoolAmount: marketInfo.shortPoolAmount,
    longDeltaUsd,
    shortDeltaUsd,
  })

  const priceImpactUsd = getPriceImpactUsd({
    currentLongUsd: longPoolUsd,
    currentShortUsd: shortPoolUsd,
    nextLongUsd: nextLongPoolUsd,
    nextShortUsd: nextShortPoolUsd,
    factorPositive: marketInfo.swapImpactFactorPositive,
    factorNegative: marketInfo.swapImpactFactorNegative,
    exponentFactor: marketInfo.swapImpactExponentFactor,
    fallbackToZero: opts.fallbackToZero,
  })

  if (priceImpactUsd > 0) {
    return priceImpactUsd
  }

  const virtualInventoryLong = marketInfo.virtualPoolAmountForLongToken
  const virtualInventoryShort = marketInfo.virtualPoolAmountForShortToken

  if (virtualInventoryLong <= 0 || virtualInventoryShort <= 0) {
    return priceImpactUsd
  }

  const virtualInventoryParams = getNextPoolAmountsParams({
    marketInfo,
    longToken,
    shortToken,
    longPoolAmount: virtualInventoryLong,
    shortPoolAmount: virtualInventoryShort,
    longDeltaUsd,
    shortDeltaUsd,
  })

  const priceImpactUsdForVirtualInventory = getPriceImpactUsd({
    currentLongUsd: virtualInventoryParams.longPoolUsd,
    currentShortUsd: virtualInventoryParams.shortPoolUsd,
    nextLongUsd: virtualInventoryParams.nextLongPoolUsd,
    nextShortUsd: virtualInventoryParams.nextShortPoolUsd,
    factorPositive: marketInfo.swapImpactFactorPositive,
    factorNegative: marketInfo.swapImpactFactorNegative,
    exponentFactor: marketInfo.swapImpactExponentFactor,
    fallbackToZero: opts.fallbackToZero,
  })

  return priceImpactUsdForVirtualInventory < priceImpactUsd
    ? priceImpactUsdForVirtualInventory
    : priceImpactUsd
}
