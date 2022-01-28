/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import namespaceFilterStoreInjectable from "./filter-store.injectable";

const selectSingleNamespaceInjectable = getInjectable({
  instantiate: (di) => di.inject(namespaceFilterStoreInjectable).selectSingle,
  lifecycle: lifecycleEnum.singleton,
});

export default selectSingleNamespaceInjectable;
