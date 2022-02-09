/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionInstallerInjectable from "../extension-installer.injectable";

const installExtensionInjectable = getInjectable({
  id: "install-extension",
  instantiate: (di) => di.inject(extensionInstallerInjectable).installPackage,
});

export default installExtensionInjectable;
