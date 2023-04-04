/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";

const quitAppInjectable = getInjectable({
  id: "quit-app",

  instantiate: (di) => () => {
    const app = di.inject(electronAppInjectable);

    app.quit();
  },
});

export default quitAppInjectable;
