/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPathsStateInjectable from "./app-paths-state.injectable";

const appPathsInjectable = getInjectable({
  id: "app-paths",
  instantiate: (di) => di.inject(appPathsStateInjectable).get(),
});

export default appPathsInjectable;
