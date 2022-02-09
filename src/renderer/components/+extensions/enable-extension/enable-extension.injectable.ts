/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import { enableExtension } from "./enable-extension";

const enableExtensionInjectable = getInjectable({
  id: "enable-extension",

  instantiate: (di) =>
    enableExtension({
      extensionLoader: di.inject(extensionLoaderInjectable),
    }),
});

export default enableExtensionInjectable;
