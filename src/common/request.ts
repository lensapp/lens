import * as request from "request"
import { userStore } from "../common/user-store"

export function globalRequestOpts(requestOpts: request.Options ) {
  const userPrefs = userStore.getPreferences()
  if (userPrefs.httpsProxy) {
    requestOpts.proxy = userPrefs.httpsProxy
  }
  requestOpts.rejectUnauthorized = !userPrefs.allowUntrustedCAs;

  return requestOpts
}
