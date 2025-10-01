import {useSeoMeta} from '@unhead/react'

import {TITLE} from '@/constants/config'

const HeadTags = function (
  props: Omit<Exclude<Parameters<typeof useSeoMeta>[0], undefined>, 'titleTemplate'>,
) {
  useSeoMeta({
    ...props,
    titleTemplate: (title?: string) => `${title} - ${TITLE}`,
  })

  return null
}

export default memo(HeadTags)
