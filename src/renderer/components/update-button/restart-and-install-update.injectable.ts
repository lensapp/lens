/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { restartAndInstallUpdateChannel } from "../../../common/application-update/restart-and-install-update-channel";
import messageToChannelInjectable from "../../utils/channel/message-to-channel.injectable";

const restartAndInstallUpdateInjectable = getInjectable({
  id: "restart-and-install-update",

  instantiate: (di) => {
    const messageToChannel = di.inject(messageToChannelInjectable);

    return () => {
      messageToChannel(restartAndInstallUpdateChannel);
    };
  },
});

export default restartAndInstallUpdateInjectable;
