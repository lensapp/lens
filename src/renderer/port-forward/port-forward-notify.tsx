/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { portForwardsURL } from "../../common/routes/port-forwards";
import { Button } from "../components/button";
import { Notifications, notificationsStore } from "../components/notifications";
import { navigate } from "../navigation";
import { getHostedClusterId } from "../utils";


export function aboutPortForwarding() {
  const notificationId = `port-forward-notification-${getHostedClusterId()}`;

  Notifications.info(
    (
      <div className="flex column gaps">
        <b>Port Forwarding</b>
        <p>
            You can manage your port forwards on the Port Forwarding Page.
        </p>
        <div className="flex gaps row align-left box grow">
          <Button
            active
            outlined
            label="Go to Port Forwarding"
            onClick={() => {
              navigate(portForwardsURL());
              notificationsStore.remove(notificationId);
            }}
          />
        </div>
      </div>
    ),
    {
      id: notificationId,
      timeout: 10_000,
    },
  );
}

export function notifyErrorPortForwarding(msg: string) {
  const notificationId = `port-forward-error-notification-${getHostedClusterId()}`;

  Notifications.error(
    (
      <div className="flex column gaps">
        <b>Port Forwarding</b>
        <p>
          {msg}
        </p>
        <div className="flex gaps row align-left box grow">
          <Button
            active
            outlined
            label="Check Port Forwarding"
            onClick={() => {
              navigate(portForwardsURL());
              notificationsStore.remove(notificationId);
            }}
          />
        </div>
      </div>
    ),
    {
      id: notificationId,
      timeout: 10_000,
    },
  );
}

