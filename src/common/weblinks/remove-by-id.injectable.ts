/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import weblinksStoreInjectable from "./store.injectable";

const removeWeblinkByIdInjectable = getInjectable({
  instantiate: (di) => di.inject(weblinksStoreInjectable).removeById,
  lifecycle: lifecycleEnum.singleton,
});

export default removeWeblinkByIdInjectable;
