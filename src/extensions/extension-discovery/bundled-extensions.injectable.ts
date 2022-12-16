/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { InstalledExtension } from "./extension-discovery";

const bundledExtensionsInjectable = getInjectable({
  id: "bundled-extensions",
  instantiate: (): InstalledExtension[] => [],
});

export default bundledExtensionsInjectable;
