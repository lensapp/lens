/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { enlistMessageChannelListenerFor, enlistMessageChannelListenerInjectionToken } from "../../../../common/utils/channel/enlist-message-channel-listener-injection-token";
import ipcMainInjectionToken from "../../../../common/ipc/ipc-main-injection-token";

const enlistMessageChannelListenerInjectable = getInjectable({
  id: "enlist-message-channel-listener-for-main",
  instantiate: (di) => enlistMessageChannelListenerFor(di.inject(ipcMainInjectionToken)),
  injectionToken: enlistMessageChannelListenerInjectionToken,
});

export default enlistMessageChannelListenerInjectable;
