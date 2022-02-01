/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { appPathsInjectionChannelToken, appPathsIpcChannel } from "../../common/app-paths/app-path-channel-injection-token";
import registerChannelInjectable from "../communication/register-channel.injectable";
import type { Channel } from "../../common/communication/channel";
import type { AppPaths } from "../../common/app-paths/app-paths";
import { appPathsInjectionToken } from "../../common/app-paths/app-path-injection-token";

let channel: Channel<[], AppPaths>;

const appPathsInjectable = getInjectable({
  setup: (di) => {
    const appPaths = di.inject(appPathsInjectionToken);
    const registerChannel = di.inject(registerChannelInjectable);

    channel = registerChannel(appPathsIpcChannel, () => appPaths);
  },
  instantiate: () => channel,
  injectionToken: appPathsInjectionChannelToken,
  lifecycle: lifecycleEnum.singleton,
});

export default appPathsInjectable;
