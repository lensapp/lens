/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Writable } from "type-fest";
import { lensExtensionDependencies } from "../../../extensions/lens-extension";
import { LensMainExtension } from "../../../extensions/lens-main-extension";
import navigateForExtensionInjectable from "../../../main/start-main-application/lens-window/navigate-for-extension.injectable";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import getExtensionPageParametersInjectable from "../../routes/get-extension-page-parameters.injectable";
import navigateToRouteInjectable from "../../routes/navigate-to-route.injectable";
import routesInjectable from "../../routes/routes.injectable";
import catalogEntityRegistryForMainInjectable from "../../../main/catalog/entity-registry.injectable";
import catalogEntityRegistryForRendererInjectable from "../../api/catalog/entity/registry.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import ensureHashedDirectoryForExtensionInjectable from "../../../extensions/extension-loader/file-system-provisioner-store/ensure-hashed-directory-for-extension.injectable";

export class TestExtensionMain extends LensMainExtension {}
export class TestExtensionRenderer extends LensRendererExtension {}

export interface FakeExtensionOptions {
  id: string;
  name: string;
  rendererOptions?: Partial<LensRendererExtension>;
  mainOptions?: Partial<LensMainExtension>;
}

export const getMainExtensionFakeWith = (di: DiContainer) => ({ id, name, mainOptions = {}}: FakeExtensionOptions) => {
  const instance = new TestExtensionMain({
    id,
    absolutePath: "irrelevant",
    isBundled: false,
    isCompatible: false,
    isEnabled: false,
    manifest: {
      name,
      version: "1.0.0",
      engines: {
        lens: "^5.5.0",
      },
    },
    manifestPath: "irrelevant",
  });

  Object.assign(instance, mainOptions);

  (instance as Writable<LensMainExtension>)[lensExtensionDependencies] = {
    ensureHashedDirectoryForExtension: di.inject(ensureHashedDirectoryForExtensionInjectable),
    entityRegistry: di.inject(catalogEntityRegistryForMainInjectable),
    navigate: di.inject(navigateForExtensionInjectable),
    logger: di.inject(loggerInjectable),
  };

  return instance;
};

export const getRendererExtensionFakeWith = (di: DiContainer) => ({ id, name, rendererOptions = {}}: FakeExtensionOptions) => {
  const instance = new TestExtensionRenderer({
    id,
    absolutePath: "irrelevant",
    isBundled: false,
    isCompatible: false,
    isEnabled: false,
    manifest: {
      name,
      version: "1.0.0",
      engines: {
        lens: "^5.5.0",
      },
    },
    manifestPath: "irrelevant",
  });

  Object.assign(instance, rendererOptions);

  (instance as Writable<LensRendererExtension>)[lensExtensionDependencies] = {
    categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    entityRegistry: di.inject(catalogEntityRegistryForRendererInjectable),
    ensureHashedDirectoryForExtension: di.inject(ensureHashedDirectoryForExtensionInjectable),
    getExtensionPageParameters: di.inject(getExtensionPageParametersInjectable),
    navigateToRoute: di.inject(navigateToRouteInjectable),
    routes: di.inject(routesInjectable),
    logger: di.inject(loggerInjectable),
  };

  return instance;
};
