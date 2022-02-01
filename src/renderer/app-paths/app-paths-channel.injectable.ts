/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { appPathsInjectionChannelToken, appPathsIpcChannel } from "../../common/app-paths/app-path-channel-injection-token";
import registerChannelInjectable from "../communication/register-channel.injectable";

const appPathsChannelInjectable = getInjectable({
  instantiate: (di) => {
    const registerChannel = di.inject(registerChannelInjectable);

    return registerChannel(appPathsIpcChannel);
  },
  injectionToken: appPathsInjectionChannelToken,
  lifecycle: lifecycleEnum.singleton,
});

export default appPathsChannelInjectable;
