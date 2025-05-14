import 'jotai-devtools/styles.css'

import {DevTools} from 'jotai-devtools'

export default memo(function JotaiDevTools() {
  return <DevTools isInitialOpen={false} />
})
