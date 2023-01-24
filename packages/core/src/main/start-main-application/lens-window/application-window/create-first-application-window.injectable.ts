/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createApplicationWindowInjectable from "./create-application-window.injectable";

// Note: Motivation is to create the window with same ID to use stored dimensions
const createFirstApplicationWindowInjectable = getInjectable({
  id: "create-first-application-window",

  instantiate: (di) => {
    const createApplicationWindow = di.inject(createApplicationWindowInjectable);

    return () => createApplicationWindow("first-application-window");
  },
});

export default createFirstApplicationWindowInjectable;
