/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { aboutPortForwarding } from "./port-forward-notify";
import navigateToPortForwardsInjectable from "../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";
import hostedClusterIdInjectable from "../../common/cluster-store/hosted-cluster-id.injectable";
import assert from "assert";
import notificationsStoreInjectable from "../components/notifications/notifications-store.injectable";

const aboutPortForwardingInjectable = getInjectable({
  id: "about-port-forwarding",

  instantiate: (di) => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const notificationsStore = di.inject(notificationsStoreInjectable);
    const navigateToPortForwards = di.inject(navigateToPortForwardsInjectable);

    assert(hostedClusterId, "Only allowed to notify about port forward errors within a cluster frame");

    return aboutPortForwarding({
      navigateToPortForwards,
      hostedClusterId,
      notificationsStore,
    });
  },
});

export default aboutPortForwardingInjectable;
