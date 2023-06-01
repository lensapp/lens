/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "./can-be-created-token";
import { JobApi } from "@k8slens/kube-api";
import { kubeApiInjectionToken } from "./token";
import { logErrorInjectionToken, logInfoInjectionToken, logWarningInjectionToken } from "@k8slens/logger";
import { maybeKubeApiInjectable } from "./maybe-kube-api.injectable";

export const jobApiInjectable = getInjectable({
  id: "job-api",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "jobApi is only available in certain environments");

    return new JobApi(
      {
        logError: di.inject(logErrorInjectionToken),
        logInfo: di.inject(logInfoInjectionToken),
        logWarn: di.inject(logWarningInjectionToken),
        maybeKubeApi: di.inject(maybeKubeApiInjectable),
      },
      {
        checkPreferredVersion: true,
      },
    );
  },

  injectionToken: kubeApiInjectionToken,
});
