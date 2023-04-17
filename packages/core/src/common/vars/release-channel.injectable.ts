/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createInitializableState } from "../initializable-state/create";
import type { ReleaseChannel } from "../../features/application-update/common/update-channels";
import { semanticBuildVersionInitializable } from "../../features/vars/semantic-build-version/common/token";

const releaseChannelInjectable = createInitializableState({
  id: "release-channel",
  init: (di): ReleaseChannel => {
    const buildSemanticVersion = di.inject(semanticBuildVersionInitializable.stateToken);
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
