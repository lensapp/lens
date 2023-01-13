/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import getEntityByIdInjectable from "../../../api/catalog/entity/get-by-id.injectable";
import selectedCatalogEntityParamInjectable from "./selected-uid.injectable";

const selectedCatalogEntityInjectable = getInjectable({
  id: "selected-catalog-entity",
  instantiate: (di) => {
    const getEntityById = di.inject(getEntityByIdInjectable);
    const selectedCatalogEntityParam = di.inject(selectedCatalogEntityParamInjectable);

    return computed(() => {
      const id = selectedCatalogEntityParam.get();

      if (!id) {
        return undefined;
      }

      return getEntityById(id);
    });
  },
});

export default selectedCatalogEntityInjectable;
