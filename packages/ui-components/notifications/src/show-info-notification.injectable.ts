/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ShowNotification } from "./notifications";
import { NotificationStatus } from "./notifications.store";
import { notificationsStoreInjectable } from "./notifications-store.injectable";

export const showInfoNotificationInjectable = getInjectable({
  id: "show-info-notification",

  instantiate: (di): ShowNotification => {
    const notificationsStore = di.inject(notificationsStoreInjectable);

    return (message, customOpts = {}) =>
      notificationsStore.add({
        status: NotificationStatus.INFO,
        message,
        ...customOpts,
      });
  },
});
