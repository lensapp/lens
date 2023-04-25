/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import selectedCatalogEntityParamInjectable from "./selected-uid.injectable";

export type HideEntityDetails = () => void;

const hideEntityDetailsInjectable = getInjectable({
  id: "hide-entity-details",
  instantiate: (di) => {
    const selectedCatalogEntityParam = di.inject(selectedCatalogEntityParamInjectable);

    return () => selectedCatalogEntityParam.clear();
  },
});

export default hideEntityDetailsInjectable;
