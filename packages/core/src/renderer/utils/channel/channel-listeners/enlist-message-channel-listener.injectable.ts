/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import ipcRendererInjectable from "../ipc-renderer.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { enlistMessageChannelListenerFor, enlistMessageChannelListenerInjectionToken } from "../../../../common/utils/channel/enlist-message-channel-listener-injection-token";

const enlistMessageChannelListenerInjectable = getInjectable({
  id: "enlist-message-channel-listener-for-renderer",
  instantiate: (di) => enlistMessageChannelListenerFor(di.inject(ipcRendererInjectable)),
  injectionToken: enlistMessageChannelListenerInjectionToken,
});

export default enlistMessageChannelListenerInjectable;
