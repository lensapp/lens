/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import { activateClusterChannel } from "../common/channels";
import requestClusterActivationInjectable from "./request-activation.injectable";

const activateClusterRequestChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: activateClusterChannel,
  handler: (di) => di.inject(requestClusterActivationInjectable),
});

export default activateClusterRequestChannelListenerInjectable;
