/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

export const allPlatforms = ["win32", "darwin", "linux"] as const;

const platformInjectable = getInjectable({
  id: "platform",
  instantiate: () => process.platform as typeof allPlatforms[number],
  causesSideEffects: true,
});

export default platformInjectable;
