/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ExtensionLoader } from "./extension-loader";
import extensionInstancesInjectable from "./extension-instances.injectable";
import extensionInjectable from "./extension/extension.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import getDirnameOfPathInjectable from "../../common/path/get-dirname.injectable";
import { bundledExtensionInjectionToken } from "@k8slens/legacy-extensions";
import { extensionEntryPointNameInjectionToken } from "./entry-point-name";
import updateExtensionsStateInjectable from "../../features/extensions/enabled/common/update-state.injectable";

const extensionLoaderInjectable = getInjectable({
  id: "extension-loader",

  instantiate: (di) => new ExtensionLoader({
    updateExtensionsState: di.inject(updateExtensionsStateInjectable),
    extensionInstances: di.inject(extensionInstancesInjectable),
    getExtension: (instance) => di.inject(extensionInjectable, instance),
    bundledExtensions: di.injectMany(bundledExtensionInjectionToken),
    extensionEntryPointName: di.inject(extensionEntryPointNameInjectionToken),
    logger: di.inject(loggerInjectionToken),
    joinPaths: di.inject(joinPathsInjectable),
    getDirnameOfPath: di.inject(getDirnameOfPathInjectable),
  }),
});

export default extensionLoaderInjectable;
