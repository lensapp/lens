import request from "request"
import { userStore } from "./user-store"

export function globalRequestOpts(requestOpts: request.Options) {
  const { httpsProxy, allowUntrustedCAs } = userStore.preferences
  if (httpsProxy) {
    requestOpts.proxy = httpsProxy
  }
  requestOpts.rejectUnauthorized = !allowUntrustedCAs;
  return requestOpts
}
