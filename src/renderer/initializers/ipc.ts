/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcRendererOn } from "../../common/ipc";
import type { ExtensionLoader } from "../../extensions/extension-loader";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";

export function initIpcRendererListeners(extensionLoader: ExtensionLoader) {
  ipcRendererOn("extension:navigate", (event, extId: string, pageId ?: string, params?: Record<string, any>) => {
    extensionLoader.getInstanceById<LensRendererExtension>(extId).navigate(pageId, params);
  });
}
