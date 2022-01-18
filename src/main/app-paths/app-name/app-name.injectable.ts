/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import electronAppInjectable from "../get-electron-app-path/electron-app/electron-app.injectable";

const appNameInjectable = getInjectable({
  instantiate: (di) => di.inject(electronAppInjectable).name,
  lifecycle: lifecycleEnum.singleton,
});

export default appNameInjectable;
