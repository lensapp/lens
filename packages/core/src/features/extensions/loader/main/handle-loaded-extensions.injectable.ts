/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRequestChannelListenerInjectable } from "../../../../main/utils/channel/channel-listeners/listener-tokens";
import installedExtensionsInjectable from "../../common/installed-extensions.injectable";
import { loadedExtensionsChannel } from "../common/channels";

const handleLoadedExtensionRequestsInjectable = getRequestChannelListenerInjectable({
  channel: loadedExtensionsChannel,
  handler: (di) => {
    const installedExtensions = di.inject(installedExtensionsInjectable);

    return () => installedExtensions.toJSON();
  },
});

export default handleLoadedExtensionRequestsInjectable;
