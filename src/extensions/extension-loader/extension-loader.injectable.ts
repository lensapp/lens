/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ExtensionLoader } from "./extension-loader";
import updateExtensionsStateInjectable from "./update-extensions-state/update-extensions-state.injectable";
import { extensionRegistratorInjectionToken } from "./extension-registrator-injection-token";
import extensionInstallationCounterInjectable from "./extension-installation-counter.injectable";
import { createExtensionInstanceInjectionToken } from "./create-extension-instance.token";
import extensionInstancesInjectable from "./extension-instances.injectable";

const extensionLoaderInjectable = getInjectable({
  id: "extension-loader",

  instantiate: (di) => new ExtensionLoader({
    updateExtensionsState: di.inject(updateExtensionsStateInjectable),
    createExtensionInstance: di.inject(createExtensionInstanceInjectionToken),
    extensionRegistrators: di.injectMany(extensionRegistratorInjectionToken),
    extensionInstallationCounter: di.inject(extensionInstallationCounterInjectable),
    extensionInstances: di.inject(extensionInstancesInjectable),
  }),
});

export default extensionLoaderInjectable;
