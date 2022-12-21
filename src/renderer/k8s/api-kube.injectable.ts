/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { apiKubePrefix } from "../../common/vars";
import { apiKubeInjectionToken } from "../../common/k8s-api/api-kube";
import { storesAndApisCanBeCreatedInjectionToken } from "../../common/k8s-api/stores-apis-can-be-created.token";
import createKubeJsonApiInjectable from "../../common/k8s-api/create-kube-json-api.injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import showErrorNotificationInjectable from "../components/notifications/show-error-notification.injectable";
import { lensAuthenticationHeaderValueInjectionToken } from "../../common/auth/header-value";
import { lensAuthenticationHeader, lensClusterIdHeader } from "../../common/vars/auth-header";
import hostedClusterIdInjectable from "../cluster-frame-context/hosted-cluster-id.injectable";
import lensProxyPortInjectable from "../../features/lens-proxy/common/port.injectable";
import lensAuthenticatedAgentInjectable from "../../features/lens-proxy/common/lens-auth-agent.injectable";

const apiKubeInjectable = getInjectable({
  id: "api-kube",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "apiKube is only available in certain environments");
    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const lensAuthenticationHeaderValue = di.inject(lensAuthenticationHeaderValueInjectionToken);
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const lensAuthenticatedAgent = di.inject(lensAuthenticatedAgentInjectable);

    assert(hostedClusterId);

    const apiKube = createKubeJsonApi({
      serverAddress: `https://127.0.0.1:${lensProxyPort.get()}`,
      apiBase: apiKubePrefix,
      debug: isDevelopment,
    }, {
      headers: {
        [lensAuthenticationHeader]: `Bearer ${lensAuthenticationHeaderValue}`,
        [lensClusterIdHeader]: hostedClusterId,
      },
      agent: lensAuthenticatedAgent,
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
