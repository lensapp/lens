/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";
import { MutatingWebhookDetails } from "../../../config-mutating-webhook-configurations";

const mutatingWebhookConfigurationDetailItemInjectable = getInjectable({
  id: "mutating-webhook-configuration-detail-item",

  instantiate(di) {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: MutatingWebhookDetails,
      enabled: computed(() => isMutatingWebhookConfiguration(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export const isMutatingWebhookConfiguration = kubeObjectMatchesToKindAndApiVersion(
  "MutatingWebhookConfiguration",
  ["v1", "admissionregistration.k8s.io/v1beta1", "admissionregistration.k8s.io/v1"],
);

export default mutatingWebhookConfigurationDetailItemInjectable;
