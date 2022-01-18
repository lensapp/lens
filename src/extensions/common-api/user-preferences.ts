/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { UserStore } from "../../common/user-store";

/**
 * Get the configured kubectl binaries path.
 */
export function getKubectlPath(): string | undefined {
  return UserStore.getInstance().kubectlBinariesPath;
}
