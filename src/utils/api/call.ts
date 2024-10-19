import axios from 'axios'
import jsonBig from 'json-bigint'

// TODO(auth): re-enable auth
// import isAuthenticated from '@/auth/isAuthenticated'
// import isAuthenticatedPubSubChannel from '@/auth/isAuthenticatedPubSubChannel'

const call = axios.create({
  adapter: 'fetch',
  transformResponse: data => {
    if (typeof data === 'string') {
      try {
        return jsonBig().parse(data)
      } catch {
        /* Ignore */
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- this is the default behavior
    return data
  },
})

call.interceptors.response.use(function (response) {
  // isAuthenticatedPubSubChannel.pub(isAuthenticated())
  return response
})

export default call
