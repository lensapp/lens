/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import { WebLink } from "../../../../../common/catalog-entities";
import { DrawerTitle, DrawerItem } from "../../../drawer";
import { catalogEntityDetailItemInjectionToken } from "../token";

const weblinkDetailsItemInjectable = getInjectable({
  id: "weblink-details-item",
  instantiate: () => ({
    apiVersions: new Set([WebLink.apiVersion]),
    kind: WebLink.kind,
    components: {
      Details: ({ entity }) => (
        <>
          <DrawerTitle>More Information</DrawerTitle>
          <DrawerItem
            name="URL"
            data-testid={`weblink-url-for-${entity.getId()}`}
          >
            {entity.spec.url}
          </DrawerItem>
        </>
      ),
    },
    orderNumber: 40,
  }),
  injectionToken: catalogEntityDetailItemInjectionToken,
});

export default weblinkDetailsItemInjectable;
