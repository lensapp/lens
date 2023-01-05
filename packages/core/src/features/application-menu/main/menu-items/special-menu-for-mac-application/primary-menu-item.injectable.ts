/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../application-menu-item-injection-token";
import appNameInjectable from "../../../../../common/vars/app-name.injectable";
import isMacInjectable from "../../../../../common/vars/is-mac.injectable";

const primaryMenuItemInjectable = getInjectable({
  id: "primary-application-menu-item",

  instantiate: (di) => {
    const appName = di.inject(appNameInjectable);
    const isMac = di.inject(isMacInjectable);

    return {
      kind: "top-level-menu" as const,
      parentId: "root" as const,
      id: "mac",
      orderNumber: 10,
      label: appName,
      isShown: isMac,
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default primaryMenuItemInjectable;
