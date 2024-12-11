import type {StarknetChainId} from 'wolfy-sdk'

import {getTokensMetadata, type Token} from '@/constants/tokens'
import {getBasisPoints} from '@/lib/trade/numbers/getBasisPoints'
import type {MarketData, MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {Position, PositionsData} from '@/lib/trade/services/fetchPositions'
import type {PositionConstants} from '@/lib/trade/services/fetchPositionsConstants'
import type {TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import type {ReferralInfo} from '@/lib/trade/services/referral/fetchReferralInfo'
import {getPositionFee} from '@/lib/trade/utils/fee/getPositionFee'
import getPriceImpactForPosition from '@/lib/trade/utils/fee/getPriceImpactForPosition'
import {getMaxAllowedLeverageByMinCollateralFactor} from '@/lib/trade/utils/market/getMaxAllowedLeverageByMinCollateralFactor'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import {getMarkPrice} from '@/lib/trade/utils/price/getMarkPrice'
import expandDecimals from '@/utils/numbers/expandDecimals'

import getLeverage from './getLeverage'
import getLiquidationPrice from './getLiquidationPrice'
import {getPositionNetValue} from './getPositionNetValue'
import getPositionPendingFeesUsd from './getPositionPendingFeesUsd'
import getPositionPnlUsd from './getPositionPnlUsd'

export function getEntryPrice(p: {sizeInUsd: bigint; sizeInTokens: bigint; indexToken: Token}) {
  const {sizeInUsd, sizeInTokens, indexToken} = p

  if (sizeInTokens <= 0) {
    return undefined
  }

  return (sizeInUsd * expandDecimals(1, indexToken.decimals)) / sizeInTokens
}

export type PositionInfo = Position & {
  marketData: MarketData
  indexToken: Token
  collateralToken: Token
  pnlToken: Token
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

export interface PositionsInfoData {
  positionsInfo: Map<bigint, PositionInfo>
  positionsInfoViaStringRepresentation: Map<string, PositionInfo>
}

export default function getPositionsInfo(
  chainId: StarknetChainId,
  marketsData: MarketsData,
  tokenPricesData: TokenPricesData,
  positionsData: PositionsData,
  positionConstants: PositionConstants,
  uiFeeFactor: bigint,
  showPnlInLeverage: boolean,
  referralInfo?: ReferralInfo | null,
): PositionsInfoData {
  const {minCollateralUsd} = positionConstants
  const tokensMetadata = getTokensMetadata(chainId)

  const positionsInfo = new Map<bigint, PositionInfo>()
  const positionsInfoViaStringRepresentation = new Map<string, PositionInfo>()

  positionsData.positionsData.forEach((position, positionKey) => {
    const marketData = marketsData.get(position.marketAddress)
    const indexToken = marketData?.indexToken
    const pnlToken = position.isLong ? marketData?.longToken : marketData?.shortToken
    const collateralToken = tokensMetadata.get(position.collateralTokenAddress)

    if (!marketData || !indexToken || !pnlToken || !collateralToken) return

    const indexTokenPrice = tokenPricesData.get(marketData.indexToken.address)
    const collateralTokenPrice = tokenPricesData.get(collateralToken.address)
    const longTokenPrice = tokenPricesData.get(marketData.longToken.address)
    const shortTokenPrice = tokenPricesData.get(marketData.shortToken.address)

    if (!indexTokenPrice || !collateralTokenPrice || !longTokenPrice || !shortTokenPrice) return

    const markPrice = getMarkPrice({
      price: indexTokenPrice,
      isLong: position.isLong,
      isIncrease: false,
    })
    const collateralMinPrice = collateralTokenPrice.min
    const entryPrice = getEntryPrice({
      sizeInTokens: position.sizeInTokens,
      sizeInUsd: position.sizeInUsd,
      indexToken,
    })

    const pendingFundingFeesUsd = convertTokenAmountToUsd(
      position.fundingFeeAmount,
      collateralToken.decimals,
      collateralTokenPrice.min,
    )

    const pendingClaimableFundingFeesLongUsd = convertTokenAmountToUsd(
      position.claimableLongTokenAmount,
      marketData.longToken.decimals,
      longTokenPrice.min,
    )
    const pendingClaimableFundingFeesShortUsd = convertTokenAmountToUsd(
      position.claimableShortTokenAmount,
      marketData.shortToken.decimals,
      shortTokenPrice.min,
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

    const collateralUsd = convertTokenAmountToUsd(
      position.collateralAmount,
      collateralToken.decimals,
      collateralMinPrice,
    )

    const remainingCollateralUsd = collateralUsd - totalPendingFeesUsd

    const remainingCollateralAmount = convertUsdToTokenAmount(
      remainingCollateralUsd,
      collateralToken.decimals,
      collateralMinPrice,
    )

    const pnl = getPositionPnlUsd({
      marketInfo: marketData,
      tokenPricesData,
      sizeInUsd: position.sizeInUsd,
      sizeInTokens: position.sizeInTokens,
      markPrice,
      isLong: position.isLong,
    })

    const pnlPercentage = collateralUsd === 0n ? 0n : getBasisPoints(pnl, collateralUsd)

    const netValue = getPositionNetValue({
      collateralUsd,
      pnl,
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd,
      closingFeeUsd,
      uiFeeUsd,
    })

    // Liquidated positions, don't need to show them
    if (netValue <= 0n) return

    const pnlAfterFees = pnl - totalPendingFeesUsd - closingFeeUsd - uiFeeUsd
    const pnlAfterFeesPercentage =
      collateralUsd === 0n ? 0n : getBasisPoints(pnlAfterFees, collateralUsd + closingFeeUsd)

    const leverage = getLeverage({
      sizeInUsd: position.sizeInUsd,
      collateralUsd,
      pnl: showPnlInLeverage ? pnl : undefined,
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd,
    })

    const leverageWithPnl = getLeverage({
      sizeInUsd: position.sizeInUsd,
      collateralUsd,
      pnl,
      pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd,
      pendingFundingFeesUsd,
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

    const data = {
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
    }

    positionsInfo.set(positionKey, data)
    positionsInfoViaStringRepresentation.set(position.stringRepresentation, data)
  })

  return {
    positionsInfo,
    positionsInfoViaStringRepresentation,
  }
}
