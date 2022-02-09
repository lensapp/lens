/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { attemptInstallByInfo } from "./attempt-install-by-info";
import attemptInstallInjectable from "../attempt-install/attempt-install.injectable";
import getBaseRegistryUrlInjectable from "../get-base-registry-url/get-base-registry-url.injectable";
import extensionInstallationStateStoreInjectable
  from "../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";

const attemptInstallByInfoInjectable = getInjectable({
  id: "attempt-install-by-info",

  instantiate: (di) =>
    attemptInstallByInfo({
      attemptInstall: di.inject(attemptInstallInjectable),
      getBaseRegistryUrl: di.inject(getBaseRegistryUrlInjectable),
      extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
    }),
});

export default attemptInstallByInfoInjectable;
