/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { unpackExtension } from "./unpack-extension";
import extensionLoaderInjectable from "../../../../../extensions/extension-loader/extension-loader.injectable";
import getExtensionDestFolderInjectable from "../get-extension-dest-folder/get-extension-dest-folder.injectable";
import setInstallingInjectable from "../../../../extensions/installation-state/set-installing.injectable";
import clearInstallingInjectable from "../../../../extensions/installation-state/clear-installing.injectable";

const unpackExtensionInjectable = getInjectable({
  instantiate: (di) =>
    unpackExtension({
      extensionLoader: di.inject(extensionLoaderInjectable),
      getExtensionDestFolder: di.inject(getExtensionDestFolderInjectable),
      setInstalling: di.inject(setInstallingInjectable),
      clearInstalling: di.inject(clearInstallingInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default unpackExtensionInjectable;
