import {Tab, Tabs} from '@nextui-org/react'
import {memo, type MemoizedCallbackOrDispatch} from 'react'
import type {Key} from 'react-aria-components'

import {ChartInterval} from '@/lib/tvchart/chartdata/ChartData.ts'

export default memo(function TVLightWeightTimeFrame(props: {
  selectedInterval: ChartInterval
  onSelectInterval: MemoizedCallbackOrDispatch<(key: Key) => void>
}) {
  const availableTimeFrame = Object.values(ChartInterval)

  return (
    <div className='mb-2 flex'>
      <Tabs
        size='sm'
        variant='light'
        selectedKey={props.selectedInterval}
        onSelectionChange={props.onSelectInterval}
      >
        {availableTimeFrame.map(interval => {
          return <Tab key={interval} title={interval} />
        })}
      </Tabs>
    </div>
  )
})
