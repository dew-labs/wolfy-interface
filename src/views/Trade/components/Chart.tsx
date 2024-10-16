import {Card} from '@nextui-org/react'
import {type CreatePriceLineOptions, LineStyle} from 'lightweight-charts'
import {memo, useCallback, useMemo, useState} from 'react'
import type {Key} from 'react-aria-components'
import useLatest from 'react-use/lib/useLatest'

import {getTokensMetadata, MOCK_SYMBOL_MAP} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useOrders from '@/lib/trade/hooks/useOrders'
import useTokenPrices from '@/lib/trade/hooks/useTokenPrices'
import {USD_DECIMALS} from '@/lib/trade/numbers/constants'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import calculatePriceDecimals from '@/lib/trade/utils/price/calculatePriceDecimals'
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
  const tokenMetadata = getTokensMetadata(chainId)
  const asset = MOCK_SYMBOL_MAP[tokenMetadata.get(tokenAddress ?? '')?.symbol ?? '']
  const tokenPrices = useTokenPrices(data => data)
  const latestTokenPrices = useLatest(tokenPrices)

  const orders = useOrders()
  const ordersOfCurrentToken = useMemo(
    () => orders.filter(order => order.indexToken.address === tokenAddress),
    [orders, tokenAddress],
  )

  const lines: CreatePriceLineOptions[] = useMemo(
    () =>
      ordersOfCurrentToken.map(order => {
        const price = Number(shrinkDecimals(order.triggerPrice, USD_DECIMALS))
        const size = formatNumber(shrinkDecimals(order.sizeDeltaUsd, USD_DECIMALS), Format.USD, {
          fractionDigits: 2,
        })
        const displayDecimals = calculatePriceDecimals(
          latestTokenPrices.current?.get(order.initialCollateralToken.address)?.max ?? 0n,
          order.initialCollateralToken.decimals,
        )
        const collateral = formatNumber(
          shrinkDecimals(order.initialCollateralDeltaAmount, order.initialCollateralToken.decimals),
          Format.PLAIN,
          {
            exactFractionDigits: true,
            fractionDigits: displayDecimals,
          },
        )
        const collateralSymbol = order.initialCollateralToken.symbol

        return {
          price,
          color: order.isLong ? '#22c55e' : '#ef4444',
          lineWidth: 2 as const,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `${order.isLong ? 'LONG' : 'SHORT'} ${size} with ${collateral} ${collateralSymbol}`,
        }
      }),
    [ordersOfCurrentToken],
  )

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
