/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import { setupableInjectionToken } from "./setupable-injection-token";

export const runSetups = async (di: DiContainer) => {
  await Promise.all(
    di
      .injectMany(setupableInjectionToken)
      .map((setupable) => setupable.runSetup()),
  );
};
