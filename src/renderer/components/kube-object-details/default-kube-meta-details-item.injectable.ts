/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { KubeObjectMeta } from "../kube-object-meta";
import { kubeObjectDetailItemInjectionToken } from "./kube-object-detail-items/kube-object-detail-item-injection-token";

const defaultKubeObjectMetaDetailsItemInjectable = getInjectable({
  id: "default-kube-object-meta-details-item",
  instantiate: () => ({
    Component: KubeObjectMeta,
    enabled: computed(() => true),
    orderNumber: 0,
  }),
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default defaultKubeObjectMetaDetailsItemInjectable;
