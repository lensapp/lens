/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../application-menu-item-injection-token";

const editMenuItemInjectable = getInjectable({
  id: "edit-application-menu-item",

  instantiate: () => ({
    kind: "top-level-menu" as const,
    id: "edit",
    parentId: "root" as const,
    orderNumber: 30,
    label: "Edit",
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export default editMenuItemInjectable;
