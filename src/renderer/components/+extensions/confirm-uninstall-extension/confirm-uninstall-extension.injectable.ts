/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { confirmUninstallExtension } from "./confirm-uninstall-extension";
import uninstallExtensionInjectable from "../uninstall-extension/uninstall-extension.injectable";
import { bind } from "../../../utils";
import confirmWithDialogInjectable from "../../confirm-dialog/dialog-confirm.injectable";

const confirmUninstallExtensionInjectable = getInjectable({
  instantiate: (di) => bind(confirmUninstallExtension, null, {
    uninstallExtension: di.inject(uninstallExtensionInjectable),
    confirmWithDialog: di.inject(confirmWithDialogInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default confirmUninstallExtensionInjectable;
