/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";

export const separatorAfterCheckForUpdatesInjectable = getInjectable({
  id: "separator-after-check-for-updates",

  instantiate: () => ({
    id: "separator-after-check-for-updates",
    parentId: "primary-for-mac",
    type: "separator" as const,
    orderNumber: 30,
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export const separatorAfterExtensionsInjectable = getInjectable({
  id: "separator-after-extensions",

  instantiate: () => ({
    id: "separator-after-extensions",
    parentId: "primary-for-mac",
    type: "separator" as const,
    orderNumber: 70,
  }),

  injectionToken: applicationMenuItemInjectionToken,
});
