/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../application-menu-item-injection-token";

const helpMenuItemInjectable = getInjectable({
  id: "help-application-menu-item",

  instantiate: () => ({
    parentId: null,
    id: "help",
    orderNumber: 50,
    label: "Help",
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export default helpMenuItemInjectable;
