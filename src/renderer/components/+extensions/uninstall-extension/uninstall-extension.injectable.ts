/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import { uninstallExtension } from "./uninstall-extension";
import extensionInstallationStateStoreInjectable
  from "../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";
import extensionDiscoveryInjectable
  from "../../../../extensions/extension-discovery/extension-discovery.injectable";

const uninstallExtensionInjectable = getInjectable({
  instantiate: (di) =>
    uninstallExtension({
      extensionLoader: di.inject(extensionLoaderInjectable),
      extensionDiscovery: di.inject(extensionDiscoveryInjectable),
      extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default uninstallExtensionInjectable;
