/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { ipcRendererOn } from "../../common/ipc";

const legacyOnChannelListenInjectable = getInjectable({
  id: "legacy-on-channel-listen",
  instantiate: () => ipcRendererOn,
  causesSideEffects: true,
});

export default legacyOnChannelListenInjectable;
