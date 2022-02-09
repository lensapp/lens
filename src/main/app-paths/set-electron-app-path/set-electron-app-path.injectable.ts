/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PathName } from "../../../common/app-paths/app-path-names";
import electronAppInjectable from "../get-electron-app-path/electron-app/electron-app.injectable";

const setElectronAppPathInjectable = getInjectable({
  id: "set-electron-app-path",

  instantiate: (di) => (name: PathName, path: string) : void =>
    di.inject(electronAppInjectable).setPath(name, path),
});

export default setElectronAppPathInjectable;
