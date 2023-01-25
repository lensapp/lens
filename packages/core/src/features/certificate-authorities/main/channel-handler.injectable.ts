/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../main/utils/channel/channel-listeners/listener-tokens";
import { casChannel } from "../common/channel";
import { globalAgent } from "https";
import { isString } from "../../../common/utils";

const certificateAuthoritiesChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: casChannel,
  handler: () => () => {
    if (Array.isArray(globalAgent.options.ca)) {
      return globalAgent.options.ca.filter(isString);
    }

    if (typeof globalAgent.options.ca === "string") {
      return [globalAgent.options.ca];
    }

    return [];
  },
});

export default certificateAuthoritiesChannelListenerInjectable;
