/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { buildVersionChannel } from "../../common/vars/build-semantic-version.injectable";
import { getRequestChannelListenerInjectable } from "../utils/channel/channel-listeners/listener-tokens";
import buildVersionInjectable from "../vars/build-version/build-version.injectable";

const buildVersionChannelListenerInjectable = getRequestChannelListenerInjectable({
  channel: buildVersionChannel,
  handler: (di) => {
    const buildVersion = di.inject(buildVersionInjectable);

    return () => buildVersion.get();
  },
});

export default buildVersionChannelListenerInjectable;
