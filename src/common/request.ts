import request from "request";
import requestPromise from "request-promise-native";
import { UserStore } from "./user-store";

// todo: get rid of "request" (deprecated)
// https://github.com/lensapp/lens/issues/459

function getDefaultRequestOpts(): Partial<request.Options> {
  const { httpsProxy, allowUntrustedCAs } = UserStore.getInstance().preferences;

  return {
    proxy: httpsProxy || undefined,
    rejectUnauthorized: !allowUntrustedCAs,
  };
}

/**
 * @deprecated
 */
export function customRequest(opts: request.Options) {
  return request.defaults(getDefaultRequestOpts())(opts);
}

/**
 * @deprecated
 */
export function customRequestPromise(opts: requestPromise.Options) {
  return requestPromise.defaults(getDefaultRequestOpts())(opts);
}
