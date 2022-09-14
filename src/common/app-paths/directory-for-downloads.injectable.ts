/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createLazyInitializableState } from "../initializable-state/create-lazy";
import { appPathsInjectionToken } from "./token";

const directoryForDownloadsInjectable = createLazyInitializableState({
  id: "directory-for-downloads",
  init: (di) => di.inject(appPathsInjectionToken).get().downloads,
});

export default directoryForDownloadsInjectable;
