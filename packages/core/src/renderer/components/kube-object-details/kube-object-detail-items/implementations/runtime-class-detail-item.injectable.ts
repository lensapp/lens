/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { RuntimeClassesDetails } from "../../../config-runtime-classes";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const runtimeClassDetailItemInjectable = getInjectable({
  id: "runtime-class-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: RuntimeClassesDetails,
      enabled: computed(() => isRuntimeClass(kubeObject.value.get()?.object)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

const isRuntimeClass = kubeObjectMatchesToKindAndApiVersion(
  "RuntimeClass",
  ["node.k8s.io/v1"],
);

export default runtimeClassDetailItemInjectable;
