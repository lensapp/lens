/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import { rootFrameHasRenderedChannel } from "../../../../common/root-frame/root-frame-rendered-channel";
import { runManyFor } from "@k8slens/run-many";
import { afterRootFrameIsReadyInjectionToken } from "../../runnable-tokens/phases";

const rootFrameRenderedChannelListenerInjectable = getMessageChannelListenerInjectable({
  id: "action",
  channel: rootFrameHasRenderedChannel,
  getHandler: (di) => {
    const runMany = runManyFor(di);
    const runManyAfterRootFrameIsReady = runMany(afterRootFrameIsReadyInjectionToken);

    return () => void runManyAfterRootFrameIsReady();
  },
});

export default rootFrameRenderedChannelListenerInjectable;
