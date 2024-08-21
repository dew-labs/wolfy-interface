import type {MarketData, MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {Order, OrdersData} from '@/lib/trade/services/fetchOrders'
import type {TokenData, TokensData} from '@/lib/trade/services/fetchTokensData'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import getTokensRatioByAmounts, {
  type TokensRatio,
} from '@/lib/trade/utils/token/getTokensRatioByAmounts'
import parseContractPrice from '@/lib/trade/utils/token/parseContractPrice'
import {logError} from '@/utils/logger'

import getPositionOrderTitle from './getPositionOrderTitle'
import getTriggerThresholdType, {type TriggerThresholdType} from './getTriggerThresholdType'
import getSwapOrderTitle from './swap/getSwapOrderTitle'
import getSwapPathOutputAddresses from './swap/getSwapPathOutputAddresses'
import getSwapPathStats, {type SwapPathStats} from './swap/getSwapPathStats'
import {isIncreaseOrderType} from './type/isIncreaseOrderType'
import isSwapOrderType from './type/isSwapOrderType'

export type SwapOrderInfo = Order & {
  title: string
  swapPathStats?: SwapPathStats | undefined
  triggerRatio?: TokensRatio
  initialCollateralToken: TokenData
  targetCollateralToken: TokenData
}

export type PositionOrderInfo = Order & {
  title: string
  marketData: MarketData
  swapPathStats?: SwapPathStats | undefined
  indexToken: TokenData
  initialCollateralToken: TokenData
  targetCollateralToken: TokenData
  acceptablePrice: bigint
  triggerPrice: bigint
  triggerThresholdType: TriggerThresholdType
}

export default function getOrdersInfo(
  marketsData: MarketsData,
  tokensData: TokensData,
  ordersData: OrdersData,
) {
  ordersData.forEach((order, key) => {
    try {
      if (isSwapOrderType(order.orderType)) {
        const initialCollateralToken = tokensData.get(order.initialCollateralTokenAddress)
        const {outTokenAddress} = getSwapPathOutputAddresses({
          marketsData,
          swapPath: order.swapPath,
          initialCollateralAddress: order.initialCollateralTokenAddress,
          isIncrease: false,
        })

        if (!outTokenAddress) return

        const targetCollateralToken = tokensData.get(outTokenAddress)

        if (!initialCollateralToken || !targetCollateralToken) {
          return
        }

        const swapPathStats = getSwapPathStats({
          marketsData,
          swapPath: order.swapPath,
          initialCollateralAddress: order.initialCollateralTokenAddress,
          usdIn: convertTokenAmountToUsd(
            order.initialCollateralDeltaAmount,
            initialCollateralToken.decimals,
            initialCollateralToken.price.min,
          ),
          shouldApplyPriceImpact: true,
        })

        const priceImpactAmount = swapPathStats
          ? convertUsdToTokenAmount(
              swapPathStats.totalSwapPriceImpactDeltaUsd,
              targetCollateralToken.decimals,
              targetCollateralToken.price.min,
            )
          : 0n

        const swapFeeAmount = swapPathStats
          ? convertUsdToTokenAmount(
              swapPathStats.totalSwapFeeUsd,
              targetCollateralToken.decimals,
              targetCollateralToken.price.min,
            )
          : 0n

        const toAmount = order.minOutputAmount - priceImpactAmount + swapFeeAmount

        const triggerRatio = getTokensRatioByAmounts({
          fromToken: initialCollateralToken,
          toToken: targetCollateralToken,
          fromTokenAmount: order.initialCollateralDeltaAmount,
          toTokenAmount: toAmount,
        })

        const title = getSwapOrderTitle({
          initialCollateralToken,
          targetCollateralToken,
          minOutputAmount: order.minOutputAmount,
          initialCollateralAmount: order.initialCollateralDeltaAmount,
        })

        const orderInfo: SwapOrderInfo = {
          ...order,
          swapPathStats,
          triggerRatio,
          title,
          initialCollateralToken,
          targetCollateralToken,
        }

        ordersData.set(key, orderInfo)
      } else {
        const marketInfo = marketsData.get(order.marketAddress)
        const indexToken = marketInfo?.indexToken

        const initialCollateralToken = tokensData.get(order.initialCollateralTokenAddress)
        const {outTokenAddress} = getSwapPathOutputAddresses({
          marketsData,
          swapPath: order.swapPath,
          initialCollateralAddress: order.initialCollateralTokenAddress,
          isIncrease: isIncreaseOrderType(order.orderType),
        })

        if (!outTokenAddress) return

        const targetCollateralToken = tokensData.get(outTokenAddress)

        if (!marketInfo || !indexToken || !initialCollateralToken || !targetCollateralToken) {
          return
        }

        const title = getPositionOrderTitle({
          orderType: order.orderType,
          isLong: order.isLong,
          indexToken,
          sizeDeltaUsd: order.sizeDeltaUsd,
        })

        const acceptablePrice = parseContractPrice(
          order.contractAcceptablePrice,
          indexToken.decimals,
        )
        const triggerPrice = parseContractPrice(order.contractTriggerPrice, indexToken.decimals)

        const swapPathStats = getSwapPathStats({
          marketsData,
          swapPath: order.swapPath,
          initialCollateralAddress: order.initialCollateralTokenAddress,
          usdIn: convertTokenAmountToUsd(
            order.initialCollateralDeltaAmount,
            initialCollateralToken.decimals,
            initialCollateralToken.price.min,
          ),
          shouldApplyPriceImpact: true,
        })

        const triggerThresholdType = getTriggerThresholdType(order.orderType, order.isLong)

        const orderInfo: PositionOrderInfo = {
          ...order,
          title,
          swapPathStats,
          marketData: marketInfo,
          indexToken,
          initialCollateralToken,
          targetCollateralToken,
          acceptablePrice,
          triggerPrice,
          triggerThresholdType,
        }

        ordersData.set(key, orderInfo)
      }
    } catch (e) {
      logError(e)
      ordersData.delete(key)
    }
  })

  return ordersData
}
