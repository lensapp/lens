/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { notifyErrorPortForwarding } from "./port-forward-notify";
import navigateToPortForwardsInjectable from "../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";
import hostedClusterIdInjectable from "../cluster/hosted-cluster-id.injectable";
import assert from "assert";

const notifyErrorPortForwardingInjectable = getInjectable({
  id: "notify-error-port-forwarding",

  instantiate: (di) => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);

    assert(hostedClusterId, "Only allowed to notify about port forward errors within a cluster frame");

    return notifyErrorPortForwarding({
      navigateToPortForwards: di.inject(navigateToPortForwardsInjectable),
      hostedClusterId,
    });
  },
});

export default notifyErrorPortForwardingInjectable;
