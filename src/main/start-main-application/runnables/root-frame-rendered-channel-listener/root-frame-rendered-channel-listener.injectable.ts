/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import rootFrameRenderedChannelInjectable from "../../../../common/root-frame-rendered-channel/root-frame-rendered-channel.injectable";
import { runManyFor } from "../../../../common/runnable/run-many-for";
import { afterRootFrameIsReadyInjectionToken } from "../../runnable-tokens/after-root-frame-is-ready-injection-token";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";

const rootFrameRenderedChannelListenerInjectable = getMessageChannelListenerInjectable(rootFrameRenderedChannelInjectable, (di) => {
  const runMany = runManyFor(di);
  const runRunnablesAfterRootFrameIsReady = runMany(afterRootFrameIsReadyInjectionToken);

  return () => runRunnablesAfterRootFrameIsReady();
});

export default rootFrameRenderedChannelListenerInjectable;
