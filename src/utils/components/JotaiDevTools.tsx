import 'jotai-devtools/styles.css'

import {DevTools} from 'jotai-devtools'
import {memo} from 'react'

export default memo(function JotaiDevTools() {
  return <DevTools isInitialOpen={false} />
})
