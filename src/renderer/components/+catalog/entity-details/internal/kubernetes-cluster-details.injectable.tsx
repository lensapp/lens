/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { KubernetesCluster } from "../../../../../common/catalog-entities";
import { DrawerTitle, DrawerItem } from "../../../drawer";
import { catalogEntityDetailItemInjectionToken } from "../token";

const kubernetesClusterDetailsItemInjectable = getInjectable({
  id: "kubernetes-cluster-details-item",
  instantiate: () => ({
    apiVersions: new Set([KubernetesCluster.apiVersion]),
    kind: KubernetesCluster.kind,
    orderNumber: 40,
    components: {
      Details: ({ entity }) => (
        <>
          <DrawerTitle>Kubernetes Information</DrawerTitle>
          <div className="box grow EntityMetadata">
            <DrawerItem
              name="Distribution"
              data-testid={`kubernetes-distro-for-${entity.getId()}`}
            >
              {entity.metadata.distro || "unknown"}
            </DrawerItem>
            <DrawerItem name="Kubelet Version">
              {entity.metadata.kubeVersion || "unknown"}
            </DrawerItem>
          </div>
        </>
      ),
    },
  }),
  injectionToken: catalogEntityDetailItemInjectionToken,
});

export default kubernetesClusterDetailsItemInjectable;
