import type {StarknetChainId} from 'satoru-sdk'

import {getTokensMetadata, type Token} from '@/constants/tokens'
import type {MarketData, MarketsData} from '@/lib/trade/services/fetchMarketsData'
import type {Order, OrdersData} from '@/lib/trade/services/fetchOrders'
import type {Price, TokenPricesData} from '@/lib/trade/services/fetchTokenPrices'
import convertTokenAmountToUsd from '@/lib/trade/utils/price/convertTokenAmountToUsd'
import convertUsdToTokenAmount from '@/lib/trade/utils/price/convertUsdToTokenAmount'
import getTokensRatioByAmounts, {
  type TokensRatio,
} from '@/lib/trade/utils/token/getTokensRatioByAmounts'
import parseContractPrice from '@/lib/trade/utils/token/parseContractPrice'
import {logError} from '@/utils/logger'

import getTriggerThresholdType, {type TriggerThresholdType} from './getTriggerThresholdType'
import getSwapOrderTitle from './swap/getSwapOrderTitle'
import getSwapPathOutputAddresses from './swap/getSwapPathOutputAddresses'
import getSwapPathStats, {type SwapPathStats} from './swap/getSwapPathStats'
import {isIncreaseOrderType} from './type/isIncreaseOrderType'
import {isMarketOrderType} from './type/isMarketOrderType'
import isSwapOrderType from './type/isSwapOrderType'

export type SwapOrderInfo = Order & {
  title: string
  swapPathStats?: SwapPathStats | undefined
  triggerRatio?: TokensRatio
  initialCollateralToken: Token
  targetCollateralToken: Token
}

export type PositionOrderInfo = Order & {
  marketData: MarketData
  swapPathStats?: SwapPathStats | undefined
  indexToken: Token
  indexTokenPrice?: Price | undefined
  initialCollateralToken: Token
  initialCollateralTokenPrice?: Price | undefined
  targetCollateralToken: Token
  targetCollateralTokenPrice?: Price | undefined
  acceptablePrice: bigint
  triggerPrice: bigint
  triggerThresholdType: TriggerThresholdType
}

export default function getOrdersInfo(
  chainId: StarknetChainId,
  marketsData: MarketsData,
  ordersData: OrdersData,
  tokenPricesData: TokenPricesData,
) {
  const tokensMetadata = getTokensMetadata(chainId)

  const newOrdersData = new Map<string, SwapOrderInfo | PositionOrderInfo>()

  ordersData.forEach((order, key) => {
    try {
      // Market orders should be executed right away, don't need to display them
      if (isMarketOrderType(order.orderType)) return

      const market = marketsData.get(order.marketAddress)
      const indexToken = market?.indexToken
      const indexTokenPrice = tokenPricesData.get(indexToken?.address ?? '')

      const initialCollateralToken = tokensMetadata.get(order.initialCollateralTokenAddress)
      const initialCollateralTokenPrice = tokenPricesData.get(order.initialCollateralTokenAddress)

      if (!initialCollateralToken || !initialCollateralTokenPrice) return

      if (isSwapOrderType(order.orderType)) {
        const {outTokenAddress} = getSwapPathOutputAddresses({
          marketsData,
          swapPath: order.swapPath,
          initialCollateralAddress: order.initialCollateralTokenAddress,
          isIncrease: false,
        })

        if (!outTokenAddress) return

        const targetCollateralToken = tokensMetadata.get(outTokenAddress)
        const targetCollateralTokenPrice = tokenPricesData.get(outTokenAddress)

        if (!targetCollateralToken || !targetCollateralTokenPrice) {
          return
        }

        const swapPathStats = getSwapPathStats({
          marketsData,
          tokenPricesData,
          swapPath: order.swapPath,
          initialCollateralAddress: order.initialCollateralTokenAddress,
          usdIn: convertTokenAmountToUsd(
            order.initialCollateralDeltaAmount,
            initialCollateralToken.decimals,
            initialCollateralTokenPrice.min,
          ),
          shouldApplyPriceImpact: true,
        })

        const priceImpactAmount = swapPathStats
          ? convertUsdToTokenAmount(
              swapPathStats.totalSwapPriceImpactDeltaUsd,
              targetCollateralToken.decimals,
              targetCollateralTokenPrice.min,
            )
          : 0n

        const swapFeeAmount = swapPathStats
          ? convertUsdToTokenAmount(
              swapPathStats.totalSwapFeeUsd,
              targetCollateralToken.decimals,
              targetCollateralTokenPrice.min,
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

        newOrdersData.set(key, orderInfo)
        return
      }

      const {outTokenAddress} = getSwapPathOutputAddresses({
        marketsData,
        swapPath: order.swapPath,
        initialCollateralAddress: order.initialCollateralTokenAddress,
        isIncrease: isIncreaseOrderType(order.orderType),
      })

      if (!outTokenAddress) return

      const targetCollateralToken = tokensMetadata.get(outTokenAddress)
      const targetCollateralTokenPrice = tokenPricesData.get(outTokenAddress)
      if (!market || !indexToken || !targetCollateralToken) {
        return
      }

      const acceptablePrice = parseContractPrice(order.contractAcceptablePrice, indexToken.decimals)
      const triggerPrice = parseContractPrice(order.contractTriggerPrice, indexToken.decimals)

      const swapPathStats = getSwapPathStats({
        marketsData,
        tokenPricesData,
        swapPath: order.swapPath,
        initialCollateralAddress: order.initialCollateralTokenAddress,
        usdIn: convertTokenAmountToUsd(
          order.initialCollateralDeltaAmount,
          initialCollateralToken.decimals,
          initialCollateralTokenPrice.min,
        ),
        shouldApplyPriceImpact: true,
      })

      const triggerThresholdType = getTriggerThresholdType(order.orderType, order.isLong)

      const orderInfo: PositionOrderInfo = {
        ...order,
        // title,
        swapPathStats,
        marketData: market,
        indexToken,
        indexTokenPrice,
        initialCollateralToken,
        initialCollateralTokenPrice,
        targetCollateralToken,
        targetCollateralTokenPrice,
        acceptablePrice,
        triggerPrice,
        triggerThresholdType,
      }

      newOrdersData.set(key, orderInfo)
    } catch (e) {
      logError(e)
    }
  })

  return newOrdersData
}
