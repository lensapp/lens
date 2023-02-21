/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isDefined } from "../../../../common/utils";
import type { ExternalInstalledExtension, LensExtensionId } from "../../common/installed-extension";
import extensionInstancesInjectable from "../../../../extensions/extension-loader/extension-instances.injectable";
import type { LensExtension } from "../../../../extensions/lens-extension";
import importInstalledExtensionInjectable from "./import-installed-extension.injectable";
import extensionLoadingLoggerInjectable from "./logger.injectable";
import extensionsWithoutInstancesByNameInjectable from "./non-instances-by-name.injectable";
import removeExtensionInstanceInjectable from "./remove-instance.injectable";

export type LoadUserExtensions = (installedExtensions: [LensExtensionId, ExternalInstalledExtension][]) => Promise<LensExtension[]>;

const loadUserExtensionsInjectable = getInjectable({
  id: "load-user-extensions",
  instantiate: (di): LoadUserExtensions => {
    const importInstalledExtension = di.inject(importInstalledExtensionInjectable);
    const removeExtensionInstance = di.inject(removeExtensionInstanceInjectable);
    const extensionsWithoutInstancesByName = di.inject(extensionsWithoutInstancesByNameInjectable);
    const extensionInstances = di.inject(extensionInstancesInjectable);
    const logger = di.inject(extensionLoadingLoggerInjectable);

    return async (installedExtensions) => {
      const instances = await Promise.all((
        installedExtensions
          .map(async ([extId, extension]) => {
            const alreadyInit = extensionInstances.has(extId) || extensionsWithoutInstancesByName.has(extension.manifest.name);

            if (extension.isCompatible && extension.isEnabled && !alreadyInit) {
              try {
                const LensExtensionClass = await importInstalledExtension(extension);

                if (!LensExtensionClass) {
                  extensionsWithoutInstancesByName.add(extension.manifest.name);

                  return null;
                }

                const instance = new LensExtensionClass(extension);

                extensionInstances.set(extId, instance);

                return instance;
              } catch (err) {
                logger.error(`error loading extension`, { ext: extension, err });
              }
            } else if (!extension.isEnabled && alreadyInit) {
              removeExtensionInstance(extId);
            }

            return null;
          })
      ));

      return instances.filter(isDefined);
    };
  },
});

export default loadUserExtensionsInjectable;
