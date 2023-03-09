/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntity } from "../../catalog-entity";
import catalogEntityRegistryInjectable from "./registry.injectable";

export type GetEntityById = (id: string) => CatalogEntity | undefined;

const getEntityByIdInjectable = getInjectable({
  id: "get-entity-by-id",
  instantiate: (di): GetEntityById => {
    const catalogEntityRegistry = di.inject(catalogEntityRegistryInjectable);

    return (id) => catalogEntityRegistry.getById(id);
  },
});

export default getEntityByIdInjectable;
