/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { catalogEntityDetailItemInjectionToken } from "../catalog-entity-detail-item-injection-token";
import { WebLink } from "../../../../../common/catalog-entities";
import { DrawerItem, DrawerTitle } from "../../../drawer";
import React from "react";
import type { CatalogEntityDetailItemComponentProps } from "../extension-registration";

const Details = ({ entity }: CatalogEntityDetailItemComponentProps<WebLink>) => (
  <>
    <DrawerTitle>More Information</DrawerTitle>
    <DrawerItem name="URL">{entity.spec.url}</DrawerItem>
  </>
);

const webLinkCatalogEntityDetailItemInjectable = getInjectable({
  id: "web-link-catalog-entity-detail-item",

  instantiate: () => ({
    apiVersions: [WebLink.apiVersion],
    kind: WebLink.kind,
    orderNumber: 20,

    components: {
      Details,
    },
  }),

  injectionToken: catalogEntityDetailItemInjectionToken,
});

export default webLinkCatalogEntityDetailItemInjectable;
