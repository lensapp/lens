/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { EndpointsApi } from "./endpoint.api";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";
import { loggerInjectable } from "@k8slens/logger";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";

const endpointsApiInjectable = getInjectable({
  id: "endpoints-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "endpointsApi is only available in certain environments");

    return new EndpointsApi({
      logger: di.inject(loggerInjectable),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    });
  },

  injectionToken: kubeApiInjectionToken,
});

export default endpointsApiInjectable;
