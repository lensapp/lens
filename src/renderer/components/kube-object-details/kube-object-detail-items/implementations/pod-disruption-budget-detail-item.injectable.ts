/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { PodDisruptionBudgetDetails } from "../../../+config-pod-disruption-budgets";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const podDisruptionBudgetDetailItemInjectable = getInjectable({
  id: "pod-disruption-budget-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: PodDisruptionBudgetDetails,
      enabled: computed(() => isPodDisruptionBudget(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

const isPodDisruptionBudget = kubeObjectMatchesToKindAndApiVersion(
  "PodDisruptionBudget",
  ["policy/v1beta1"],
);

export default podDisruptionBudgetDetailItemInjectable;
