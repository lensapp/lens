import * as request from "request"
import { UserStore } from "../common/user-store"

export function globalRequestOpts(requestOpts: request.Options ) {
  const userPrefs = UserStore.getInstance().getPreferences()
  if (userPrefs.httpsProxy) {
    requestOpts.proxy = userPrefs.httpsProxy
  }
  requestOpts.rejectUnauthorized = !userPrefs.allowUntrustedCAs;

  return requestOpts
}
