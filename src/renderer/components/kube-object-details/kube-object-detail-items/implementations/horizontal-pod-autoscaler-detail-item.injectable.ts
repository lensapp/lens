/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { HpaDetails } from "../../../+config-autoscalers";
import { computed } from "mobx";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const horizontalPodAutoscalerDetailItemInjectable = getInjectable({
  id: "horizontal-pod-autoscaler-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: HpaDetails,
      enabled: computed(() => isHorizontalPodAutoscaler(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export const isHorizontalPodAutoscaler = kubeObjectMatchesToKindAndApiVersion(
  "HorizontalPodAutoscaler",
  ["autoscaling/v2beta1"],
);

export default horizontalPodAutoscalerDetailItemInjectable;
