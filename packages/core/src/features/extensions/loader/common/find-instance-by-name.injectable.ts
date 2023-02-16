/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { iter } from "../../../../common/utils";
import extensionInstancesInjectable from "../../../../extensions/extension-loader/extension-instances.injectable";
import type { LensExtension } from "../../../../extensions/lens-extension";
import extensionsWithoutInstancesByNameInjectable from "./non-instances-by-name.injectable";

/**
 * Tries to find an extension by its name. If found it will be returned.
 *
 * If the extension is installed but doesn't provide an instance for this environment then
 * `"not-this-environment"` will be returned. If the extension isn't installed then `"not-installed"`
 * will be returned
 */
export type FindExtensionInstanceByName = (name: string) => LensExtension | "not-this-environment" | "not-installed";

const findExtensionInstanceByNameInjectable = getInjectable({
  id: "find-extension-instance-by-name",
  instantiate: (di): FindExtensionInstanceByName => {
    const extensionsWithoutInstancesByName = di.inject(extensionsWithoutInstancesByNameInjectable);
    const extensionInstances = di.inject(extensionInstancesInjectable);

    return (name) => {
      if (extensionsWithoutInstancesByName.has(name)) {
        return "not-this-environment";
      }

      const instance = iter.find(extensionInstances.values(), instance => instance.name === name);

      if (instance) {
        return instance;
      }

      return "not-installed";
    };
  },
});

export default findExtensionInstanceByNameInjectable;
