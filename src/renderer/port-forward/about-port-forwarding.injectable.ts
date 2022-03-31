/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { aboutPortForwarding } from "./port-forward-notify";
import navigateToPortForwardsInjectable from "../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";

const aboutPortForwardingInjectable = getInjectable({
  id: "about-port-forwarding",

  instantiate: (di) =>
    aboutPortForwarding({
      navigateToPortForwards: di.inject(navigateToPortForwardsInjectable),
    }),
});

export default aboutPortForwardingInjectable;
