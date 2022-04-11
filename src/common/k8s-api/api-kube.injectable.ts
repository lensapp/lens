/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { apiKubePrefix, isDevelopment } from "../vars";
import { createStoresAndApisInjectionToken } from "./create-stores-apis.token";
import { KubeJsonApi } from "./kube-json-api";

const apiKubeInjectable = getInjectable({
  id: "api-kube",
  instantiate: (di) => {
    assert(di.inject(createStoresAndApisInjectionToken), "apiKube is only available in certain environments");

    return new KubeJsonApi({
      serverAddress: `http://127.0.0.1:${window.location.port}`,
      apiBase: apiKubePrefix,
      debug: isDevelopment,
    }, {
      headers: {
        "Host": window.location.host,
      },
    });
  },
});

export default apiKubeInjectable;
