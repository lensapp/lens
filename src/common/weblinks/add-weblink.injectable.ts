/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import weblinksStoreInjectable from "./store.injectable";

const addWeblinkInjectable = getInjectable({
  instantiate: (di) => di.inject(weblinksStoreInjectable).add,
  lifecycle: lifecycleEnum.singleton,
});

export default addWeblinkInjectable;
