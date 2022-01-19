/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import { enableExtension } from "./enable-extension";

const enableExtensionInjectable = getInjectable({
  instantiate: (di) =>
    enableExtension({
      extensionLoader: di.inject(extensionLoaderInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default enableExtensionInjectable;
