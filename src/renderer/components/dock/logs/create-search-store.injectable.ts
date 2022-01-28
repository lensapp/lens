/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { LogSearchStore } from "./search-store";

const createSearchStoreInjectable = getInjectable({
  instantiate: () => () => new LogSearchStore(),
  lifecycle: lifecycleEnum.singleton,
});

export default createSearchStoreInjectable;
