/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { forEach } from "lodash/fp";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { catalogEntityDetailItemInjectionToken } from "./catalog-entity-detail-item-injection-token";

const extensionCatalogEntityDetailItemsRegistratorInjectable = getInjectable({
  id: "extension-catalog-entity-detail-items-registrator",

  instantiate:
    (di) => (extension: LensRendererExtension, installationCounter) => {
      pipeline(
        extension.catalogEntityDetailItems.map((registration, index) =>
          getInjectable({
            id: `catalog-entity-detail-item-${index}-from-${extension.sanitizedExtensionId}-instance-${installationCounter}`,

            instantiate: () => ({
              apiVersions: registration.apiVersions,
              kind: registration.kind,

              components: {
                Details: registration.components.Details,
              },

              orderNumber: -registration.priority || -50,
              extension,
            }),

            injectionToken: catalogEntityDetailItemInjectionToken,
          }),
        ),

        forEach(di.register),
      );
    },

  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionCatalogEntityDetailItemsRegistratorInjectable;
