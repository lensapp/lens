/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { UpdateChannelId } from "../application-update/update-channels";
import appSemanticVersionInjectable from "./app-semantic-version.injectable";

const releaseChannelInjectable = getInjectable({
  id: "release-channel",
  instantiate: (di): UpdateChannelId => {
    const appSemanticVersion = di.inject(appSemanticVersionInjectable);
    const currentReleaseChannel = appSemanticVersion.prerelease[0];

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
