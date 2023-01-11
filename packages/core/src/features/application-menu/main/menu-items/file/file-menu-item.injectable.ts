/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../application-menu-item-injection-token";

const fileMenuItemInjectable = getInjectable({
  id: "file-application-menu-item",

  instantiate: () => ({
    kind: "top-level-menu" as const,
    id: "file",
    parentId: "root" as const,
    orderNumber: 20,
    label: "File",
  }),

  injectionToken: applicationMenuItemInjectionToken,
});

export default fileMenuItemInjectable;
