/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import orderBy from "lodash/orderBy";
import { computed, IComputedValue } from "mobx";
import React from "react";
import type { CatalogEntity } from "../../../common/catalog";
import { KubernetesCluster, WebLink } from "../../../common/catalog-entities";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import type { CatalogEntityDetailComponents, CatalogEntityDetailRegistration, CatalogEntityDetailsProps } from "../../catalog/catalog-entity-details";
import { DrawerItem, DrawerTitle } from "../drawer";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
}

const internalItems: CatalogEntityDetailRegistration<CatalogEntity>[] = [
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
];

function getEntityDetailItems({ extensions }: Dependencies) {
  return computed(() => {
    const res = new Map<string, Map<string, CatalogEntityDetailComponents<CatalogEntity>[]>>();
    const detailRegistrations = orderBy(
      [
        ...internalItems,
        ...extensions
          .get()
          .flatMap(ext => ext.catalogEntityDetailItems),
      ]
        .map(({ priority = 50, ...rest }) => ({ priority, ...rest })),
      "priority",
      "desc",
    );

    for (const { kind, apiVersions, components } of detailRegistrations) {
      if (!res.has(kind)) {
        res.set(kind, new Map());
      }

      const byKind = res.get(kind);

      for (const apiVersion of apiVersions) {
        if (!byKind.has(apiVersion)) {
          byKind.set(apiVersion, []);
        }

        byKind.get(apiVersion).push(components);
      }
    }

    return res;
  });
}

const entityDetailItemsInjectable = getInjectable({
  instantiate: (di) => getEntityDetailItems({
    extensions: di.inject(rendererExtensionsInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default entityDetailItemsInjectable;
