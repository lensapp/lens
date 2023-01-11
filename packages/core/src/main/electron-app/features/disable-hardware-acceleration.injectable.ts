/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../electron-app.injectable";

const disableHardwareAccelerationInjectable = getInjectable({
  id: "disable-hardware-acceleration",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);

    return () => {
      app.disableHardwareAcceleration();
    };
  },
});

export default disableHardwareAccelerationInjectable;
