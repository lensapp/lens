/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeObjectMenuItemComponent } from "../kube-object-menu-item-injection-token";
import { kubeObjectMenuItemInjectionToken } from "../kube-object-menu-item-injection-token";
import { computed } from "mobx";
import { StatefulSetMenu } from "../../workloads-statefulsets/statefulset-menu";

const statefulsetMenuInjectable = getInjectable({
  id: "statefulset-menu-kube-object-menu",

  instantiate: () => ({
    kind: "StatefulSet",
    apiVersions: ["apps/v1"],
    Component: StatefulSetMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 30,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default statefulsetMenuInjectable;
