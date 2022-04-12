/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { onApiError } from "../api/on-api-error";
import { apiKubePrefix, isDevelopment } from "../../common/vars";
import { apiKubeInjectionToken } from "../../common/k8s-api/api-kube";
import { createStoresAndApisInjectionToken } from "../../common/k8s-api/create-stores-apis.token";
import { KubeJsonApi } from "../../common/k8s-api/kube-json-api";

const apiKubeInjectable = getInjectable({
  id: "api-kube",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "apiKube is only available in certain environments");

    const apiKube = new KubeJsonApi({
      serverAddress: `http://127.0.0.1:${window.location.port}`,
      apiBase: apiKubePrefix,
      debug: isDevelopment,
    }, {
      headers: {
        "Host": window.location.host,
      },
    });

    apiKube.onError.addListener(onApiError);

    return apiKube;
  },
  injectionToken: apiKubeInjectionToken,
});

export default apiKubeInjectable;
