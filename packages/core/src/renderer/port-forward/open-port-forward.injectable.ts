/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../common/logger.injectable";
import openLinkInBrowserInjectable from "../../common/utils/open-link-in-browser.injectable";
import showErrorNotificationInjectable from "../components/notifications/show-error-notification.injectable";
import type { ForwardedPort } from "./port-forward-item";
import { portForwardAddress } from "./port-forward-utils";

export type OpenPortForward = (portForward: ForwardedPort) => void;

const openPortForwardInjectable = getInjectable({
  id: "open-port-forward",
  instantiate: (di): OpenPortForward => {
    const openLinkInBrowser = di.inject(openLinkInBrowserInjectable);
    const showErrorNotification = di.inject(showErrorNotificationInjectable);
    const logger = di.inject(loggerInjectable);

    return (portForward) => {
      const browseTo = portForwardAddress(portForward);

      openLinkInBrowser(browseTo)
        .catch(error => {
          logger.error(`failed to open in browser: ${error}`, {
            port: portForward.port,
            kind: portForward.kind,
            namespace: portForward.namespace,
            name: portForward.name,
          });
          showErrorNotification(`Failed to open ${browseTo} in browser`);
        });
    };
  },
});

export default openPortForwardInjectable;
