/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { updateChannels } from "../update-channels";
import { createInitializableState } from "../../../../common/initializable-state/create";
import releaseChannelInjectable from "../../../vars/common/release-channel.injectable";

const defaultUpdateChannelInjectable = createInitializableState({
  id: "default-update-channel",
  init: (di) => updateChannels[di.inject(releaseChannelInjectable)],
});

export default defaultUpdateChannelInjectable;
