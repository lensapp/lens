/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { notifyErrorPortForwarding } from "./port-forward-notify";
import navigateToPortForwardsInjectable from "../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";

const notifyErrorPortForwardingInjectable = getInjectable({
  id: "notify-error-port-forwarding",

  instantiate: (di) =>
    notifyErrorPortForwarding({
      navigateToPortForwards: di.inject(navigateToPortForwardsInjectable),
    }),
});

export default notifyErrorPortForwardingInjectable;
