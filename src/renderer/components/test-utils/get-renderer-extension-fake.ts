/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Mutable, SetRequired } from "type-fest";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import fileSystemProvisionerStoreInjectable from "../../../extensions/extension-loader/file-system-provisioner-store/file-system-provisioner-store.injectable";
import { lensExtensionDependencies } from "../../../extensions/lens-extension";
import { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import getExtensionPageParametersInjectable from "../../routes/get-extension-page-parameters.injectable";
import navigateToRouteInjectable from "../../routes/navigate-to-route.injectable";
import routesInjectable from "../../routes/routes.injectable";
import type { ApplicationBuilder } from "./get-application-builder";

export class TestExtension extends LensRendererExtension {}

export type FakeExtensionData = SetRequired<Partial<LensRendererExtension>, "id" | "name">;

export const getRendererExtensionFakeFor = (builder: ApplicationBuilder) => (
  function getRendererExtensionFake({ id, name, ...rest }: FakeExtensionData) {
    const instance = new TestExtension({
      id,
      absolutePath: "irrelevant",
      isBundled: false,
      isCompatible: false,
      isEnabled: false,
      manifest: {
        name,
        version: "1.0.0",
      },
      manifestPath: "irrelevant",
    });

    Object.assign(instance, rest);

    (instance as Mutable<LensRendererExtension>)[lensExtensionDependencies] = {
      categoryRegistry: builder.dis.rendererDi.inject(catalogCategoryRegistryInjectable),
      entityRegistry: builder.dis.rendererDi.inject(catalogEntityRegistryInjectable),
      fileSystemProvisionerStore: builder.dis.rendererDi.inject(fileSystemProvisionerStoreInjectable),
      getExtensionPageParameters: builder.dis.rendererDi.inject(getExtensionPageParametersInjectable),
      navigateToRoute: builder.dis.rendererDi.inject(navigateToRouteInjectable),
      routes: builder.dis.rendererDi.inject(routesInjectable),
    };

    return instance;
  }
);

