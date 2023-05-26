/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { MutatingWebhookConfigurationStore } from "./mutating-webhook-configuration-store";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { mutatingWebhookConfigurationApiInjectable, storesAndApisCanBeCreatedInjectionToken } from "@k8slens/kube-api-specifics";
import assert from "assert";

const mutatingWebhookConfigurationStoreInjectable = getInjectable({
  id: "mutating-webhook-configuration-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "mutatingWebhookConfigurationStore is only available in certain environments");

    const api = di.inject(mutatingWebhookConfigurationApiInjectable);

    return new MutatingWebhookConfigurationStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default mutatingWebhookConfigurationStoreInjectable;
