/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { generalCatalogEntityInjectionToken } from "../../../common/catalog-entities/general-catalog-entities/general-catalog-entity-injection-token";
import { GeneralEntity } from "../../../common/catalog-entities";
import { buildURL } from "@k8slens/utilities";
import preferencesRouteInjectable from "./preferences-route.injectable";

const preferencesCatalogEntityInjectable = getInjectable({
  id: "general-catalog-entity-for-preferences",

  instantiate: (di) => {
    const route = di.inject(preferencesRouteInjectable);
    const url = buildURL(route.path);

    return new GeneralEntity({
      metadata: {
        uid: "preferences-entity",
        name: "Preferences",
        source: "app",
        labels: {},
      },
      spec: {
        path: url,
        icon: {
          material: "settings",
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

export default preferencesCatalogEntityInjectable;
