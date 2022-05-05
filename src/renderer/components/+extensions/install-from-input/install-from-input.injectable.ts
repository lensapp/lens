/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import attemptInstallInjectable from "../attempt-install/attempt-install.injectable";
import { installFromInput } from "./install-from-input";
import attemptInstallByInfoInjectable from "../attempt-install-by-info.injectable";
import extensionInstallationStateStoreInjectable
  from "../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";

const installFromInputInjectable = getInjectable({
  id: "install-from-input",

  instantiate: (di) =>
    installFromInput({
      attemptInstall: di.inject(attemptInstallInjectable),
      attemptInstallByInfo: di.inject(attemptInstallByInfoInjectable),
      extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
    }),
});

export default installFromInputInjectable;
