/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getMessageChannelListenerInjectable } from "@k8slens/messaging";
import extensionLoaderInjectable from "../../../../extensions/extension-loader/extension-loader.injectable";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { navigateForExtensionChannel } from "../common/channel";

const navigateForExtensionListenerInjectable = getMessageChannelListenerInjectable({
  channel: navigateForExtensionChannel,
  id: "renderer",
  getHandler: (di) => {
    const extensionLoader = di.inject(extensionLoaderInjectable);

    return ({ extId, pageId, params }) => {
      const extension = extensionLoader.getInstanceById(extId) as LensRendererExtension | undefined;

      if (extension) {
        extension.navigate(pageId, params);
      }
    };
  },
});

export default navigateForExtensionListenerInjectable;
