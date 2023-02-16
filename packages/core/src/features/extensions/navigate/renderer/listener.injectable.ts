/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "../../../../common/utils/channel/message-channel-listener-injection-token";
import extensionInstancesInjectable from "../../../../extensions/extension-loader/extension-instances.injectable";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { navigateForExtensionChannel } from "../common/channel";

const navigateForExtensionListenerInjectable = getMessageChannelListenerInjectable({
  channel: navigateForExtensionChannel,
  id: "main",
  handler: (di) => {
    const extensionInstances = di.inject(extensionInstancesInjectable);

    return ({ extId, pageId, params }) => {
      const extension = extensionInstances.get(extId);

      if (extension) {
        (extension as LensRendererExtension).navigate(pageId, params);
      }
    };
  },
});

export default navigateForExtensionListenerInjectable;
