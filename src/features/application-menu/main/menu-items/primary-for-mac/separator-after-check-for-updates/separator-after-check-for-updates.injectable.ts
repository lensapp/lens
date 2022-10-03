/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";

const separatorAfterCheckForUpdatesInjectable = getInjectable({
  id: "separator-after-check-for-updates",

  instantiate: () => ({
    id: "separator-after-check-for-updates",
    parentId: "primary-for-mac",
    type: "separator" as const,
    orderNumber: 30,
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export default separatorAfterCheckForUpdatesInjectable;
