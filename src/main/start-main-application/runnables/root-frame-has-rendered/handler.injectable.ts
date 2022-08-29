/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RootFrameHasRenderedChannel } from "../../../../common/root-frame/root-frame-rendered-channel";
import { runManyFor } from "../../../../common/runnable/run-many-for";
import type { MessageChannelHandler } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { afterRootFrameIsReadyInjectionToken } from "../../runnable-tokens/after-root-frame-is-ready-injection-token";

const rootFrameHasRenderedHandlerInjectable = getInjectable({
  id: "root-frame-has-rendered-handler",
  instantiate: (di): MessageChannelHandler<RootFrameHasRenderedChannel> => {
    const runMany = runManyFor(di);

    return runMany(afterRootFrameIsReadyInjectionToken);
  },
});

export default rootFrameHasRenderedHandlerInjectable;
