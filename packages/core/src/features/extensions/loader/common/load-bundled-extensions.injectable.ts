/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { bundledExtensionInjectionToken } from "../../../../common/library";
import { isDefined } from "../../../../common/utils";
import { extensionEntryPointNameInjectionToken } from "../../../../extensions/extension-loader/entry-point-name";
import extensionInstancesInjectable from "../../../../extensions/extension-loader/extension-instances.injectable";
import type { LensExtension } from "../../../../extensions/lens-extension";
import extensionLoadingLoggerInjectable from "./logger.injectable";

export type LoadBundledExtensions = () => Promise<LensExtension[]>;

const loadBundledExtensionsInjectable = getInjectable({
  id: "load-bundled-extensions",
  instantiate: (di): LoadBundledExtensions => {
    const bundledExtensions = di.injectMany(bundledExtensionInjectionToken);
    const extensionEntryPointName = di.inject(extensionEntryPointNameInjectionToken);
    const extensionInstances = di.inject(extensionInstancesInjectable);
    const logger = di.inject(extensionLoadingLoggerInjectable);

    return async () => (
      (await Promise.all(bundledExtensions
        .map(async extension => {
          try {
            const LensExtensionClass = await extension[extensionEntryPointName]();

            if (!LensExtensionClass) {
              return null;
            }

            const instance = new LensExtensionClass({
              id: extension.manifest.name,
              isBundled: true,
              isCompatible: true,
              isEnabled: true,
              manifest: extension.manifest,
            });

            extensionInstances.set(extension.manifest.name, instance);

            return instance;
          } catch (err) {
            logger.error(`error loading extension`, { ext: extension, err });

            return null;
          }
        })))
        .filter(isDefined)
    );
  },
});

export default loadBundledExtensionsInjectable;
