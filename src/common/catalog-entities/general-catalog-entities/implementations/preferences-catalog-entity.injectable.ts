/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { generalCatalogEntityInjectionToken } from "../general-catalog-entity-injection-token";
import { GeneralEntity } from "../../index";
import { buildURL } from "../../../utils/buildUrl";
import appPreferencesRouteInjectable from "../../../front-end-routing/routes/preferences/app/app-preferences-route.injectable";

const preferencesCatalogEntityInjectable = getInjectable({
  id: "general-catalog-entity-for-preferences",

  instantiate: (di) => {
    const route = di.inject(appPreferencesRouteInjectable);
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
