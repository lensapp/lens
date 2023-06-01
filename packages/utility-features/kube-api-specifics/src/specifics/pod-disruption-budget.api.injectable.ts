/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "./can-be-created-token";
import { PodDisruptionBudgetApi } from "@k8slens/kube-api";
import { kubeApiInjectionToken } from "./token";
import { logErrorInjectionToken, logInfoInjectionToken, logWarningInjectionToken } from "@k8slens/logger";
import { maybeKubeApiInjectable } from "./maybe-kube-api.injectable";

export const podDisruptionBudgetApiInjectable = getInjectable({
  id: "pod-disruption-budget-api",
  instantiate: (di) => {
    assert(
      di.inject(storesAndApisCanBeCreatedInjectionToken),
      "podDisruptionBudgetApi is only available in certain environments",
    );

    return new PodDisruptionBudgetApi(
      {
        logError: di.inject(logErrorInjectionToken),
        logInfo: di.inject(logInfoInjectionToken),
        logWarn: di.inject(logWarningInjectionToken),
        maybeKubeApi: di.inject(maybeKubeApiInjectable),
      },
      {
        checkPreferredVersion: true,
        allowedUsableVersions: {
          policy: ["v1", "v1beta1"],
        },
      },
    );
  },

  injectionToken: kubeApiInjectionToken,
});
