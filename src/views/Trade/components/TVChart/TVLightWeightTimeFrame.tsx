import {Tab, Tabs} from '@heroui/react'
import {type Key} from '@react-types/shared'

import {ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'

interface Props {
  selectedInterval: ChartInterval
  onSelectInterval: MemoizedCallbackOrDispatch<Key>
}

export default memo(function TVLightWeightTimeFrame({selectedInterval, onSelectInterval}: Props) {
  const availableTimeFrame = Object.values(ChartInterval)

  return (
    <div className='mb-2 flex'>
      <Tabs
        size='sm'
        variant='light'
        selectedKey={selectedInterval}
        onSelectionChange={onSelectInterval}
      >
        {availableTimeFrame.map(interval => {
          return <Tab key={interval} title={interval} />
        })}
      </Tabs>
    </div>
  )
})
