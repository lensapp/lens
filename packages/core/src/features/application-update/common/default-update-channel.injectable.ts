/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { updateChannels } from "./update-channels";
import releaseChannelInjectable from "../../vars/common/release-channel.injectable";
import { getInjectable } from "@ogre-tools/injectable";

const defaultUpdateChannelInjectable = getInjectable({
  id: "default-update-channel",
  instantiate: (di) => updateChannels[di.inject(releaseChannelInjectable)],
});

export default defaultUpdateChannelInjectable;
