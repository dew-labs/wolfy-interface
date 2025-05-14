import jsonBig from 'json-bigint'
import queryString from 'query-string'
import {up} from 'up-fetch'

// TODO(auth): re-enable auth
// import isAuthenticated from '@/auth/isAuthenticated'
// import isAuthenticatedPubSubChannel from '@/auth/isAuthenticatedPubSubChannel'

// const call = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   adapter: 'fetch',
//   transformResponse: data => {
//     if (typeof data === 'string') {
//       try {
//         return jsonBig().parse(data)
//       } catch {
//         /* Ignore */
//       }
//     }
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- this is the default behavior
//     return data
//   },
// })

// call.interceptors.response.use(response => {
//   // isAuthenticatedPubSubChannel.pub(isAuthenticated())
//   return response
// })

// NOTE: this should be aligned with the API's parse options
const searchOptions: queryString.StringifyOptions = {
  arrayFormat: 'comma', // or none?
  skipNull: true,
  skipEmptyString: true,
}

async function parseResponse(response: Response) {
  const data = await response.text()

  try {
    return jsonBig().parse(data)
  } catch {
    /* Ignore */
  }

  return data
}

const call = up(fetch, () => ({
  baseUrl: import.meta.env.VITE_API_URL,
  serializeParams: params => queryString.stringify(params, searchOptions),
  parseResponse,
  parseReject: parseResponse,
  onSuccess: () => {
    // isAuthenticatedPubSubChannel.pub(isAuthenticated())
  },
  onError: () => {
    // isAuthenticatedPubSubChannel.pub(isAuthenticated())
  },
}))

export default call
