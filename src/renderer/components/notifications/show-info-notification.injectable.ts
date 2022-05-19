/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { notificationsStore, NotificationStatus } from "./notifications.store";

const showInfoNotificationInjectable = getInjectable({
  id: "show-info-notification",

  instantiate: () => (message: string) =>
    notificationsStore.add({
      status: NotificationStatus.INFO,
      timeout: 5000,
      message,
    }),

  causesSideEffects: true,
});

export default showInfoNotificationInjectable;
