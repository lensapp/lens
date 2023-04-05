/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";

const forceAppExitInjectable = getInjectable({
  id: "force-app-exit",

  instantiate: (di) => () => {
    const app = di.inject(electronAppInjectable);

    app.exit(0);
  },
});

export default forceAppExitInjectable;
