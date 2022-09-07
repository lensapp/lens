/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runInAction } from "mobx";
import { requestFromChannelInjectionToken } from "../../common/utils/channel/request-from-channel-injection-token";
import { buildVersionChannel, buildVersionInjectionToken } from "../../common/vars/build-semantic-version.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";

const setupBuildVersionInjectable = getInjectable({
  id: "setup-build-version",
  instantiate: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return {
      run: async () => {
        const buildVersion = await requestFromChannel(buildVersionChannel);

        runInAction(() => {
          di.register(getInjectable({
            id: "build-version",
            instantiate: () => buildVersion,
            injectionToken: buildVersionInjectionToken,
          }));
        });
      },
    };
  },
  injectionToken: beforeFrameStartsInjectionToken,
});

export default setupBuildVersionInjectable;
