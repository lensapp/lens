/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import releaseChannelInjectable from "../../../common/vars/release-channel.injectable";
import { beforeFrameStartsInjectionToken } from "../../before-frame-starts/tokens";
import initSemanticBuildVersionInjectable from "../semantic-build-version/init.injectable";

const initReleaseChannelInjectable = getInjectable({
  id: "init-release-channel",
  instantiate: (di) => ({
    id: "init-release-channel",
    run: async () => {
      const releaseChannel = di.inject(releaseChannelInjectable);

      await releaseChannel.init();
    },
    runAfter: di.inject(initSemanticBuildVersionInjectable),
  }),
  injectionToken: beforeFrameStartsInjectionToken,
});

export default initReleaseChannelInjectable;
