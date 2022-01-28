/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "./entity-registry.injectable";

const onRunInjectable = getInjectable({
  instantiate: (di) => di.inject(catalogEntityRegistryInjectable).onRun,
  lifecycle: lifecycleEnum.singleton,
});

export default onRunInjectable;
