/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import buildSemanticVersionInjectable, { initBuildSemanticVersionOnMainInjectable, initBuildSemanticVersionOnRendererInjectable } from "./build-semantic-version.injectable";
import type { ReleaseChannel } from "../../features/application-update/common/update-channels";
import { createDependentInitializableState } from "../initializable-state/create-dependent";

const {
  value: releaseChannelInjectable,
  initializers: [
    initReleaseChannelOnMainInjectable,
    initReleaseChannelOnRendererInjectable,
  ],
} = createDependentInitializableState({
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
  initAfter: [
    initBuildSemanticVersionOnMainInjectable,
    initBuildSemanticVersionOnRendererInjectable,
  ],
});

export {
  initReleaseChannelOnMainInjectable,
  initReleaseChannelOnRendererInjectable,
};

export default releaseChannelInjectable;
