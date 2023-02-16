/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { isEqual } from "lodash";
import { runInAction } from "mobx";
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import { extensionStateUpdatesChannel } from "./channels";

const installedExtensionUpdatesListenerInjectable = getMessageChannelListenerInjectable({
  channel: extensionStateUpdatesChannel,
  id: "main",
  handler: (di) => {
    const installedExtensions = di.inject(installedExtensionsInjectable);

    return (newState) => runInAction(() => {
      for (const [extensionId, installedExtension] of newState) {
        const oldInstalled = installedExtensions.get(extensionId);

        if (!oldInstalled || !isEqual(oldInstalled, installedExtension)) {
          installedExtensions.set(extensionId, installedExtension);
        }
      }
    });
  },
});

export default installedExtensionUpdatesListenerInjectable;
