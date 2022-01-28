/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { appPathsInjectionToken } from "./app-path-injection-token";

const directoryForUserDataInjectable = getInjectable({
  instantiate: (di) => di.inject(appPathsInjectionToken).userData,
  lifecycle: lifecycleEnum.singleton,
});

export default directoryForUserDataInjectable;
