/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "../../common/runnable/run-many-for";

export const beforeFrameStartsInjectionToken = getInjectionToken<Runnable>({
  id: "before-frame-starts",
});
