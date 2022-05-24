/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { runManyFor } from "../../common/runnable/run-many-for";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";

const startFrameInjectable = getInjectable({
  id: "start-frame",

  // TODO: Consolidate contents of bootstrap.tsx here
  instantiate: (di) => async () => {
    const beforeFrameStarts = runManyFor(di)(beforeFrameStartsInjectionToken);

    await beforeFrameStarts();
  },
});

export default startFrameInjectable;
