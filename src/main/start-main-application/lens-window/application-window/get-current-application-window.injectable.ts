/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { first } from "lodash/fp";
import { applicationWindowInjectionToken } from "./application-window-injection-token";

const getCurrentApplicationWindowInjectable = getInjectable({
  id: "get-current-application-window",

  instantiate: (di) => () =>
    first(di.injectMany(applicationWindowInjectionToken)),
});

export default getCurrentApplicationWindowInjectable;
