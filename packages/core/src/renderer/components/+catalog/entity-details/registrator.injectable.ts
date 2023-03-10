/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import type { CatalogEntity } from "../../../api/catalog-entity";
import * as uuid from "uuid";
import type { CatalogEntityDetailRegistration } from "./token";
import { catalogEntityDetailItemInjectionToken } from "./token";

const catalogEntityDetailItemsRegistratorInjectable = getInjectable({
  id: "catalog-entity-detail-items-registrator",
  instantiate: () => (ext) => {
    const extension = ext as LensRendererExtension;

    return extension.catalogEntityDetailItems.map(getRegistratorFor(extension));
  },
  injectionToken: extensionRegistratorInjectionToken,
});

export default catalogEntityDetailItemsRegistratorInjectable;

const getRegistratorFor = (extension: LensRendererExtension) => ({
  apiVersions,
  components,
  kind,
  priority,
}: CatalogEntityDetailRegistration<CatalogEntity>) => getInjectable({
  id: `catalog-entity-detail-item-for-${extension.sanitizedExtensionId}-${uuid.v4()}`,
  instantiate: () => ({
    apiVersions: new Set(apiVersions),
    components,
    kind,
    orderNumber: priority ?? 50,
  }),
  injectionToken: catalogEntityDetailItemInjectionToken,
});
