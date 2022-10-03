/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";

const id = "separator-after-extensions";

const separatorAfterExtensionsInjectable = getInjectable({
  id,

  instantiate: () => ({
    id,
    parentId: "primary-for-mac",
    type: "separator" as const,
    orderNumber: 70,
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export default separatorAfterExtensionsInjectable;
