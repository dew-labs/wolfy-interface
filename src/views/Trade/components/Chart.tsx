import {Card} from '@nextui-org/react'
import {memo, useCallback, useState} from 'react'
import type {Key} from 'react-aria-components'

import {ChartInterval, isChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'
import useChartConfig from '@/lib/tvchart/configs/useChartConfigs.ts'
import TVLightWeightChart from '@/views/Trade/components/TVChart/TVLightWeightChart.tsx'
import TVLightWeightTimeFrame from '@/views/Trade/components/TVChart/TVLightWeightTimeFrame.tsx'

export default memo(function Chart() {
  const chartConfigs = useChartConfig()
  const [chartInterval, setChartInterval] = useState(ChartInterval['5m'])

  const handleChartIntervalSelection = useCallback((key: Key) => {
    if (isChartInterval(key)) {
      setChartInterval(key)
    }
  }, [])

  return (
    <Card className='my-4 p-2'>
      <div className='w-full'>
        <TVLightWeightTimeFrame
          selectedInterval={chartInterval}
          onSelectInterval={handleChartIntervalSelection}
        />
        <TVLightWeightChart
          textColor={chartConfigs.textColor}
          gridColor={chartConfigs.gridColor}
          interval={chartInterval}
        />
      </div>
    </Card>
  )
})
