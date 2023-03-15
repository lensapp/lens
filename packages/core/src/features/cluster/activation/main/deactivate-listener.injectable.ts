/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import { deactivateClusterChannel } from "../common/channels";
import requestClusterDeactivationInjectable from "./request-deactivation.injectable";

const clusterDeactivationRequestChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: deactivateClusterChannel,
  handler: (di) => di.inject(requestClusterDeactivationInjectable),
});

export default clusterDeactivationRequestChannelListenerInjectable;
