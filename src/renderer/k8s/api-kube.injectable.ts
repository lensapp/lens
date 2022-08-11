/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { onApiError } from "../api/on-api-error";
import { apiKubePrefix } from "../../common/vars";
import { apiKubeInjectionToken } from "../../common/k8s-api/api-kube";
import { storesAndApisCanBeCreatedInjectionToken } from "../../common/k8s-api/stores-apis-can-be-created.token";
import createKubeJsonApiInjectable from "../../common/k8s-api/create-kube-json-api.injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";

const apiKubeInjectable = getInjectable({
  id: "api-kube",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "apiKube is only available in certain environments");
    const createKubeJsonApi = di.inject(createKubeJsonApiInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);

    const apiKube = createKubeJsonApi({
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
