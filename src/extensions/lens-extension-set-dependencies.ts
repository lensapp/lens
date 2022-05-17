/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import type { CatalogCategoryRegistry } from "../common/catalog";
import type { NavigateToRoute } from "../common/front-end-routing/navigate-to-route-injection-token";
import type { Route } from "../common/front-end-routing/route-injection-token";
import type { CatalogEntityRegistry as MainCatalogEntityRegistry } from "../main/catalog";
import type { CatalogEntityRegistry as RendererCatalogEntityRegistry } from "../renderer/api/catalog/entity/registry";
import type { GetExtensionPageParameters } from "../renderer/routes/get-extension-page-parameters.injectable";
import type { FileSystemProvisionerStore } from "./extension-loader/file-system-provisioner-store/file-system-provisioner-store";

export interface LensExtensionDependencies {
  readonly fileSystemProvisionerStore: FileSystemProvisionerStore;
}

export interface LensMainExtensionDependencies extends LensExtensionDependencies {
  readonly entityRegistry: MainCatalogEntityRegistry;
}

export interface LensRendererExtensionDependencies extends LensExtensionDependencies {
  navigateToRoute: NavigateToRoute;
  getExtensionPageParameters: GetExtensionPageParameters;
  readonly routes: IComputedValue<Route<unknown>[]>;
  readonly entityRegistry: RendererCatalogEntityRegistry;
  readonly categoryRegistry: CatalogCategoryRegistry;
}
