/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { initializeAppInjectionToken } from "./tokens";

const initializeAppInjectable = getInjectable({
  id: "initialize-app",
  instantiate: (di) => {
    const options = di.injectMany(initializeAppInjectionToken);

    if (options.length === 0) {
      throw new Error("No intializeApp registered");
    }

    const intializeApp = options.find(opt => opt.isActive);
    const howManyActive = options.reduce((count, cur) => count + +cur.isActive, 0);

    if (!intializeApp) {
      throw new Error("No initializeApp registrations are active");
    }

    if (howManyActive > 1) {
      throw new Error("Too many initiazlizeApp registrations are active");
    }

    return intializeApp.init;
  },
});

export default initializeAppInjectable;
