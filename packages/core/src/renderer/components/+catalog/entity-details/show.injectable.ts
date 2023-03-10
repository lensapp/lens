/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import selectedCatalogEntityParamInjectable from "./selected-uid.injectable";

export type ShowEntityDetails = (id: string) => void;

const showEntityDetailsInjectable = getInjectable({
  id: "show-entity-details",
  instantiate: (di): ShowEntityDetails => {
    const selectedCatalogEntityParam = di.inject(selectedCatalogEntityParamInjectable);

    return (id) => selectedCatalogEntityParam.set(id);
  },
});

export default showEntityDetailsInjectable;
