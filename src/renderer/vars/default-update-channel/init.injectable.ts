/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import defaultUpdateChannelInjectable from "../../../common/application-update/selected-update-channel/default-update-channel.injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";
import initReleaseChannelInjectable from "../release-channel/init.injectable";

const initDefaultUpdateChannelInjectableInjectable = getInjectable({
  id: "init-default-update-channel-injectable",
  instantiate: (di) => {
    const defaultUpdateChannel = di.inject(defaultUpdateChannelInjectable);

    return {
      run: () => defaultUpdateChannel.init(),
      runAfter: di.inject(initReleaseChannelInjectable),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initDefaultUpdateChannelInjectableInjectable;
