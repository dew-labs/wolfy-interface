import {useHead} from '@unhead/react'

import {TITLE} from '@/constants/config'

const HeadTags = function (props: Parameters<typeof useHead>[0]) {
  useHead({
    ...props,
    titleTemplate: '%s %separator %siteName',
    templateParams: {
      separator: '—',
      siteName: TITLE,
    },
  })

  return null
}

export default memo(HeadTags)
