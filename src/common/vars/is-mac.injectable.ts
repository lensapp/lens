/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isMac } from "../vars";

const isMacInjectable = getInjectable({
  id: "is-mac",
  instantiate: () => isMac,
  causesSideEffects: true,
});

export default isMacInjectable;
