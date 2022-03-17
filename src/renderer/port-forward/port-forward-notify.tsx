/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Button } from "../components/button";
import { Notifications, notificationsStore } from "../components/notifications";
import type { NavigateToPortForwards } from "../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";

interface AboutPortForwardingDependencies {
  navigateToPortForwards: NavigateToPortForwards;
  hostedClusterId: string;
}

export const aboutPortForwarding = ({
  navigateToPortForwards,
  hostedClusterId,
}: AboutPortForwardingDependencies) => () => {
  const notificationId = `port-forward-notification-${hostedClusterId}`;

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
  hostedClusterId: string;
}


export const notifyErrorPortForwarding = ({
  navigateToPortForwards,
  hostedClusterId,
}: NotifyErrorPortForwardingDependencies) => (msg: string) => {
  const notificationId = `port-forward-error-notification-${hostedClusterId}`;

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

