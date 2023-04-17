/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import defaultUpdateChannelInjectable from "../../../features/application-update/common/selected-update-channel/default-update-channel.injectable";
import { semanticBuildVersionInitializationInjectable } from "../../../features/vars/semantic-build-version/main/init.injectable";

const initDefaultUpdateChannelInjectable = getInjectable({
  id: "init-default-update-channel",
  instantiate: (di) => ({
    run: async () => {
      const defaultUpdateChannel = di.inject(defaultUpdateChannelInjectable);

      await defaultUpdateChannel.init();
    },
    runAfter: semanticBuildVersionInitializationInjectable,
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initDefaultUpdateChannelInjectable;
