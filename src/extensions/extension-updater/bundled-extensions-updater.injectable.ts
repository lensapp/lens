/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import installFromInputInjectable from "../../renderer/components/+extensions/install-from-input/install-from-input.injectable";
import extensionLoaderInjectable from "../extension-loader/extension-loader.injectable";
import { BundledExtensionsUpdater } from "./bundled-extensions-updater";

const bundledExtensionsUpdaterInjectable = getInjectable({
  instantiate: (di) =>
    new BundledExtensionsUpdater({
      installFromInput: di.inject(installFromInputInjectable),
      extensions: di.inject(extensionLoaderInjectable).bundledExtensions
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default bundledExtensionsUpdaterInjectable;