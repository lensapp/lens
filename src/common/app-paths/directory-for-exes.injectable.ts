/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createLazyInitializableState } from "../initializable-state/create-lazy";
import { appPathsInjectionToken } from "./token";

const directoryForExesInjectable = createLazyInitializableState({
  id: "directory-for-exes",
  init: (di) => di.inject(appPathsInjectionToken).get().exe,
});

export default directoryForExesInjectable;
