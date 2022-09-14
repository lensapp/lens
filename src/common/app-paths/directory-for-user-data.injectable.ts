/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createLazyInitializableState } from "../initializable-state/create-lazy";
import { appPathsInjectionToken } from "./token";

const directoryForUserDataInjectable = createLazyInitializableState({
  id: "directory-for-user-data",
  init: (di) => di.inject(appPathsInjectionToken).get().userData,
});

export default directoryForUserDataInjectable;
