/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import releaseChannelInjectable from "../../../common/vars/release-channel.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import initSemanticBuildVersionInjectable from "../semantic-build-version/init.injectable";

const initReleaseChannelInjectable = getInjectable({
  id: "init-release-channel",
  instantiate: (di) => {
    const releaseChannel = di.inject(releaseChannelInjectable);

    return {
      run: async () => await releaseChannel.init(),
      runAfter: initSemanticBuildVersionInjectable,
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initReleaseChannelInjectable;
