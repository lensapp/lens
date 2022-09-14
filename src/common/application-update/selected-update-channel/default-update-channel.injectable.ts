/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import releaseChannelInjectable from "../../vars/release-channel.injectable";
import { updateChannels } from "../update-channels";

const defaultUpdateChannelInjectable = getInjectable({
  id: "default-update-channel",
  instantiate: (di) => updateChannels[di.inject(releaseChannelInjectable)],
});

export default defaultUpdateChannelInjectable;
