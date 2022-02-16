/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import { generalCatalogEntityInjectionToken } from "./general-catalog-entity-injection-token";

const generalCatalogEntitiesInjectable = getInjectable({
  id: "general-catalog-entities",

  instantiate: (di) =>
    observable(di.injectMany(generalCatalogEntityInjectionToken)),
});

export default generalCatalogEntitiesInjectable;
