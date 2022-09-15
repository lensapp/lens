/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createInitializableState } from "../../initializable-state/create";
import releaseChannelInjectable from "../../vars/release-channel.injectable";
import { updateChannels } from "../update-channels";

const defaultUpdateChannelInjectable = createInitializableState({
  id: "default-update-channel",
  init: (di) => updateChannels[di.inject(releaseChannelInjectable)],
});

export default defaultUpdateChannelInjectable;
