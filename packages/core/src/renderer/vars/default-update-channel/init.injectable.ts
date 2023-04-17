/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../before-frame-starts/tokens";
import defaultUpdateChannelInjectable from "../../../features/application-update/common/selected-update-channel/default-update-channel.injectable";
import { buildVersionInitializationInjectable } from "../../../features/vars/build-version/renderer/init.injectable";

const initDefaultUpdateChannelInjectable = getInjectable({
  id: "init-default-update-channel",
  instantiate: (di) => ({
    run: async () => {
      const defaultUpdateChannel = di.inject(defaultUpdateChannelInjectable);

      await defaultUpdateChannel.init();
    },
    runAfter: buildVersionInitializationInjectable,
  }),
  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default initDefaultUpdateChannelInjectable;
