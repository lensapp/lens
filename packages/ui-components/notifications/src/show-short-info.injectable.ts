/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { ShowNotification } from "./notifications";
import { showInfoNotificationInjectable } from "./show-info-notification.injectable";

export const showShortInfoNotificationInjectable = getInjectable({
  id: "show-short-info-notification",
  instantiate: (di): ShowNotification => {
    const showInfoNotification = di.inject(showInfoNotificationInjectable);

    return (message, customOpts = {}) => {
      return showInfoNotification(message, {
        timeout: 5_000,
        ...customOpts,
      });
    };
  },
});
