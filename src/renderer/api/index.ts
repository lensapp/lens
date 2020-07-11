import { JsonApi, JsonApiErrorParsed } from "./json-api";
import { KubeJsonApi } from "./kube-json-api";
import { Notifications } from "../components/notifications";
import { apiKubePrefix, apiPrefix, isDevelopment } from "../../common/vars";

export const apiBase = new JsonApi({
  debug: isDevelopment,
  apiPrefix: apiPrefix,
});
export const apiKube = new KubeJsonApi({
  debug: isDevelopment,
  apiPrefix: apiKubePrefix,
});

// Common handler for HTTP api errors
function onApiError(error: JsonApiErrorParsed, res: Response) {
  switch (res.status) {
  case 403:
    error.isUsedForNotification = true;
    Notifications.error(error);
    break;
  }
}

apiBase.onError.addListener(onApiError);
apiKube.onError.addListener(onApiError);
