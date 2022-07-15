/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { PriorityClassesDetails } from "../../../+config-priority-classes";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const priorityClassDetailItemInjectable = getInjectable({
  id: "priority-class-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: PriorityClassesDetails,
      enabled: computed(() => isPriorityClass(kubeObject.get())),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

const isPriorityClass = kubeObjectMatchesToKindAndApiVersion(
  "PriorityClass",
  ["scheduling.k8s.io/v1"],
);

export default priorityClassDetailItemInjectable;
