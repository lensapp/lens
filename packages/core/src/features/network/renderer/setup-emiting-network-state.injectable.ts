/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import sendNetworkGoneOfflineInjectable from "./send-network-offline.injectable";
import sendNetworkGoneOnlineInjectable from "./send-network-online.injectable";

const setupEmittingNetworkStateInjectable = getInjectable({
  id: "setup-emitting-network-state",
  instantiate: (di) => {
    const sendNetworkGoneOnline = di.inject(sendNetworkGoneOnlineInjectable);
    const sendNetworkGoneOffline = di.inject(sendNetworkGoneOfflineInjectable);

    return () => {
      window.addEventListener("offline", sendNetworkGoneOnline);
      window.addEventListener("online", sendNetworkGoneOffline);
    };
  },
  causesSideEffects: true,
});

export default setupEmittingNetworkStateInjectable;
