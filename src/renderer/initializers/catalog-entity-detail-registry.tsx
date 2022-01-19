/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { KubernetesCluster, WebLink } from "../../common/catalog-entities";
import { CatalogEntityDetailRegistry, CatalogEntityDetailsProps } from "../../extensions/registries";
import { DrawerItem, DrawerTitle } from "../components/drawer";

export function initCatalogEntityDetailRegistry() {
  CatalogEntityDetailRegistry.getInstance()
    .add([
      {
        apiVersions: [KubernetesCluster.apiVersion],
        kind: KubernetesCluster.kind,
        components: {
          Details: ({ entity }: CatalogEntityDetailsProps<KubernetesCluster>) => (
            <>
              <DrawerTitle title="Kubernetes Information" />
              <div className="box grow EntityMetadata">
                <DrawerItem name="Distribution">
                  {entity.metadata.distro || "unknown"}
                </DrawerItem>
                <DrawerItem name="Kubelet Version">
                  {entity.metadata.kubeVersion || "unknown"}
                </DrawerItem>
              </div>
            </>
          ),
        },
      },
      {
        apiVersions: [WebLink.apiVersion],
        kind: WebLink.kind,
        components: {
          Details: ({ entity }: CatalogEntityDetailsProps<WebLink>) => (
            <>
              <DrawerTitle title="More Information" />
              <DrawerItem name="URL">
                {entity.spec.url}
              </DrawerItem>
            </>
          ),
        },
      },
    ]);
}
