/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "./entity-registry.injectable";

const activeEntityInjectable = getInjectable({
  instantiate: (di) => di.inject(catalogEntityRegistryInjectable).activeEntityComputed,
  lifecycle: lifecycleEnum.singleton,
});

export default activeEntityInjectable;
