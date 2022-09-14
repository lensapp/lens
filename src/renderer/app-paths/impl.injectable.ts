/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { appPathsChannel } from "../../common/app-paths/channel";
import { appPathsInjectionToken } from "../../common/app-paths/token";
import { createInitializableState } from "../../common/initializable-state/create";
import { requestFromChannelInjectionToken } from "../../common/utils/channel/request-from-channel-injection-token";

const appPathsInjectable = createInitializableState({
  id: "app-paths",
  init: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return requestFromChannel(appPathsChannel);
  },
  injectionToken: appPathsInjectionToken,
});

export default appPathsInjectable;
