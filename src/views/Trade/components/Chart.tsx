import {Card} from '@nextui-org/react'
import {memo, useCallback, useState} from 'react'
import type {Key} from 'react-aria-components'

import {getTokensMetadata} from '@/constants/tokens'
import useChainId from '@/lib/starknet/hooks/useChainId'
import useTokenAddress from '@/lib/trade/states/useTokenAddress'
import {ChartInterval, isChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import useChartConfig from '@/lib/tvchart/configs/useChartConfigs.ts'
import TVLightWeightChart from '@/views/Trade/components/TVChart/TVLightWeightChart.tsx'
import TVLightWeightTimeFrame from '@/views/Trade/components/TVChart/TVLightWeightTimeFrame.tsx'

const MOCK_SYMBOL_MAP: Record<string, string> = {
  wfETH: 'eth',
  wfBTC: 'btc',
  wfSTRK: 'strk',
}

export default memo(function Chart() {
  const [chainId] = useChainId()
  const chartConfigs = useChartConfig()
  const [chartInterval, setChartInterval] = useState(ChartInterval['5m'])
  const [tokenAddress] = useTokenAddress()
  const tokenMetadata = getTokensMetadata(chainId)
  const asset = MOCK_SYMBOL_MAP[tokenMetadata.get(tokenAddress ?? '')?.symbol ?? '']

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
          />
        )}
      </div>
    </Card>
  )
})
