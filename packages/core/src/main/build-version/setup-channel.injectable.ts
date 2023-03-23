/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { buildVersionChannel } from "../../common/vars/build-semantic-version.injectable";
import { getRequestChannelListenerInjectable } from "@k8slens/messaging";
import buildVersionInjectable from "../vars/build-version/build-version.injectable";

const buildVersionChannelListenerInjectable = getRequestChannelListenerInjectable({
  id: "build-version-channel-listener",
  channel: buildVersionChannel,
  getHandler: (di) => {
    const buildVersion = di.inject(buildVersionInjectable);

    return () => buildVersion.get();
  },
});

export default buildVersionChannelListenerInjectable;
