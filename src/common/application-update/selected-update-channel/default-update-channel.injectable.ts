/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import appVersionInjectable from "../../get-configuration-file-model/app-version/app-version.injectable";
import type { UpdateChannelId } from "../update-channels";
import { updateChannels } from "../update-channels";

const defaultUpdateChannelInjectable = getInjectable({
  id: "default-update-channel",

  instantiate: (di) => {
    const appVersion = di.inject(appVersionInjectable);

    const currentReleaseChannel = new SemVer(appVersion).prerelease[0]?.toString() as UpdateChannelId;

    if (currentReleaseChannel && updateChannels[currentReleaseChannel]) {
      return updateChannels[currentReleaseChannel];
    }

    return updateChannels.latest;
  },
});

export default defaultUpdateChannelInjectable;
