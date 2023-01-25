/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { restartAndInstallUpdateChannel } from "../../common/restart-and-install-update-channel";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import quitAndInstallUpdateInjectable from "../quit-and-install-update.injectable";

const restartAndInstallUpdateListenerInjectable = getMessageChannelListenerInjectable({
  id: "restart",
  channel: restartAndInstallUpdateChannel,
  handler: (di) => di.inject(quitAndInstallUpdateInjectable),
});

export default restartAndInstallUpdateListenerInjectable;
