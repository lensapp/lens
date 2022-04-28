/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { RunnableSync } from "../run-many-sync-for";

export const beforeApplicationIsReadyInjectionToken =
  getInjectionToken<RunnableSync>({
    id: "before-application-is-ready",
  });
