/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";

const waitForElectronToBeReadyInjectable = getInjectable({
  id: "wait-for-electron-to-be-ready",

  instantiate: (di) => () => di.inject(electronAppInjectable).whenReady(),
});

export default waitForElectronToBeReadyInjectable;
