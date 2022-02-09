/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { confirmUninstallExtension } from "./confirm-uninstall-extension";
import uninstallExtensionInjectable from "../uninstall-extension/uninstall-extension.injectable";

const confirmUninstallExtensionInjectable = getInjectable({
  id: "confirm-uninstall-extension",

  instantiate: (di) =>
    confirmUninstallExtension({
      uninstallExtension: di.inject(uninstallExtensionInjectable),
    }),
});

export default confirmUninstallExtensionInjectable;
