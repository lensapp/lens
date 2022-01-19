/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ExtensionDiscovery } from "../../../../../extensions/extension-discovery/extension-discovery";
import { sanitizeExtensionName } from "../../../../../extensions/lens-extension";
import path from "path";

interface Dependencies {
  extensionDiscovery: ExtensionDiscovery;
}

export const getExtensionDestFolder =
  ({ extensionDiscovery }: Dependencies) =>
    (name: string) =>
      path.join(extensionDiscovery.localFolderPath, sanitizeExtensionName(name));
