/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { appPathsInjectionToken } from "../app-path-injection-token";

const directoryForDownloadsInjectable = getInjectable({
  id: "directory-for-downloads",
  instantiate: (di) => di.inject(appPathsInjectionToken).downloads,
});

export default directoryForDownloadsInjectable;
