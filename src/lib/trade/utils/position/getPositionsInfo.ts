import type {Token} from '@/constants/tokens'
import {getBasisPoints} from '@/lib/trade/numbers/getBasisPoints'
import type {MarketData, MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {Position, PositionsData} from '@/lib/trade/services/fetchPositions'
import type {PositionsConstants} from '@/lib/trade/services/fetchPositionsConstants'
import type {Price} from '@/lib/trade/services/fetchTokenPrices'
import type {TokenData, TokensData} from '@/lib/trade/services/fetchTokensData'
import type {ReferralInfo} from '@/lib/trade/services/referral/fetchReferralInfo'
import {getPositionFee} from '@/lib/trade/utils/fee/getPositionFee'
import getPriceImpactForPosition from '@/lib/trade/utils/fee/getPriceImpactForPosition'
import {getMaxAllowedLeverageByMinCollateralFactor} from '@/lib/trade/utils/market/getMaxAllowedLeverageByMinCollateralFactor'
import convertPriceToTokenAmount from '@/lib/trade/utils/price/convertPriceToTokenAmount'
import convertPriceToUsd from '@/lib/trade/utils/price/convertPriceToUsd'
import expandDecimals from '@/utils/numbers/expandDecimals'

import getLeverage from './getLeverage'
import getLiquidationPrice from './getLiquidationPrice'
import {getPositionNetValue} from './getPositionNetValue'
import getPositionPendingFeesUsd from './getPositionPendingFeesUsd'
import getPositionPnlUsd from './getPositionPnlUsd'

export function getShouldUseMaxPrice(isIncrease: boolean, isLong: boolean) {
  return isIncrease ? isLong : !isLong
}

export function getMarkPrice(p: {price: Price; isIncrease: boolean; isLong: boolean}) {
  const {price, isIncrease, isLong} = p

  const shouldUseMaxPrice = getShouldUseMaxPrice(isIncrease, isLong)

  return shouldUseMaxPrice ? price.max : price.min
}

export function getEntryPrice(p: {sizeInUsd: bigint; sizeInTokens: bigint; indexToken: Token}) {
  const {sizeInUsd, sizeInTokens, indexToken} = p

  if (sizeInTokens <= 0) {
    return undefined
  }

  return (sizeInUsd * expandDecimals(1, indexToken.decimals)) / sizeInTokens
}

export type PositionInfo = Position & {
  marketData: MarketData
  indexToken: TokenData
  collateralToken: TokenData
  pnlToken: TokenData
  markPrice: bigint
  entryPrice: bigint | undefined
  liquidationPrice: bigint | undefined
  collateralUsd: bigint
  remainingCollateralUsd: bigint
  remainingCollateralAmount: bigint
  hasLowCollateral: boolean
  pnl: bigint
  pnlPercentage: bigint
  pnlAfterFees: bigint
  pnlAfterFeesPercentage: bigint
  leverage: bigint | undefined
  leverageWithPnl: bigint | undefined
  netValue: bigint
  closingFeeUsd: bigint
  uiFeeUsd: bigint
  pendingFundingFeesUsd: bigint
  pendingClaimableFundingFeesUsd: bigint
}

export type PositionsInfoData = Map<string, PositionInfo>

export default function getPositionsInfo(
  marketsData: MarketsData,
  tokensData: TokensData,
  positionsData: PositionsData,
  positionsConstants: PositionsConstants,
  uiFeeFactor: bigint,
  showPnlInLeverage: boolean,
  referralInfo?: ReferralInfo,
): PositionsInfoData {
  const {minCollateralUsd} = positionsConstants

  const positionsInfo = new Map<string, PositionInfo>()

  positionsData.forEach((position, positionKey) => {
    const marketData = marketsData.get(position.marketAddress)
    const indexToken = marketData?.indexToken
    const pnlToken = position.isLong ? marketData?.longToken : marketData?.shortToken
    const collateralToken = tokensData.get(position.collateralTokenAddress)

    if (!marketData || !indexToken || !pnlToken || !collateralToken) return

    const markPrice = getMarkPrice({
      price: indexToken.price,
      isLong: position.isLong,
      isIncrease: false,
    })
    const collateralMinPrice = collateralToken.price.min
    const entryPrice = getEntryPrice({
      sizeInTokens: position.sizeInTokens,
      sizeInUsd: position.sizeInUsd,
      indexToken,
    })

    const pendingFundingFeesUsd = convertPriceToUsd(
      position.fundingFeeAmount,
      collateralToken.decimals,
      collateralToken.price.min,
    )

    const pendingClaimableFundingFeesLongUsd = convertPriceToUsd(
      position.claimableLongTokenAmount,
      marketData.longToken.decimals,
      marketData.longToken.price.min,
    )
    const pendingClaimableFundingFeesShortUsd = convertPriceToUsd(
      position.claimableShortTokenAmount,
      marketData.shortToken.decimals,
      marketData.shortToken.price.min,
    )

    const pendingClaimableFundingFeesUsd =
      pendingClaimableFundingFeesLongUsd + pendingClaimableFundingFeesShortUsd

    const totalPendingFeesUsd = getPositionPendingFeesUsd({
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd,
    })

    const closingPriceImpactDeltaUsd = getPriceImpactForPosition(
      marketData,
      position.sizeInUsd * -1n,
      position.isLong,
      {fallbackToZero: true},
    )

    const positionFeeInfo = getPositionFee(
      marketData,
      position.sizeInUsd,
      closingPriceImpactDeltaUsd > 0,
      referralInfo,
      uiFeeFactor,
    )

    const closingFeeUsd = positionFeeInfo.positionFeeUsd
    const uiFeeUsd = positionFeeInfo.uiFeeUsd ?? 0n

    const collateralUsd = convertPriceToUsd(
      position.collateralAmount,
      collateralToken.decimals,
      collateralMinPrice,
    )

    const remainingCollateralUsd = collateralUsd - totalPendingFeesUsd

    const remainingCollateralAmount = convertPriceToTokenAmount(
      remainingCollateralUsd,
      collateralToken.decimals,
      collateralMinPrice,
    )

    const pnl = getPositionPnlUsd({
      marketInfo: marketData,
      sizeInUsd: position.sizeInUsd,
      sizeInTokens: position.sizeInTokens,
      markPrice,
      isLong: position.isLong,
    })

    const pnlPercentage = collateralUsd != 0n ? getBasisPoints(pnl, collateralUsd) : 0n

    const netValue = getPositionNetValue({
      collateralUsd: collateralUsd,
      pnl,
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd: pendingFundingFeesUsd,
      closingFeeUsd,
      uiFeeUsd,
    })

    const pnlAfterFees = pnl - totalPendingFeesUsd - closingFeeUsd - uiFeeUsd
    const pnlAfterFeesPercentage =
      collateralUsd != 0n ? getBasisPoints(pnlAfterFees, collateralUsd + closingFeeUsd) : 0n

    const leverage = getLeverage({
      sizeInUsd: position.sizeInUsd,
      collateralUsd: collateralUsd,
      pnl: showPnlInLeverage ? pnl : undefined,
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd: pendingFundingFeesUsd,
    })

    const leverageWithPnl = getLeverage({
      sizeInUsd: position.sizeInUsd,
      collateralUsd: collateralUsd,
      pnl,
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd: pendingFundingFeesUsd,
    })

    const maxAllowedLeverage = getMaxAllowedLeverageByMinCollateralFactor(
      marketData.minCollateralFactor,
    )

    const hasLowCollateral = (leverage !== undefined && leverage > maxAllowedLeverage) || false

    const liquidationPrice = getLiquidationPrice({
      marketInfo: marketData,
      collateralToken,
      sizeInUsd: position.sizeInUsd,
      sizeInTokens: position.sizeInTokens,
      collateralUsd,
      collateralAmount: position.collateralAmount,
      referralInfo,
      minCollateralUsd,
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd,
      isLong: position.isLong,
    })

    positionsInfo.set(positionKey, {
      ...position,
      marketData,
      indexToken,
      collateralToken,
      pnlToken,
      markPrice,
      entryPrice,
      liquidationPrice,
      collateralUsd,
      remainingCollateralUsd,
      remainingCollateralAmount,
      hasLowCollateral,
      leverage,
      leverageWithPnl,
      pnl,
      pnlPercentage,
      pnlAfterFees,
      pnlAfterFeesPercentage,
      netValue,
      closingFeeUsd,
      uiFeeUsd,
      pendingFundingFeesUsd,
      pendingClaimableFundingFeesUsd,
    })
  })

  return positionsInfo
}
