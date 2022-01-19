/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app/electron-app.injectable";
import { getElectronAppPath } from "./get-electron-app-path";

const getElectronAppPathInjectable = getInjectable({
  instantiate: (di) =>
    getElectronAppPath({ app: di.inject(electronAppInjectable) }),

  lifecycle: lifecycleEnum.singleton,
});

export default getElectronAppPathInjectable;
