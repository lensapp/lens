/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ExtensionInstallationStateStore } from "./extension-installation-state-store";

const extensionInstallationStateStoreInjectable = getInjectable({
  instantiate: () => new ExtensionInstallationStateStore(),
  lifecycle: lifecycleEnum.singleton,
});

export default extensionInstallationStateStoreInjectable;
