/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createLazyInitializableState } from "../initializable-state/create-lazy";
import { appPathsInjectionToken } from "./token";

const directoryForTempInjectable = createLazyInitializableState({
  id: "directory-for-temp",
  init: (di) => di.inject(appPathsInjectionToken).get().temp,
});

export default directoryForTempInjectable;
