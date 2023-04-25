/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { ValidatingWebhookConfigurationStore } from "./validating-webhook-configuration-store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectable } from "@k8slens/logging";
import validatingWebhookConfigurationApiInjectable
  from "../../../common/k8s-api/endpoints/validating-webhook-configuration-api.injectable";

const validatingWebhookConfigurationStoreInjectable = getInjectable({
  id: "validating-webhook-configuration-store",
  instantiate: (di) => {
    const api = di.inject(validatingWebhookConfigurationApiInjectable);

    return new ValidatingWebhookConfigurationStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default validatingWebhookConfigurationStoreInjectable;
