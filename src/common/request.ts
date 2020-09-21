import request from "request"
import requestPromise from "request-promise-native"
import { userStore } from "./user-store"

// todo: get rid of "request" (deprecated)
// https://github.com/lensapp/lens/issues/459

function getDefaultRequestOpts(): Partial<request.Options> {
  const { httpsProxy, allowUntrustedCAs } = userStore.preferences
  return {
    proxy: httpsProxy || undefined,
    rejectUnauthorized: !allowUntrustedCAs,
  }
}

// export function globalRequestOpts(requestOpts: request.Options ) {
//   const userPrefs = userStore.getPreferences()
//   if (userPrefs.httpsProxy) {
//     requestOpts.proxy = userPrefs.httpsProxy
//   }
//   requestOpts.rejectUnauthorized = !userPrefs.allowUntrustedCAs;

//   return requestOpts
// }

/**
 * @deprecated
 */
export function customRequest(opts: request.Options) {
  return request.defaults(getDefaultRequestOpts())(opts)
}

/**
 * @deprecated
 */
export function customRequestPromise(opts: requestPromise.Options) {
  return requestPromise.defaults(getDefaultRequestOpts())(opts)
}
