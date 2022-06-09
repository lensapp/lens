/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ipcRendererOn } from "../../common/ipc";
import type { ExtensionLoader } from "../../extensions/extension-loader";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";

export function initIpcRendererListeners(extensionLoader: ExtensionLoader) {
  ipcRendererOn("extension:navigate", (event, { extId, pageId, params }: { extId: string; pageId: string | undefined; params: Partial<Record<string, string>> | undefined }) => {
    const ext = extensionLoader.getInstanceById(extId) as LensRendererExtension | undefined;

    ext?.navigate(pageId, params);
  });
}
