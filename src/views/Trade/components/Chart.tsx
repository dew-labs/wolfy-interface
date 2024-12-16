import {Card} from '@nextui-org/react'
import {LineStyle} from 'lightweight-charts'
import {memo, useCallback, useState} from 'react'
import type {Key} from 'react-aria-components'

import {getTokensMetadata, MOCK_SYMBOL_MAP} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useOrderInfosData from '@/lib/trade/hooks/useOrderInfosData'
import usePositionsInfoData from '@/lib/trade/hooks/usePositionsInfoData'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import isPositionOrder from '@/lib/trade/utils/order/type/isPositionOrder'
import calculateTokenFractionDigits from '@/lib/trade/utils/price/calculateTokenFractionDigits'
import {ChartInterval, isChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import useChartConfig from '@/lib/tvchart/configs/useChartConfigs.ts'
import {shrinkDecimals} from '@/utils/numbers/expandDecimals'
import formatNumber, {Format} from '@/utils/numbers/formatNumber'
import TVLightWeightChart, {Line} from '@/views/Trade/components/TVChart/TVLightWeightChart.tsx'
import TVLightWeightTimeFrame from '@/views/Trade/components/TVChart/TVLightWeightTimeFrame.tsx'

function useOrderKeysOfCurrentToken(tokenAddress: string | undefined) {
  return useOrderInfosData(
    useCallback(
      orders =>
        Array.from(orders.values())
          .filter(order => isPositionOrder(order) && order.indexToken.address === tokenAddress)
          .map(order => order.key),
      [tokenAddress],
    ),
  )
}

function usePositionKeysOfCurrentToken(tokenAddress: string | undefined) {
  return usePositionsInfoData(
    useCallback(
      positions =>
        Array.from(positions.positionsInfoViaStringRepresentation.values())
          .filter(position => position.marketData.indexTokenAddress === tokenAddress)
          .map(position => position.key),
      [tokenAddress],
    ),
  )
}

function OrderLine({orderKey}: {orderKey: string}) {
  const {data: order} = useOrderInfosData(useCallback(data => data.get(orderKey), [orderKey]))
  const {data: initialCollateralTokenPrice} = useTokenPrices(
    useCallback(
      data => {
        if (!order || !isPositionOrder(order)) return null
        return data.get(order.initialCollateralToken.address)
      },
      [order],
    ),
  )

  if (!order) return null
  if (!isPositionOrder(order)) return null

  const price = Number(shrinkDecimals(order.triggerPrice, USD_DECIMALS))
  const size = formatNumber(shrinkDecimals(order.sizeDeltaUsd, USD_DECIMALS), Format.USD, {
    fractionDigits: 2,
  })
  const collateralFractionDigits = calculateTokenFractionDigits(
    initialCollateralTokenPrice?.max ?? 0n,
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

  return (
    <Line
      // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop -- not needed
      options={{
        price,
        color: order.isLong ? '#22c55e' : '#ef4444',
        lineWidth: 1 as const,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `OPEN ${order.isLong ? 'LONG' : 'SHORT'} ${size} with ${collateral} ${collateralSymbol}`,
      }}
    />
  )
}

function PositionLine({positionKey}: {positionKey: bigint}) {
  const {data: position} = usePositionsInfoData(
    useCallback(data => data.positionsInfo.get(positionKey), [positionKey]),
  )

  const {data: collateralTokenPrice} = useTokenPrices(
    useCallback(
      data => {
        if (!position) return null
        return data.get(position.collateralTokenAddress)
      },
      [position],
    ),
  )

  if (!position) return null

  const price = Number(shrinkDecimals(position.entryPrice, USD_DECIMALS))
  const size = formatNumber(shrinkDecimals(position.sizeInUsd, USD_DECIMALS), Format.USD, {
    fractionDigits: 2,
  })
  const collateralFractionDigits = calculateTokenFractionDigits(collateralTokenPrice?.max ?? 0n)

  const collateral = formatNumber(
    shrinkDecimals(position.collateralAmount, position.collateralToken.decimals),
    Format.PLAIN,
    {
      exactFractionDigits: true,
      fractionDigits: collateralFractionDigits,
    },
  )

  const collateralSymbol = position.collateralToken.symbol

  const pnl = formatNumber(shrinkDecimals(position.pnlAfterFees, USD_DECIMALS), Format.USD_SIGNED, {
    fractionDigits: 2,
  })

  const isProfit = position.pnlAfterFees >= 0n

  return (
    <Line
      // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop -- not needed
      options={{
        price,
        color: position.isLong ? '#22c55e' : '#ef4444',
        lineWidth: 2 as const,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        axisLabelColor: isProfit ? '#22c55e' : '#ef4444',
        title: `${position.isLong ? 'LONGING' : 'SHORTING'} ${size} with ${collateral} ${collateralSymbol}: ${pnl}`,
      }}
    />
  )
}

const OrderLines = memo(function Lines() {
  const [tokenAddress] = useTokenAddress()
  // TODO: investigate why the component still re-renders even if orderKeysOfCurrentToken is not changed
  const {data: orderKeysOfCurrentToken} = useOrderKeysOfCurrentToken(tokenAddress)

  // console.log('orderKeysOfCurrentToken', orderKeysOfCurrentToken)

  return orderKeysOfCurrentToken?.map(orderKey => <OrderLine key={orderKey} orderKey={orderKey} />)
})

const PositionLines = memo(function Lines() {
  const [tokenAddress] = useTokenAddress()
  // TODO: investigate why the component still re-renders even if positionKeysOfCurrentToken is not changed
  const {data: positionKeysOfCurrentToken} = usePositionKeysOfCurrentToken(tokenAddress)

  // console.log('positionKeysOfCurrentToken', positionKeysOfCurrentToken)

  return positionKeysOfCurrentToken?.map(positionKey => (
    <PositionLine key={positionKey} positionKey={positionKey} />
  ))
})

export default memo(function Chart() {
  const [chainId] = useChainId()
  const chartConfigs = useChartConfig()
  const [chartInterval, setChartInterval] = useState(ChartInterval['1h'])
  const [tokenAddress] = useTokenAddress()
  const tokenSymbol = getTokensMetadata(chainId).get(tokenAddress ?? '')?.symbol
  const asset = tokenSymbol ? MOCK_SYMBOL_MAP[tokenSymbol] : undefined

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
            textColor={chartConfigs.textColor}
            gridColor={chartConfigs.gridColor}
            interval={chartInterval}
          >
            <OrderLines />
            <PositionLines />
          </TVLightWeightChart>
        )}
      </div>
    </Card>
  )
})
