/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionsStoreInjectable from "../../extensions-store/extensions-store.injectable";

const updateExtensionsStateInjectable = getInjectable({
  id: "update-extensions-state",
  instantiate: (di) => di.inject(extensionsStoreInjectable).mergeState,
});

export default updateExtensionsStateInjectable;
