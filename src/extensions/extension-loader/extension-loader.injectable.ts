/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ExtensionLoader } from "./extension-loader";
import updateExtensionsStateInjectable from "./update-extensions-state/update-extensions-state.injectable";
import { createExtensionInstanceInjectionToken } from "./create-extension-instance.token";
import extensionInstancesInjectable from "./extension-instances.injectable";
import type { LensExtension } from "../lens-extension";
import extensionInjectable from "./extension/extension.injectable";
import loggerInjectable from "../../common/logger.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import getDirnameOfPathInjectable from "../../common/path/get-dirname.injectable";

const extensionLoaderInjectable = getInjectable({
  id: "extension-loader",

  instantiate: (di) => new ExtensionLoader({
    updateExtensionsState: di.inject(updateExtensionsStateInjectable),
    createExtensionInstance: di.inject(createExtensionInstanceInjectionToken),
    extensionInstances: di.inject(extensionInstancesInjectable),
    getExtension: (instance: LensExtension) => di.inject(extensionInjectable, instance),
    logger: di.inject(loggerInjectable),
    joinPaths: di.inject(joinPathsInjectable),
    getDirnameOfPath: di.inject(getDirnameOfPathInjectable),
  }),
});

export default extensionLoaderInjectable;
