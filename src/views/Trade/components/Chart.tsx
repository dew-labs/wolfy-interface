import {Card} from '@nextui-org/react'
import {useState} from 'react'
import type {Key} from 'react-aria-components'

import {Theme} from '@/lib/theme/theme.ts'
import {useCurrentTheme} from '@/lib/theme/useCurrentTheme.ts'
import {ChartInterval, isChartInterval} from '@/lib/tvchart/datafeed/Datafeed.ts'
import TVLightWeightChart from '@/views/Trade/components/TVChart/TVLightWeightChart.tsx'
import TVLightWeightTimeFrame from '@/views/Trade/components/TVChart/TVLightWeightTimeFrame.tsx'

export default function Chart() {
  const [currentTheme] = useCurrentTheme()
  const isDark = currentTheme === Theme.Dark
  const [chartInterval, setChartInterval] = useState(ChartInterval['5m'])

  function handleChartIntervalSelection(key: Key) {
    if (isChartInterval(key)) {
      setChartInterval(key)
    }
  }

  return (
    <Card className='my-4 p-2'>
      <div className='w-full flex-1'>
        <TVLightWeightTimeFrame
          selectedInterval={chartInterval}
          onSelectInterval={handleChartIntervalSelection}
        />
        <TVLightWeightChart
          textColor={isDark ? 'white' : 'black'}
          gridColor={isDark ? '#ffffff1a' : ''}
          interval={chartInterval}
        ></TVLightWeightChart>
      </div>
    </Card>
  )
}
