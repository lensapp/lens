/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import initReleaseChannelInjectable from "../release-channel/init.injectable";
import defaultUpdateChannelInjectable from "../../../features/application-update/common/selected-update-channel/default-update-channel.injectable";

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
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initDefaultUpdateChannelInjectable;
