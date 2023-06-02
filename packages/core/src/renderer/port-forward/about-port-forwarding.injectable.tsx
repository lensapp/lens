/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import React from "react";
import navigateToPortForwardsInjectable from "../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";
import { Button } from "@k8slens/button";
import { showSuccessNotificationInjectable } from "@k8slens/notifications";

const aboutPortForwardingInjectable = getInjectable({
  id: "about-port-forwarding",

  instantiate: (di) => {
    const showSuccessNotification = di.inject(showSuccessNotificationInjectable);
    const navigateToPortForwards = di.inject(navigateToPortForwardsInjectable);

    return () => {
      const removeNotification = showSuccessNotification(
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
                  removeNotification();
                }}
              />
            </div>
          </div>
        ),
        {
          id: "port-forward-notification",
          timeout: 10_000,
        },
      );
    };
  },
});

export default aboutPortForwardingInjectable;
