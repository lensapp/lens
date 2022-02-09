/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { appPathsInjectionToken } from "../app-path-injection-token";

const directoryForUserDataInjectable = getInjectable({
  id: "directory-for-user-data",
  instantiate: (di) => di.inject(appPathsInjectionToken).userData,
});

export default directoryForUserDataInjectable;
