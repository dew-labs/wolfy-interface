import {InferSeoMetaPlugin} from '@unhead/addons'
import {renderDOMHead} from '@unhead/dom'
import {CapoPlugin, createHead} from 'unhead'

import {TITLE} from '@/constants/config'

let pauseDOMUpdates = true

const head: ReturnType<typeof createHead> = createHead({
  plugins: [InferSeoMetaPlugin({ogTitle: title => title.replace(TITLE, '')}), CapoPlugin({})],
})

// TODO: pause dom update in router https://unhead.unjs.io/plugins/recipes/pausing-dom-rendering
head.hooks.hook('dom:beforeRender', context => {
  context.shouldRender = !pauseDOMUpdates
})

export default memo(function Head() {
  useEffect(() => {
    pauseDOMUpdates = false
    renderDOMHead(head).catch(() => {
      /* empty */
    })
  }, [])

  return null
})
