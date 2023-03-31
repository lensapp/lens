/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionInjectable from "../../../../extensions/extension-loader/extension/extension.injectable";
import extensionsInjectable from "../../../../extensions/extensions.injectable";

const stopAllExtensionsInjectable = getInjectable({
  id: "stop-all-extensions",
  instantiate: (di) => {
    const extensionInstances = di.inject(extensionsInjectable);

    return async () => {
      for (const instance of extensionInstances.get()) {
        const extension = di.inject(extensionInjectable, instance);

        await instance.disable();
        extension.deregister();
      }
    };
  },
});

export default stopAllExtensionsInjectable;
