/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { restartAndInstallUpdateChannel } from "../../common/restart-and-install-update-channel";
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import quitAndInstallUpdateInjectable from "../quit-and-install-update.injectable";

const restartAndInstallUpdateListenerInjectable = getMessageChannelListenerInjectable({
  id: "restart",
  channel: restartAndInstallUpdateChannel,
  getHandler: (di) => di.inject(quitAndInstallUpdateInjectable),
});

export default restartAndInstallUpdateListenerInjectable;
