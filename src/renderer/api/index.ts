import { JsonApi, JsonApiErrorParsed } from "./json-api";
import { KubeJsonApi } from "./kube-json-api";
import { Notifications } from "../components/notifications";
import { apiKubePrefix, apiPrefix, isDebugging, isDevelopment } from "../../common/vars";

export const apiBase = new JsonApi({
  apiBase: apiPrefix,
  debug: isDevelopment || isDebugging,
});
export const apiKube = new KubeJsonApi({
  apiBase: apiKubePrefix,
  debug: isDevelopment,
});

// Common handler for HTTP api errors
export function onApiError(error: JsonApiErrorParsed, res: Response) {
  switch (res.status) {
    case 403:
      error.isUsedForNotification = true;
      Notifications.error(error);
      break;
  }
}

apiBase.onError.addListener(onApiError);
apiKube.onError.addListener(onApiError);
