/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import catalogCategoryRegistryInjectable from "./category-registry.injectable";
import { CatalogEntityRegistry } from "./entity-registry";

const catalogEntityRegistryInjectable = getInjectable({
  instantiate: (di) => new CatalogEntityRegistry({
    getEntityForData: di.inject(catalogCategoryRegistryInjectable).getEntityForData,
    logger: di.inject(loggerInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default catalogEntityRegistryInjectable;
