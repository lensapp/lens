/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { PathName } from "../../../common/app-paths/app-paths";
import electronAppInjectable from "../get-electron-app-path/electron-app/electron-app.injectable";

const setElectronAppPathInjectable = getInjectable({
  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return (name: PathName, path: string): void => {
      app.setPath(name, path);
    };
  },

  lifecycle: lifecycleEnum.singleton,
});

export default setElectronAppPathInjectable;
