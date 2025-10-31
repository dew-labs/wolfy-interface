import React from 'react'
import ReactDOM from 'react-dom'

import {MODE} from './constants/config'

if (MODE === 'development') {
  import('@axe-core/react')
    .then(({default: axe}) => {
      void axe(React, ReactDOM, 1000)
    })
    .catch(error => {
      console.log('Failed to load `@axe-core/react`')
      console.error(error)
    })
}
