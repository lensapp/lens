/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { generalCatalogEntityInjectionToken } from "../general-catalog-entity-injection-token";
import { GeneralEntity } from "../../index";
import { buildURL } from "@k8slens/utilities";
import catalogRouteInjectable from "../../../front-end-routing/routes/catalog/catalog-route.injectable";

const catalogCatalogEntityInjectable = getInjectable({
  id: "general-catalog-entity-for-catalog",

  instantiate: (di) => {
    const route = di.inject(catalogRouteInjectable);
    const url = buildURL(route.path);

    return new GeneralEntity({
      metadata: {
        uid: "catalog-entity",
        name: "Catalog",
        source: "app",
        labels: {},
      },
      spec: {
        path: url,
        icon: {
          material: "view_list",
          background: "#3d90ce",
        },
      },
      status: {
        phase: "active",
      },
    });
  },

  injectionToken: generalCatalogEntityInjectionToken,
});

export default catalogCatalogEntityInjectable;
