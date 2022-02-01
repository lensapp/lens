/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import extensionLoaderInjectable from "./extension-loader.injectable";

const getInstalledExtensionInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(extensionLoaderInjectable);

    return (extId: string) => store.getExtension(extId);
  },
  lifecycle: lifecycleEnum.singleton,
});

export default getInstalledExtensionInjectable;
