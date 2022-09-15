/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { requestChannelListenerInjectionToken } from "../../common/utils/channel/request-channel-listener-injection-token";
import { buildVersionChannel } from "../../common/vars/build-semantic-version.injectable";
import buildVersionInjectable from "../vars/build-version/build-version.injectable";

const setupBuildVersionRequestChannelInjectable = getInjectable({
  id: "setup-build-version-request-channel",
  instantiate: (di) => {
    const buildVersion = di.inject(buildVersionInjectable);

    return {
      channel: buildVersionChannel,
      handler: () => buildVersion.get(),
    };
  },
  injectionToken: requestChannelListenerInjectionToken,
});

export default setupBuildVersionRequestChannelInjectable;
