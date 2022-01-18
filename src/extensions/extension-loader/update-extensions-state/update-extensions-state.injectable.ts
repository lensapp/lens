/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionsStoreInjectable from "../../extensions-store/extensions-store.injectable";

const updateExtensionsStateInjectable = getInjectable({
  instantiate: (di) => di.inject(extensionsStoreInjectable).mergeState,
  lifecycle: lifecycleEnum.singleton,
});

export default updateExtensionsStateInjectable;
