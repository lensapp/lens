/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getKubeStoreInjectable } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { ValidatingWebhookConfigurationStore } from "./validating-webhook-configuration-store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import validatingWebhookConfigurationApiInjectable
  from "../../../common/k8s-api/endpoints/validating-webhook-configuration-api.injectable";

const validatingWebhookConfigurationStoreInjectable = getKubeStoreInjectable({
  id: "validating-webhook-configuration-store",
  instantiate: (di) => {
    const api = di.inject(validatingWebhookConfigurationApiInjectable);

    return new ValidatingWebhookConfigurationStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
});

export default validatingWebhookConfigurationStoreInjectable;
