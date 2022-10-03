/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import defaultUpdateChannelInjectable from "../../../common/application-update/selected-update-channel/default-update-channel.injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/before-frame-starts-injection-token";
import initReleaseChannelInjectable from "../release-channel/init.injectable";

const initDefaultUpdateChannelInjectable = getInjectable({
  id: "init-default-update-channel",
  instantiate: (di) => {
    const defaultUpdateChannel = di.inject(defaultUpdateChannelInjectable);

    return {
      id: "init-default-update-channel",
      run: () => defaultUpdateChannel.init(),
      runAfter: di.inject(initReleaseChannelInjectable),
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initDefaultUpdateChannelInjectable;
