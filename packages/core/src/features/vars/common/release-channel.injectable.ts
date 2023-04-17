/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import semanticBuildVersionInjectable from "./semantic-build-version.injectable";

const releaseChannelInjectable = getInjectable({
  id: "release-channel",
  instantiate: (di) => {
    const buildSemanticVersion = di.inject(semanticBuildVersionInjectable);
    const currentReleaseChannel = buildSemanticVersion.prerelease[0];

    switch (currentReleaseChannel) {
      case "latest":
      case "beta":
      case "alpha":
        return currentReleaseChannel;
      default:
        return "latest";
    }
  },
});

export default releaseChannelInjectable;
