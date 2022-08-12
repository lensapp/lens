/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getMillisecondsFromUnixEpochInjectable from "./get-milliseconds-from-unix-epoch.injectable";

const getSecondsFromUnixEpochInjectable = getInjectable({
  id: "get-seconds-from-unix-epoch",
  instantiate: (di) => {
    const getMilisecondsFromUnixEpoch = di.inject(getMillisecondsFromUnixEpochInjectable);

    return () => Math.floor(getMilisecondsFromUnixEpoch() / 1000);
  },
});

export default getSecondsFromUnixEpochInjectable;
