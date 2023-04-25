/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { DaemonSetDetails } from "../../../workloads-daemonsets";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const daemonSetDetailItemInjectable = getInjectable({
  id: "daemon-set-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: DaemonSetDetails,
      enabled: computed(() => isDaemonSet(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default daemonSetDetailItemInjectable;

export const isDaemonSet = kubeObjectMatchesToKindAndApiVersion("DaemonSet", [
  "apps/v1",
]);
