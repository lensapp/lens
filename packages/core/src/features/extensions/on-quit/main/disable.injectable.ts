/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionInjectable from "../../../../extensions/extension-loader/extension/extension.injectable";
import extensionsInjectable from "../../../../extensions/extensions.injectable";
import { beforeQuitOfBackEndInjectionToken } from "../../../../main/start-main-application/runnable-tokens/before-quit-of-back-end-injection-token";

const disabledExtensionsOnQuitInjectable = getInjectable({
  id: "disabled-extensions-on-quit",
  instantiate: (di) => ({
    id: "disabled-extensions-on-quit",
    run: async () => {
      const extensionInstances = di.inject(extensionsInjectable);

      for (const instance of extensionInstances.get()) {
        const extensionInjectableWrapper = di.inject(extensionInjectable, instance);

        await instance.disable();
        extensionInjectableWrapper.deregister();
      }
    },
  }),
  injectionToken: beforeQuitOfBackEndInjectionToken,
});

export default disabledExtensionsOnQuitInjectable;
