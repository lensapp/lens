/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { ServiceAccountsDetails } from "../../../user-management/service-accounts";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const serviceAccountDetailItemInjectable = getInjectable({
  id: "service-account-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: ServiceAccountsDetails,
      enabled: computed(() => isServiceAccount(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export const isServiceAccount = kubeObjectMatchesToKindAndApiVersion(
  "ServiceAccount",
  ["v1"],
);

export default serviceAccountDetailItemInjectable;
