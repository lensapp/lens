/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { CatalogEntityDetailItem, catalogEntityDetailItemInjectionToken } from "./catalog-entity-detail-item-injection-token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { conforms, eq, filter, includes, overSome, sortBy } from "lodash/fp";
import type { CatalogEntity } from "../../../../common/catalog";

const catalogEntityDetailItemsInjectable = getInjectable({
  id: "catalog-entity-detail-items",

  instantiate: (di, catalogEntity: CatalogEntity) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => {
      const enabledExtensions = extensions.get();

      return pipeline(
        di.injectMany(catalogEntityDetailItemInjectionToken),

        filter((item) =>
          overSome([
            isNonExtensionItem,
            isEnabledExtensionItemFor(enabledExtensions),
          ])(item),
        ),

        filter(item =>
          conforms({
            kind: eq(catalogEntity.kind),
            apiVersions: includes(catalogEntity.apiVersion),
          })(item),
        ),

        items => sortBy("orderNumber", items),
      );
    });
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, catalogEntity: CatalogEntity) =>
      `${catalogEntity.kind}/${catalogEntity.apiVersion}`,
  }),
});

const isNonExtensionItem = (item: CatalogEntityDetailItem<CatalogEntity>) =>
  !item.extension;

const isEnabledExtensionItemFor =
  (enabledExtensions: LensRendererExtension[]) =>
    (item: CatalogEntityDetailItem<CatalogEntity>) =>
      !!enabledExtensions.find((extension) => extension === item.extension);

export default catalogEntityDetailItemsInjectable;
