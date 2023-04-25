/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { PersistentVolumeDetails } from "../../../storage-volumes";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const persistentVolumeDetailItemInjectable = getInjectable({
  id: "persistent-volume-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: PersistentVolumeDetails,
      enabled: computed(() => isPersistentVolume(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export const isPersistentVolume = kubeObjectMatchesToKindAndApiVersion(
  "PersistentVolume",
  ["v1"],
);

export default persistentVolumeDetailItemInjectable;
