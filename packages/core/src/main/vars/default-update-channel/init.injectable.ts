/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import initReleaseChannelInjectable from "../release-channel/init.injectable";
import defaultUpdateChannelInjectable from "../../../features/application-update/common/selected-update-channel/default-update-channel.injectable";

const initDefaultUpdateChannelInjectable = getInjectable({
  id: "init-default-update-channel",
  instantiate: (di) => ({
    run: async () => {
      const defaultUpdateChannel = di.inject(defaultUpdateChannelInjectable);

      await defaultUpdateChannel.init();
    },
    runAfter: initReleaseChannelInjectable,
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default initDefaultUpdateChannelInjectable;
