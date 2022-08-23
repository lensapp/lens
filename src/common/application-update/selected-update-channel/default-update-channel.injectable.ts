/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appSemanticVersionInjectable from "../../vars/app-semantic-version.injectable";
import type { UpdateChannelId } from "../update-channels";
import { updateChannels } from "../update-channels";

const defaultUpdateChannelInjectable = getInjectable({
  id: "default-update-channel",

  instantiate: (di) => {
    const appSemanticVersion = di.inject(appSemanticVersionInjectable);
    const currentReleaseChannel = appSemanticVersion.prerelease[0]?.toString();

    if (currentReleaseChannel in updateChannels) {
      return updateChannels[currentReleaseChannel as UpdateChannelId];
    }

    return updateChannels.latest;
  },
});

export default defaultUpdateChannelInjectable;
