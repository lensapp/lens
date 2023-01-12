/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import requestFromChannelInjectable from "../../../renderer/utils/channel/request-from-channel.injectable";
import { authHeaderChannel } from "../common/channel";

const requestAuthHeaderValueInjectable = getInjectable({
  id: "request-auth-header-value",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectable);

    return () => requestFromChannel(authHeaderChannel);
  },
});

export default requestAuthHeaderValueInjectable;
