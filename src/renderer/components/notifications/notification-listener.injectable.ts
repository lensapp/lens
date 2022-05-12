/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ipcChannelListenerInjectionToken } from "../../ipc-channel-listeners/ipc-channel-listener-injection-token";
import { notificationChannel } from "../../../common/notification/notification-channel";
import { Notifications } from "./index";

const notificationListenerInjectable = getInjectable({
  id: "notification-listener",

  instantiate: () => ({
    channel: notificationChannel,

    handle: (message: string) => {
      Notifications.shortInfo(message);
    },
  }),

  causesSideEffects: true,

  injectionToken: ipcChannelListenerInjectionToken,
});

export default notificationListenerInjectable;
