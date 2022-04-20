/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Runnable } from "../run-many-for";

export interface ActivationArgs {
  windowIsVisible: boolean;
}

export const afterApplicationActivationInjectionToken = getInjectionToken<Runnable<ActivationArgs>>({
  id: "after-application-activation",
});
