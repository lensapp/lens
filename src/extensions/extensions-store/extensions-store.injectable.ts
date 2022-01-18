/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ExtensionsStore } from "./extensions-store";

const extensionsStoreInjectable = getInjectable({
  instantiate: () => ExtensionsStore.createInstance(),
  lifecycle: lifecycleEnum.singleton,
});

export default extensionsStoreInjectable;
