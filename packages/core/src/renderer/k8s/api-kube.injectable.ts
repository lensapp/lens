/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { apiKubePrefix } from "../../common/vars";
import { apiKubeInjectionToken } from "../../common/k8s-api/api-kube";
import { storesAndApisCanBeCreatedInjectionToken } from "../../common/k8s-api/stores-apis-can-be-created.token";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import showErrorNotificationInjectable from "../components/notifications/show-error-notification.injectable";
import windowLocationInjectable from "../../common/k8s-api/window-location.injectable";
import { KubeJsonApi } from "../../common/k8s-api/kube-json-api";
import lensFetchInjectable from "../../features/lens-fetch/common/lens-fetch.injectable";
import loggerInjectable from "../../common/logger.injectable";
import { usingLensFetch } from "../../common/k8s-api/json-api";

const apiKubeInjectable = getInjectable({
  id: "api-kube",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "apiKube is only available in certain environments");
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const { host } = di.inject(windowLocationInjectable);

    const apiKube = new KubeJsonApi({
      fetch: di.inject(lensFetchInjectable),
      logger: di.inject(loggerInjectable),
    }, {
      serverAddress: usingLensFetch,
      apiBase: apiKubePrefix,
      debug: isDevelopment,
    }, {
      headers: {
        "Host": host,
      },
    });

    apiKube.onError.addListener((error, res) => {
      switch (res.status) {
        case 403:
          error.isUsedForNotification = true;
          showErrorNotification(error);
          break;
      }
    });

    return apiKube;
  },
  injectionToken: apiKubeInjectionToken,
});

export default apiKubeInjectable;
