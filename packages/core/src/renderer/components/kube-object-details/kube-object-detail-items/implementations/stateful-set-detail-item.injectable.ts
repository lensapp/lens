/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { StatefulSetDetails } from "../../../workloads-statefulsets";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const statefulSetDetailItemInjectable = getInjectable({
  id: "stateful-set-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: StatefulSetDetails,
      enabled: computed(() => isStatefulSet(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export const isStatefulSet = kubeObjectMatchesToKindAndApiVersion(
  "StatefulSet",
  ["apps/v1"],
);

export default statefulSetDetailItemInjectable;
