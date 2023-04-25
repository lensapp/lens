/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeObjectMenuItemComponent } from "../kube-object-menu-item-injection-token";
import { kubeObjectMenuItemInjectionToken } from "../kube-object-menu-item-injection-token";
import { computed } from "mobx";
import { ReplicaSetMenu } from "../../workloads-replicasets/replica-set-menu";

const replicaSetMenuInjectable = getInjectable({
  id: "replica-set-menu-kube-object-menu",

  instantiate: () => ({
    kind: "ReplicaSet",
    apiVersions: ["apps/v1"],
    Component: ReplicaSetMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 40,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default replicaSetMenuInjectable;
