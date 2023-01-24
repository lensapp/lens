/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { CatalogEntityData, CatalogEntityKindData } from "../../../../common/catalog";
import getEntityShortnameInjectable from "../../../../common/entity-preferences/get-shortname.injectable";
import { toJS } from "../../../../common/utils";
import catalogEntityRegistryInjectable from "../../../../main/catalog/entity-registry.injectable";

const catalogEntityChangeSetInjectable = getInjectable({
  id: "catalog-entity-change-set",
  instantiate: (di): IComputedValue<(CatalogEntityData & CatalogEntityKindData)[]> => {
    const getEntityShortname = di.inject(getEntityShortnameInjectable);
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return computed(() => toJS(catalogEntityRegistry.items.map(({ metadata, spec, status, kind, apiVersion }) => ({
      metadata: {
        ...metadata,
        shortName: getEntityShortname(metadata.uid) || metadata.shortName,
      },
      spec,
      status,
      kind,
      apiVersion,
    }))));
  },
});

export default catalogEntityChangeSetInjectable;
