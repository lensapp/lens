/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import entitySettingsRouteParametersInjectable from "./route-parameters.injectable";

const currentCatalogEntityForSettingsInjectable = getInjectable({
  id: "current-catalog-entity-for-settings",
  instantiate: (di) => {
    const { entityId } = di.inject(entitySettingsRouteParametersInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return computed(() => catalogEntityRegistry.getById(entityId.get()));
  },
});

export default currentCatalogEntityForSettingsInjectable;
