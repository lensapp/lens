import { JsonApi, JsonApiErrorParsed } from "./json-api";
import { KubeJsonApi } from "./kube-json-api";
import { Notifications } from "../components/notifications";
import { apiPrefix, isDevelopment } from "../../common/vars";

//-- JSON HTTP APIS

export const apiBase = new JsonApi({
  debug: isDevelopment,
  apiPrefix: apiPrefix.BASE,
});
export const apiKube = new KubeJsonApi({
  debug: isDevelopment,
  apiPrefix: apiPrefix.KUBE_BASE,
});
export const apiKubeUsers = new KubeJsonApi({
  debug: isDevelopment,
  apiPrefix: apiPrefix.KUBE_USERS,
});
export const apiKubeHelm = new KubeJsonApi({
  debug: isDevelopment,
  apiPrefix: apiPrefix.KUBE_HELM,
});
export const apiKubeResourceApplier = new KubeJsonApi({
  debug: isDevelopment,
  apiPrefix: apiPrefix.KUBE_RESOURCE_APPLIER,
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
apiKubeUsers.onError.addListener(onApiError);
apiKubeHelm.onError.addListener(onApiError);
apiKubeResourceApplier.onError.addListener(onApiError);
