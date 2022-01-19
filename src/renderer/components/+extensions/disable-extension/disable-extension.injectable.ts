/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import { disableExtension } from "./disable-extension";

const disableExtensionInjectable = getInjectable({
  instantiate: (di) =>
    disableExtension({
      extensionLoader: di.inject(extensionLoaderInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default disableExtensionInjectable;
