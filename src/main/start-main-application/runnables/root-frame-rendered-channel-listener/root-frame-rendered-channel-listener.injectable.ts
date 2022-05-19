/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { channelListenerInjectionToken } from "../../../../common/channel/channel-listener-injection-token";
import rootFrameRenderedChannelInjectable from "../../../../common/root-frame-rendered-channel/root-frame-rendered-channel.injectable";
import { runManyFor } from "../../../../common/runnable/run-many-for";
import { afterRootFrameIsReadyInjectionToken } from "../../runnable-tokens/after-root-frame-is-ready-injection-token";

const rootFrameRenderedChannelListenerInjectable = getInjectable({
  id: "root-frame-rendered-channel-listener",

  instantiate: (di) => {
    const channel = di.inject(rootFrameRenderedChannelInjectable);

    const runMany = runManyFor(di);

    const runRunnablesAfterRootFrameIsReady = runMany(
      afterRootFrameIsReadyInjectionToken,
    );

    return {
      channel,

      handler: async () => {
        await runRunnablesAfterRootFrameIsReady();
      },
    };
  },

  injectionToken: channelListenerInjectionToken,
});

export default rootFrameRenderedChannelListenerInjectable;
