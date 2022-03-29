/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";

export interface Setupable {
  runSetup: () => Promise<void> | void;
}

export const setupableInjectionToken = getInjectionToken<Setupable>({
  id: "setupable-injection-token",
});
