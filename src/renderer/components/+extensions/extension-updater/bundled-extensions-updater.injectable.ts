/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import ipcRendererInjectable from "../../../app-paths/get-value-from-registered-channel/ipc-renderer/ipc-renderer.injectable";
import installFromInputInjectable from "../install-from-input/install-from-input.injectable";
import { BundledExtensionsUpdater } from "./bundled-extensions-updater";

const bundledExtensionsUpdaterInjectable = getInjectable({
  instantiate: (di) =>
    new BundledExtensionsUpdater({
      installFromInput: di.inject(installFromInputInjectable),
      extensions: di.inject(extensionLoaderInjectable).bundledExtensions,
      ipcRenderer: di.inject(ipcRendererInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default bundledExtensionsUpdaterInjectable;