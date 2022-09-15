/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import defaultUpdateChannelInjectable from "../../../common/application-update/selected-update-channel/default-update-channel.injectable";
import initSemanticBuildVersionInjectable from "../../../renderer/vars/semantic-build-version/init.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/before-application-is-loading-injection-token";

const initDefaultUpdateChannelInjectableInjectable = getInjectable({
  id: "init-default-update-channel-injectable",
  instantiate: (di) => {
    const defaultUpdateChannel = di.inject(defaultUpdateChannelInjectable);

    return {
      run: () => defaultUpdateChannel.init(),
      runAfter: di.inject(initSemanticBuildVersionInjectable),
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initDefaultUpdateChannelInjectableInjectable;
