/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ExtensionLoader } from "./extension-loader";
import updateExtensionsStateInjectable from "./update-extensions-state/update-extensions-state.injectable";
import createExtensionInstanceInjectable
  from "./create-extension-instance/create-extension-instance.injectable";

const extensionLoaderInjectable = getInjectable({
  instantiate: (di) =>
    new ExtensionLoader({
      updateExtensionsState: di.inject(updateExtensionsStateInjectable),
      createExtensionInstance: di.inject(createExtensionInstanceInjectable),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default extensionLoaderInjectable;
