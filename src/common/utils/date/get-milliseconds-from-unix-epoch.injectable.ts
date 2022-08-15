/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const getMillisecondsFromUnixEpochInjectable = getInjectable({
  id: "get-milliseconds-from-unix-epoch",
  instantiate: () => () => Date.now(),
  causesSideEffects: true,
});

export default getMillisecondsFromUnixEpochInjectable;
