/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "../stores-apis-can-be-created.token";
import { PodMetricsApi } from "./pod-metrics.api";
import loggerInjectable from "../../logger.injectable";
import maybeKubeApiInjectable from "../maybe-kube-api.injectable";
import { podMetricsApiInjectionToken } from "./pod-metrics-api-injection-token";


const podMetricsApiInjectable = getInjectable({
  id: "pod-metrics-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "podMetricsApi is only available in certain environments");

    return new PodMetricsApi({
      logger: di.inject(loggerInjectable),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    });
  },
  injectionToken: podMetricsApiInjectionToken,
});

export default podMetricsApiInjectable;
