/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import { rootFrameHasRenderedChannel } from "../../../../common/root-frame/root-frame-rendered-channel";
import rootFrameHasRenderedHandlerInjectable from "./handler.injectable";

const rootFrameRenderedChannelListenerInjectable = getMessageChannelListenerInjectable({
  channel: rootFrameHasRenderedChannel,
  handlerInjectable: rootFrameHasRenderedHandlerInjectable,
});

export default rootFrameRenderedChannelListenerInjectable;
