/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createLazyInitializableState } from "../initializable-state/create-lazy";
import buildSemanticVersionInjectable from "./build-semantic-version.injectable";
import type { ReleaseChannel } from "../../features/application-update/common/update-channels";

const releaseChannelInjectable = createLazyInitializableState({
  id: "release-channel",
  init: (di): ReleaseChannel => {
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
