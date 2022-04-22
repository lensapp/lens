/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createExtensionInstanceInjectionToken } from "../../extensions/extension-loader/create-extension-instance.token";
import fileSystemProvisionerStoreInjectable from "../../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store.injectable";
import type { LensMainExtensionDependencies } from "../../extensions/lens-extension-set-dependencies";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";

const createExtensionInstanceInjectable = getInjectable({
  id: "create-extension-instance",
  instantiate: (di) => {
    const deps: LensMainExtensionDependencies = {
      fileSystemProvisionerStore: di.inject(fileSystemProvisionerStoreInjectable),
      entityRegistry: di.inject(catalogEntityRegistryInjectable),
    };

    return (ExtensionClass, extension) => {
      const instance = new ExtensionClass(extension);

      (instance as unknown as { dependencies: LensMainExtensionDependencies }).dependencies = deps;

      return instance;
    };
  },
  injectionToken: createExtensionInstanceInjectionToken,
});

export default createExtensionInstanceInjectable;
