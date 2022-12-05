/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsInjectionToken } from "../../../before-frame-starts/tokens";
import listeningOnMessageChannelsInjectable from "../../../../common/utils/channel/listening-on-message-channels.injectable";
import setupAppPathsInjectable from "../../../app-paths/setup-app-paths.injectable";

const startListeningOfChannelsInjectable = getInjectable({
  id: "start-listening-of-channels-renderer",

  instantiate: (di) => ({
    id: "start-listening-of-channels-renderer",
    run: () => {
      const listeningOfChannels = di.inject(listeningOnMessageChannelsInjectable);

      listeningOfChannels.start();
    },
    runAfter: di.inject(setupAppPathsInjectable),
  }),

  injectionToken: beforeFrameStartsInjectionToken,
});

export default startListeningOfChannelsInjectable;
