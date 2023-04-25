/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeObjectMenuItemComponent } from "../kube-object-menu-item-injection-token";
import { kubeObjectMenuItemInjectionToken } from "../kube-object-menu-item-injection-token";
import { computed } from "mobx";
import { DaemonSetMenu } from "../../workloads-daemonsets/daemonset-menu";

const daemonsetMenuInjectable = getInjectable({
  id: "daemonset-menu-kube-object-menu",

  instantiate: () => ({
    kind: "DaemonSet",
    apiVersions: ["apps/v1"],
    Component: DaemonSetMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 30,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default daemonsetMenuInjectable;
