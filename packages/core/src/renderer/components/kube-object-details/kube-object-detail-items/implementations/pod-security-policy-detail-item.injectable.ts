/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { PodSecurityPolicyDetails } from "../../../pod-security-policies";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const podSecurityPolicyDetailItemInjectable = getInjectable({
  id: "pod-security-policy-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: PodSecurityPolicyDetails,
      enabled: computed(() => isPodSecurityPolicy(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

const isPodSecurityPolicy = kubeObjectMatchesToKindAndApiVersion(
  "PodSecurityPolicy",
  ["policy/v1beta1"],
);

export default podSecurityPolicyDetailItemInjectable;
