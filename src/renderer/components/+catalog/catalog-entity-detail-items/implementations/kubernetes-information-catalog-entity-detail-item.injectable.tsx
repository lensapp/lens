/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { catalogEntityDetailItemInjectionToken } from "../catalog-entity-detail-item-injection-token";
import { KubernetesCluster } from "../../../../../common/catalog-entities";
import { DrawerItem, DrawerTitle } from "../../../drawer";
import React from "react";
import type { CatalogEntityDetailItemComponentProps } from "../extension-registration";

const Details = ({ entity }: CatalogEntityDetailItemComponentProps<KubernetesCluster>) => (
  <>
    <DrawerTitle>Kubernetes Information</DrawerTitle>
    <div className="box grow EntityMetadata">
      <DrawerItem name="Distribution">
        {entity.metadata.distro || "unknown"}
      </DrawerItem>
      <DrawerItem name="Kubelet Version">
        {entity.metadata.kubeVersion || "unknown"}
      </DrawerItem>
    </div>
  </>
);

const kubernetesInformationCatalogEntityDetailItemInjectable = getInjectable({
  id: "kubernetes-information-catalog-entity-detail-item",
  instantiate: () => ({
    apiVersions: [KubernetesCluster.apiVersion],
    kind: KubernetesCluster.kind,
    orderNumber: 10,

    components: {
      Details,
    },
  }),

  injectionToken: catalogEntityDetailItemInjectionToken,
});

export default kubernetesInformationCatalogEntityDetailItemInjectable;
