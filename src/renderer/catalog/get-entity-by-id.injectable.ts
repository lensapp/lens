/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "./entity-registry.injectable";

const getEntityByIdInjectable = getInjectable({
  instantiate: (di) => di.inject(catalogEntityRegistryInjectable).getById,
  lifecycle: lifecycleEnum.singleton,
});

export default getEntityByIdInjectable;
