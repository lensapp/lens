/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { unpackExtension } from "./unpack-extension";
import extensionLoaderInjectable from "../../../../../extensions/extension-loader/extension-loader.injectable";
import getExtensionDestFolderInjectable
  from "../get-extension-dest-folder/get-extension-dest-folder.injectable";
import extensionInstallationStateStoreInjectable
  from "../../../../../extensions/extension-installation-state-store/extension-installation-state-store.injectable";

const unpackExtensionInjectable = getInjectable({
  id: "unpack-extension",

  instantiate: (di) =>
    unpackExtension({
      extensionLoader: di.inject(extensionLoaderInjectable),
      getExtensionDestFolder: di.inject(getExtensionDestFolderInjectable),
      extensionInstallationStateStore: di.inject(extensionInstallationStateStoreInjectable),
    }),
});

export default unpackExtensionInjectable;
