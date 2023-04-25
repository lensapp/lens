/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { ResourceQuotaDetails } from "../../../config-resource-quotas";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const resourceQuotaDetailItemInjectable = getInjectable({
  id: "resource-quota-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: ResourceQuotaDetails,
      enabled: computed(() => isResourceQuota(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

const isResourceQuota = kubeObjectMatchesToKindAndApiVersion("ResourceQuota", [
  "v1",
]);

export default resourceQuotaDetailItemInjectable;
