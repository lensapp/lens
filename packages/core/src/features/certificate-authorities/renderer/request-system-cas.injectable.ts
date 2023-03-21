/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestFromChannelInjectionToken } from "@k8slens/messaging";
import { casChannel } from "../common/channel";
import { requestSystemCAsInjectionToken } from "../common/request-system-cas-token";

const requestSystemCAsInjectable = getInjectable({
  id: "request-system-cas",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return () => requestFromChannel(casChannel);
  },
  injectionToken: requestSystemCAsInjectionToken,
});

export default requestSystemCAsInjectable;
