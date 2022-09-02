/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJsonInjectable from "./package-json.injectable";

const appVersionInjectable = getInjectable({
  id: "app-version",
  instantiate: (di) => di.inject(packageJsonInjectable).version,
});

export default appVersionInjectable;
