/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const chromeVersionInjectable = getInjectable({
  id: "chrome-version",
  instantiate: () => process.versions.chrome,
  causesSideEffects: true,
});

export default chromeVersionInjectable;
