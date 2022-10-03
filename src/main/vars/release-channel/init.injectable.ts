/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import releaseChannelInjectable from "../../../common/vars/release-channel.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import initSemanticBuildVersionInjectable from "../semantic-build-version/init.injectable";

const initReleaseChannelInjectable = getInjectable({
  id: "init-release-channel",
  instantiate: (di) => {
    const releaseChannel = di.inject(releaseChannelInjectable);

    return {
      id: "init-release-channel",
      run: () => releaseChannel.init(),
      runAfter: di.inject(initSemanticBuildVersionInjectable),
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initReleaseChannelInjectable;
