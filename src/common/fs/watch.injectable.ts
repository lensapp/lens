/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { watch } from "chokidar";

const watchInjectable = getInjectable({
  id: "watch",
  instantiate: () => watch,
  causesSideEffects: true,
});

export default watchInjectable;
