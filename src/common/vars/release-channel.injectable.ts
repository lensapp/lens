/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ReleaseChannel } from "../application-update/update-channels";
import buildSemanticVersionInjectable from "./build-semantic-version.injectable";

const releaseChannelInjectable = getInjectable({
  id: "release-channel",
  instantiate: (di): ReleaseChannel => {
    const buildSemanticVersion = di.inject(buildSemanticVersionInjectable);
    const currentReleaseChannel = buildSemanticVersion.get().prerelease[0];

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
