/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reject } from "lodash/fp";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { pipeline } from "@ogre-tools/fp";
import { topBarItemOnRightSideInjectionToken } from "../../../../renderer/components/layout/top-bar/top-bar-items/top-bar-item-injection-token";
import { computed } from "mobx";

const legacyExtensionApiRegistratorForTopBarItemsInjectable = getInjectable({
  id: "legacy-extension-api-registrator-for-top-bar-items",

  instantiate: () => (ext) => {
    const extension = ext as LensRendererExtension;

    return pipeline(
      extension.topBarItems,

      reject((registration) => !registration?.components?.Item),

      (validTopBarRegistrations) =>
        validTopBarRegistrations.map((registration, index) => {
          const id = `extension-top-bar-item-for-${extension.sanitizedExtensionId}-${index}`;

          return getInjectable({
            id,

            injectionToken: topBarItemOnRightSideInjectionToken,

            instantiate: () => ({
              id,
              isShown: computed(() => true),
              // Note: legacy extension-API does not specify order of top-bar items, and therefore an arbitrary number is used. This makes items originating from extension appear in volatile order between each other.
              orderNumber: 100,
              Component: registration.components.Item,
            }),
          });
        }),
    );
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default legacyExtensionApiRegistratorForTopBarItemsInjectable;
