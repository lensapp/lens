/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { MessageChannelHandler } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import type { ReloadPageChannel } from "../common/channel";

const reloadPageHandlerInjectable = getInjectable({
  id: "reload-page-handler",
  instantiate: (): MessageChannelHandler<ReloadPageChannel> => {
    return () => location.reload();
  },
  causesSideEffects: true,
});

export default reloadPageHandlerInjectable;
