import {createHead as createUnhead} from '@unhead/react/client'
import {AliasSortingPlugin, InferSeoMetaPlugin, TemplateParamsPlugin} from 'unhead/plugins'

export default function createHead() {
  return createUnhead({
    plugins: [TemplateParamsPlugin, AliasSortingPlugin, InferSeoMetaPlugin()],
  })
}
