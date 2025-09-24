import React from 'react'
import ReactDOM from 'react-dom'

import {MODE} from './constants/config'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, sonarjs/different-types-comparison -- we are checking if window is undefined
if (MODE === 'development' && globalThis.document !== undefined) {
  import('@axe-core/react')
    .then(({default: axe}) => {
      void axe(React, ReactDOM, 1000)
    })
    .catch(error => {
      console.log('Failed to load `@axe-core/react`')
      console.error(error)
    })
}
