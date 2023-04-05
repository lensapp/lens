/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionInjectable from "../../../../extensions/extension-loader/extension/extension.injectable";
import extensionsInjectable from "../../../../extensions/extensions.injectable";
import { onQuitOfBackEndInjectionToken } from "../../../../main/start-main-application/runnable-tokens/phases";

const stopAllExtensionsInjectable = getInjectable({
  id: "stop-all-extensions",
  instantiate: (di) => ({
    run: async () => {
      const instances = di.inject(extensionsInjectable).get();

      for (const instance of instances) {
        const extension = di.inject(extensionInjectable, instance);

        await instance.disable();
        extension.deregister();
      }
    },
  }),
  injectionToken: onQuitOfBackEndInjectionToken,
});

export default stopAllExtensionsInjectable;
