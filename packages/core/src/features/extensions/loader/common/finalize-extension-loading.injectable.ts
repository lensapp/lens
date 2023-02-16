/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionInjectable from "../../../../extensions/extension-loader/extension/extension.injectable";
import type { LensExtension } from "../../../../extensions/lens-extension";
import extensionLoadingLoggerInjectable from "./logger.injectable";

export interface ExtensionLoading {
  isBundled: boolean;
  loaded: Promise<void>;
}

export type FinalizeExtensionLoading = (instances: LensExtension[]) => Promise<ExtensionLoading[]>;

const finalizeExtensionLoadingInjectable = getInjectable({
  id: "finalize-extension-loading",
  instantiate: (di): FinalizeExtensionLoading => {
    const logger = di.inject(extensionLoadingLoggerInjectable);

    return async (instances) => {
      // We first need to wait until each extension's `onActivate` is resolved or rejected,
      // as this might register new catalog categories. Afterwards we can safely .enable the extension.
      await Promise.all((
        instances
          .map(async instance => {
            try {
              await instance.activate();
            } catch (error) {
              logger.error(`activation extension error`, { extId: instance.id, error });
            }
          })
      ));

      for (const extension of instances) {
        di.inject(extensionInjectable, extension).register();
      }

      return instances.map(ext => ({
        isBundled: ext.isBundled,
        loaded: (async () => {
          try {
            await ext.enable();
          } catch (err) {
            logger.error(`failed to enable`, { ext, err });
          }
        })(),
      }));
    };
  },
});

export default finalizeExtensionLoadingInjectable;
