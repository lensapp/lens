/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app/electron-app.injectable";
import { getElectronAppPath } from "./get-electron-app-path";

const getElectronAppPathInjectable = getInjectable({
  id: "get-electron-app-path",

  instantiate: (di) => getElectronAppPath({
    app: di.inject(electronAppInjectable),
  }),
});

export default getElectronAppPathInjectable;
