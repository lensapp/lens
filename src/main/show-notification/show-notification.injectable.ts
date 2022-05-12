/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationWindowInjectable from "../start-main-application/lens-window/application-window/application-window.injectable";
import { notificationChannel } from "../../common/notification/notification-channel";

const showNotificationInjectable = getInjectable({
  id: "show-notification",

  instantiate: (di) => {
    const applicationWindow = di.inject(applicationWindowInjectable);

    return (message: string) => {
      applicationWindow.send({ channel: notificationChannel.name, data: [message] });
    };
  },
});

export default showNotificationInjectable;
