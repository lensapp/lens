/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionInstallerInjectable from "../extension-installer.injectable";

const installExtensionsInjectable = getInjectable({
  instantiate: (di) => di.inject(extensionInstallerInjectable).installPackages,

  lifecycle: lifecycleEnum.singleton,
});

export default installExtensionsInjectable;
