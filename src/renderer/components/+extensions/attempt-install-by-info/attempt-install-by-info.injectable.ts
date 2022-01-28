/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { attemptInstallByInfo } from "./attempt-install-by-info";
import { bind } from "../../../utils";
import attemptInstallInjectable from "../attempt-install/attempt-install.injectable";
import getBaseRegistryUrlInjectable from "../get-base-registry-url/get-base-registry-url.injectable";
import confirmWithDialogInjectable from "../../confirm-dialog/dialog-confirm.injectable";
import extensionInstallationStateStoreInjectable from "../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";

const attemptInstallByInfoInjectable = getInjectable({
  instantiate: (di) => bind(attemptInstallByInfo, null, {
    attemptInstall: di.inject(attemptInstallInjectable),
    getBaseRegistryUrl: di.inject(getBaseRegistryUrlInjectable),
    confirmWithDialog: di.inject(confirmWithDialogInjectable),
    extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default attemptInstallByInfoInjectable;
