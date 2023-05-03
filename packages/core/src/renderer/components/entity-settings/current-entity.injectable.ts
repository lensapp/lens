/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import entitySettingsRouteInjectable from "../../../common/front-end-routing/routes/entity-settings/entity-settings-route.injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import routePathParametersInjectable from "../../routes/route-path-parameters.injectable";

const currentCatalogEntityForSettingsInjectable = getInjectable({
  id: "current-catalog-entity-for-settings",
  instantiate: (di) => {
    const route = di.inject(entitySettingsRouteInjectable);
    const pathParameters = di.inject(routePathParametersInjectable)(route);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return computed(() => {
      const params = pathParameters.get();

      if (!params) {
        return undefined;
      }

      return catalogEntityRegistry.getById(params.entityId);
    });
  },
});

export default currentCatalogEntityForSettingsInjectable;
