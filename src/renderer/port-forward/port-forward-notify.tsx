/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Button } from "../components/button";
import { Notifications, notificationsStore } from "../components/notifications";
import { getHostedClusterId } from "../utils";
import type { NavigateToPortForwards } from "../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";

interface AboutPortForwardingDependencies {
  navigateToPortForwards: NavigateToPortForwards;
}

export const aboutPortForwarding = ({ navigateToPortForwards }: AboutPortForwardingDependencies) => () => {
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
              navigateToPortForwards();
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
};

interface NotifyErrorPortForwardingDependencies {
  navigateToPortForwards: NavigateToPortForwards;
}


export const notifyErrorPortForwarding = ({ navigateToPortForwards }: NotifyErrorPortForwardingDependencies) => (msg: string) => {
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
              navigateToPortForwards();
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
};

