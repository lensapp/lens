/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { computed } from "mobx";
import { ConfigMapDetails } from "../../../+config-maps";
import { kubeObjectMatchesToKindAndApiVersion } from "../kube-object-matches-to-kind-and-api-version";
import type {
  KubeObjectDetailsItem,
} from "../../current-kube-object-in-details.injectable";
import currentKubeObjectInDetailsInjectable from "../../current-kube-object-in-details.injectable";

const configMapDetailItemInjectable = getInjectable({
  id: "config-map-detail-item",

  instantiate: (di) => {
    const kubeObject = di.inject(currentKubeObjectInDetailsInjectable);

    return {
      Component: ConfigMapDetails,
      enabled: computed(() => isConfigMap(kubeObject.value.get() as KubeObjectDetailsItem)),
      orderNumber: 10,
    };
  },

  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default configMapDetailItemInjectable;

const isConfigMap = kubeObjectMatchesToKindAndApiVersion("ConfigMap", ["v1"]);
