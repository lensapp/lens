/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { confirmUninstallExtension } from "./confirm-uninstall-extension";
import uninstallExtensionInjectable from "../uninstall-extension/uninstall-extension.injectable";

const confirmUninstallExtensionInjectable = getInjectable({
  instantiate: (di) =>
    confirmUninstallExtension({
      uninstallExtension: di.inject(uninstallExtensionInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default confirmUninstallExtensionInjectable;
