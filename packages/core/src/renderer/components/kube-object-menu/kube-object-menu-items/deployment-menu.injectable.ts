/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeObjectMenuItemComponent } from "../kube-object-menu-item-injection-token";
import { kubeObjectMenuItemInjectionToken } from "../kube-object-menu-item-injection-token";
import { computed } from "mobx";
import { DeploymentMenu } from "../../workloads-deployments/deployment-menu";

const deploymentMenuInjectable = getInjectable({
  id: "deployment-menu-kube-object-menu",

  instantiate: () => ({
    kind: "Deployment",
    apiVersions: ["apps/v1"],
    Component: DeploymentMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 30,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default deploymentMenuInjectable;
