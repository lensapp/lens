/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionInstallerInjectable from "../extension-installer.injectable";

const installExtensionInjectable = getInjectable({
  instantiate: (di) => di.inject(extensionInstallerInjectable).installPackage,

  lifecycle: lifecycleEnum.singleton,
});

export default installExtensionInjectable;
