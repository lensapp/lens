/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../application-menu-item-injection-token";

const viewMenuItemInjectable = getInjectable({
  id: "view-application-menu-item",

  instantiate: () => ({
    parentId: null,
    id: "view",
    orderNumber: 40,
    label: "View",
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export default viewMenuItemInjectable;
