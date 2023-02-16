/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autorun } from "mobx";
import { sendMessageToChannelInjectionToken } from "../../../../common/utils/channel/message-to-channel-injection-token";
import { beforeFrameStartsFirstInjectionToken } from "../../../../renderer/before-frame-starts/tokens";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import { extensionStateUpdatesChannel } from "../common/channels";

const setupInstalledExtensionsBroadcastingInjectable = getInjectable({
  id: "setup-installed-extensions-broadcasting",
  instantiate: (di) => ({
    id: "setup-installed-extensions-broadcasting",
    run: () => {
      const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);
      const installedExtensions = di.inject(installedExtensionsInjectable);

      autorun(() => sendMessageToChannel(extensionStateUpdatesChannel, installedExtensions.toJSON()));
    },
  }),
  injectionToken: beforeFrameStartsFirstInjectionToken,
});

export default setupInstalledExtensionsBroadcastingInjectable;
