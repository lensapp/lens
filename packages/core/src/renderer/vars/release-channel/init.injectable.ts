/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import releaseChannelInjectable from "../../../common/vars/release-channel.injectable";
import { semanticBuildVersionInitializationInjectable } from "../../../features/vars/semantic-build-version/renderer/init.injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";

const initReleaseChannelInjectable = getInjectable({
  id: "init-release-channel",
  instantiate: (di) => ({
    run: async () => {
      const releaseChannel = di.inject(releaseChannelInjectable);

      await releaseChannel.init();
    },
    runAfter: semanticBuildVersionInitializationInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initReleaseChannelInjectable;
