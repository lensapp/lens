/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Writable } from "type-fest";
import loggerInjectable from "../../common/logger.injectable";
import { createExtensionInstanceInjectionToken } from "../../extensions/extension-loader/create-extension-instance.token";
import ensureHashedDirectoryForExtensionInjectable from "../../extensions/extension-loader/file-system-provisioner-store/ensure-hashed-directory-for-extension.injectable";
import { lensExtensionDependencies } from "../../extensions/lens-extension";
import type { LensMainExtensionDependencies } from "../../extensions/lens-extension-set-dependencies";
import type { LensMainExtension } from "../../extensions/lens-main-extension";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import navigateForExtensionInjectable from "../start-main-application/lens-window/navigate-for-extension.injectable";

const createExtensionInstanceInjectable = getInjectable({
  id: "create-extension-instance",
  instantiate: (di) => {
    const deps: LensMainExtensionDependencies = {
      ensureHashedDirectoryForExtension: di.inject(ensureHashedDirectoryForExtensionInjectable),
      entityRegistry: di.inject(catalogEntityRegistryInjectable),
      navigate: di.inject(navigateForExtensionInjectable),
      logger: di.inject(loggerInjectable),
    };

    return (ExtensionClass, extension) => {
      const instance = new ExtensionClass(extension) as LensMainExtension;

      (instance as Writable<LensMainExtension>)[lensExtensionDependencies] = deps;

      return instance;
    };
  },
  injectionToken: createExtensionInstanceInjectionToken,
});

export default createExtensionInstanceInjectable;
