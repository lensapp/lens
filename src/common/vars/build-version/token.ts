/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { InitializableState } from "../../initializable-state/create";

export const buildVersionInjectionToken = getInjectionToken<InitializableState<string>>({
  id: "build-version-token",
});
