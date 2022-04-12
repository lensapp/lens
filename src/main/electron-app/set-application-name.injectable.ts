/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./electron-app.injectable";

const setApplicationNameInjectable = getInjectable({
  id: "set-application-name",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return (name: string) => {
      app.setName(name);
    };
  },
});

export default setApplicationNameInjectable;
