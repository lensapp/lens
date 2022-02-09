/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import { disableExtension } from "./disable-extension";

const disableExtensionInjectable = getInjectable({
  id: "disable-extension",

  instantiate: (di) =>
    disableExtension({
      extensionLoader: di.inject(extensionLoaderInjectable),
    }),
});

export default disableExtensionInjectable;
