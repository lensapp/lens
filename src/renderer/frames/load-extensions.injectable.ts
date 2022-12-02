/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "../../extensions/extension-loader/extension-loader.injectable";

const loadExtensionsInjectable = getInjectable({
  id: "load-extensions",
  instantiate: (di) => {
    const extensionLoader = di.inject(extensionLoaderInjectable);

    return () => extensionLoader.autoInitExtensions();
  },
});

export default loadExtensionsInjectable;
