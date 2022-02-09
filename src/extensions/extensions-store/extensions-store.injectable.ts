/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ExtensionsStore } from "./extensions-store";

const extensionsStoreInjectable = getInjectable({
  id: "extensions-store",
  instantiate: () => ExtensionsStore.createInstance(),
});

export default extensionsStoreInjectable;
