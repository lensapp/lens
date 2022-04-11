/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "../run-many-for";
import type { Event } from "electron";

export const onApplicationSoftQuitInjectionToken = getInjectionToken<
  Runnable<{ event: Event }>
>({
  id: "on-application-soft-quit",
});
