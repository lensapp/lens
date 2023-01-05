/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const focusWindowInjectable = getInjectable({
  id: "focus-window",
  instantiate: () => () => window.focus(),
  causesSideEffects: true,
});

export default focusWindowInjectable;
