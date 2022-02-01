/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import { uninstallExtension } from "./uninstall-extension";
import extensionDiscoveryInjectable from "../../../../extensions/extension-discovery/extension-discovery.injectable";
import clearUninstallingInjectable from "../../../extensions/installation-state/clear-uninstalling.injectable";
import setUninstallingInjectable from "../../../extensions/installation-state/set-uninstalling.injectable";

const uninstallExtensionInjectable = getInjectable({
  instantiate: (di) =>
    uninstallExtension({
      extensionLoader: di.inject(extensionLoaderInjectable),
      extensionDiscovery: di.inject(extensionDiscoveryInjectable),
      setUninstalling: di.inject(setUninstallingInjectable),
      clearUninstalling: di.inject(clearUninstallingInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default uninstallExtensionInjectable;
