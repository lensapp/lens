/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { storesAndApisCanBeCreatedInjectionToken } from "./can-be-created-token";
import { CustomResourceDefinitionApi } from "@k8slens/kube-api";
import { kubeApiInjectionToken } from "./token";
import { maybeKubeApiInjectable } from "./maybe-kube-api.injectable";
import { logErrorInjectionToken, logInfoInjectionToken, logWarningInjectionToken } from "@k8slens/logger";

export const customResourceDefinitionApiInjectable = getInjectable({
  id: "custom-resource-definition-api",
  instantiate: (di) => {
    assert(
      di.inject(storesAndApisCanBeCreatedInjectionToken),
      "customResourceDefinitionApi is only available in certain environments",
    );

    return new CustomResourceDefinitionApi({
      logError: di.inject(logErrorInjectionToken),
      logInfo: di.inject(logInfoInjectionToken),
      logWarn: di.inject(logWarningInjectionToken),
      maybeKubeApi: di.inject(maybeKubeApiInjectable),
    });
  },

  injectionToken: kubeApiInjectionToken,
});
