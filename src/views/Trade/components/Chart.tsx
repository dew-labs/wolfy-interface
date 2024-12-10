import {Card} from '@nextui-org/react'
import {type CreatePriceLineOptions, LineStyle} from 'lightweight-charts'
import {memo, useCallback, useMemo, useState} from 'react'
import type {Key} from 'react-aria-components'
import useLatest from 'react-use/lib/useLatest'

import {getTokensMetadata, MOCK_SYMBOL_MAP} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useOrders from '@/lib/trade/hooks/useOrders'
import usePositionsInfoData from '@/lib/trade/hooks/usePositionsInfoData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import isPositionOrder from '@/lib/trade/utils/order/type/isPositionOrder'
import type {PositionsInfoData} from '@/lib/trade/utils/position/getPositionsInfo'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import {ChartInterval, isChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import useChartConfig from '@/lib/tvchart/configs/useChartConfigs.ts'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import TVLightWeightChart from '@/views/Trade/components/TVChart/TVLightWeightChart.tsx'
import TVLightWeightTimeFrame from '@/views/Trade/components/TVChart/TVLightWeightTimeFrame.tsx'

export default memo(function Chart() {
  const [chainId] = useChainId()
  const chartConfigs = useChartConfig()
  const [chartInterval, setChartInterval] = useState(ChartInterval['1h'])
  const [tokenAddress] = useTokenAddress()
  const tokenSymbol = getTokensMetadata(chainId).get(tokenAddress ?? '')?.symbol
  const asset = tokenSymbol ? MOCK_SYMBOL_MAP[tokenSymbol] : undefined
  //TODO: optimize, do not subscribe to entire token prices
  const {data: tokenPrices = new Map()} = useTokenPrices()
  const latestTokenPrices = useLatest(tokenPrices)

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: ordersOfCurrentToken = []} = useOrders(orders =>
    orders.filter(isPositionOrder).filter(order => order.indexToken.address === tokenAddress),
  )

  // TODO: optimize, extract this query to a single function to avoid closure memory leak
  const {data: positionOfCurrentToken = []} = usePositionsInfoData(
    (positions: PositionsInfoData) => {
      return Array.from(positions.positionsInfoViaStringRepresentation.values()).filter(
        position => position.marketData.indexTokenAddress === tokenAddress,
      )
    },
  )

  const lines = useMemo(() => {
    const lines: CreatePriceLineOptions[] = []

    ordersOfCurrentToken.forEach(order => {
      const price = Number(shrinkDecimals(order.triggerPrice, USD_DECIMALS))
      const size = formatNumber(shrinkDecimals(order.sizeDeltaUsd, USD_DECIMALS), Format.USD, {
        fractionDigits: 2,
      })
      const collateralFractionDigits = calculateTokenFractionDigits(
        latestTokenPrices.current.get(order.initialCollateralToken.address)?.max ?? 0n,
      )

      const collateral = formatNumber(
        shrinkDecimals(order.initialCollateralDeltaAmount, order.initialCollateralToken.decimals),
        Format.PLAIN,
        {
          exactFractionDigits: true,
          fractionDigits: collateralFractionDigits,
        },
      )
      const collateralSymbol = order.initialCollateralToken.symbol

      lines.push({
        price,
        color: order.isLong ? '#22c55e' : '#ef4444',
        lineWidth: 1 as const,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `OPEN ${order.isLong ? 'LONG' : 'SHORT'} ${size} with ${collateral} ${collateralSymbol}`,
      })
    })

    positionOfCurrentToken.forEach(position => {
      if (!position.entryPrice) return
      const price = Number(shrinkDecimals(position.entryPrice, USD_DECIMALS))
      const size = formatNumber(shrinkDecimals(position.sizeInUsd, USD_DECIMALS), Format.USD, {
        fractionDigits: 2,
      })
      const collateralFractionDigits = calculateTokenFractionDigits(
        latestTokenPrices.current.get(position.collateralTokenAddress)?.max ?? 0n,
      )

      const collateral = formatNumber(
        shrinkDecimals(position.collateralAmount, position.collateralToken.decimals),
        Format.PLAIN,
        {
          exactFractionDigits: true,
          fractionDigits: collateralFractionDigits,
        },
      )

      const collateralSymbol = position.collateralToken.symbol

      const pnl = formatNumber(
        shrinkDecimals(position.pnlAfterFees, USD_DECIMALS),
        Format.USD_SIGNED,
        {
          fractionDigits: 2,
        },
      )

      const isProfit = position.pnlAfterFees >= 0n

      lines.push({
        price,
        color: position.isLong ? '#22c55e' : '#ef4444',
        lineWidth: 2 as const,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        axisLabelColor: isProfit ? '#22c55e' : '#ef4444',
        title: `${position.isLong ? 'LONGING' : 'SHORTING'} ${size} with ${collateral} ${collateralSymbol}: ${pnl}`,
      })
    })

    return lines
  }, [ordersOfCurrentToken, positionOfCurrentToken])

  const handleChartIntervalSelection = useCallback((key: Key) => {
    if (isChartInterval(key)) {
      setChartInterval(key)
    }
  }, [])

  return (
    <Card className='mt-4 p-2'>
      <div className='w-full'>
        <TVLightWeightTimeFrame
          selectedInterval={chartInterval}
          onSelectInterval={handleChartIntervalSelection}
        />
        {asset && (
          <TVLightWeightChart
            asset={asset}
            lines={lines}
            textColor={chartConfigs.textColor}
            gridColor={chartConfigs.gridColor}
            interval={chartInterval}
          />
        )}
      </div>
    </Card>
  )
})
