/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionInstallerInjectable from "../extension-installer.injectable";

const installExtensionsInjectable = getInjectable({
  id: "install-extensions",
  instantiate: (di) => di.inject(extensionInstallerInjectable).installPackages,
});

export default installExtensionsInjectable;
